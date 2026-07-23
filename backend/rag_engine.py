import re
import math
from typing import List, Dict, Any, Tuple
import logging

logger = logging.getLogger("nexora.rag_engine")

class DocumentChunk:
    def __init__(self, doc_id: str, filename: str, page_number: int, section: str, text: str, content_type: str = "text", table_data: Any = None, bbox: Any = None):
        self.chunk_id = f"{doc_id}_p{page_number}_{hash(text[:50]) & 0xffffffff}"
        self.doc_id = doc_id
        self.filename = filename
        self.page_number = page_number
        self.section = section
        self.text = text
        self.content_type = content_type
        self.table_data = table_data
        self.bbox = bbox

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "doc_id": self.doc_id,
            "filename": self.filename,
            "page_number": self.page_number,
            "section": self.section,
            "text": self.text,
            "content_type": self.content_type,
            "table_data": self.table_data,
            "bbox": self.bbox
        }

class RAGEngine:
    """
    RAG & Vector Retrieval Engine for NEXORA.
    Supports multi-document chunking, metadata indexing, TF-IDF + BM25 keyword matching, and similarity scoring.
    """

    def __init__(self):
        self.chunks: List[DocumentChunk] = []
        self.vocab: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}

    def index_document(self, doc_id: str, parsed_doc: Dict[str, Any]):
        filename = parsed_doc.get("filename", "document.pdf")
        pages = parsed_doc.get("pages", [])

        # Remove previous chunks for doc_id if re-indexing
        self.chunks = [c for c in self.chunks if c.doc_id != doc_id]

        new_chunks = []
        for page in pages:
            page_num = page.get("page_number", 1)
            text = page.get("text", "")
            page_type = page.get("page_type", "text")
            tables = page.get("tables", [])

            # Index Tables as dedicated chunks with rich metadata
            for t in tables:
                table_md = t.get("markdown", "")
                if table_md:
                    table_chunk = DocumentChunk(
                        doc_id=doc_id,
                        filename=filename,
                        page_number=page_num,
                        section=f"Page {page_num} Table Data",
                        text=f"Table Data on Page {page_num}:\n{table_md}",
                        content_type="table",
                        table_data=t
                    )
                    new_chunks.append(table_chunk)

            # Smart text chunking by paragraph / section headers
            sections = re.split(r'\n(?=[A-Z0-9\.\s]{3,40}\n|\b(?:Header|Section|Chapter|Part|Financial|Revenue|Risk|Overview)\b)', text)
            current_section = f"Page {page_num} Content"

            for sec in sections:
                sec_text = sec.strip()
                if not sec_text:
                    continue

                # Extract potential heading line
                lines = sec_text.split('\n')
                if len(lines[0]) < 60 and not lines[0].endswith('.'):
                    current_section = lines[0].strip()

                # Split large sections into ~400 char overlapping chunks
                if len(sec_text) > 500:
                    sub_chunks = self._sliding_window_chunks(sec_text, window_size=400, overlap=80)
                    for sub in sub_chunks:
                        new_chunks.append(DocumentChunk(
                            doc_id=doc_id,
                            filename=filename,
                            page_number=page_num,
                            section=current_section,
                            text=sub,
                            content_type=page_type
                        ))
                else:
                    new_chunks.append(DocumentChunk(
                        doc_id=doc_id,
                        filename=filename,
                        page_number=page_num,
                        section=current_section,
                        text=sec_text,
                        content_type=page_type
                    ))

        self.chunks.extend(new_chunks)
        self._rebuild_tfidf_index()
        logger.info(f"Indexed {len(new_chunks)} chunks for document '{filename}' (ID: {doc_id}). Total chunks in index: {len(self.chunks)}")

    def _sliding_window_chunks(self, text: str, window_size: int = 400, overlap: int = 80) -> List[str]:
        chunks = []
        start = 0
        while start < len(text):
            end = min(start + window_size, len(text))
            chunk_str = text[start:end].strip()
            if chunk_str:
                chunks.append(chunk_str)
            if end >= len(text):
                break
            start += window_size - overlap
        return chunks

    def _tokenize(self, text: str) -> List[str]:
        return [w.lower() for w in re.findall(r'\b\w{2,}\b', text)]

    def _rebuild_tfidf_index(self):
        doc_count = len(self.chunks)
        if doc_count == 0:
            return

        df_map: Dict[str, int] = {}
        for chunk in self.chunks:
            tokens = set(self._tokenize(chunk.text))
            for tok in tokens:
                df_map[tok] = df_map.get(tok, 0) + 1

        self.idf = {tok: math.log((doc_count + 1) / (df + 1)) + 1.0 for tok, df in df_map.items()}

    def search(self, query: str, doc_ids: Optional[List[str]] = None, top_k: int = 5) -> List[Tuple[DocumentChunk, float]]:
        """
        Hybrid retrieval scoring query against indexed document chunks.
        """
        if not self.chunks:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        scores: List[Tuple[DocumentChunk, float]] = []

        for chunk in self.chunks:
            if doc_ids and chunk.doc_id not in doc_ids:
                continue

            chunk_tokens = self._tokenize(chunk.text)
            chunk_token_counts: Dict[str, int] = {}
            for tok in chunk_tokens:
                chunk_token_counts[tok] = chunk_token_counts.get(tok, 0) + 1

            # Compute BM25 / TF-IDF hybrid match score
            score = 0.0
            for q_tok in query_tokens:
                if q_tok in chunk_token_counts:
                    tf = chunk_token_counts[q_tok]
                    idf_val = self.idf.get(q_tok, 1.5)
                    score += (tf * idf_val) / (tf + 1.2)

            # Boost exact phrase matches
            if query.lower() in chunk.text.lower():
                score += 5.0

            # Boost table / chart chunks for queries with quantitative terms
            if any(k in query.lower() for k in ["revenue", "profit", "growth", "growth rate", "highest", "lowest", "table", "compare", "chart", "average", "total", "margin"]):
                if chunk.content_type in ["table", "chart"]:
                    score *= 1.35

            if score > 0.01:
                scores.append((chunk, score))

        # Sort descending by score
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]

    def remove_document(self, doc_id: str):
        self.chunks = [c for c in self.chunks if c.doc_id != doc_id]
        self._rebuild_tfidf_index()
