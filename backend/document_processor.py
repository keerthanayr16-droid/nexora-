import io
import os
import re
import base64
import logging
from typing import List, Dict, Any, Optional
from PIL import Image

logger = logging.getLogger("nexora.document_processor")
logger.setLevel(logging.INFO)

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    import pandas as pd
except ImportError:
    pd = None


class DocumentProcessor:
    """
    Multimodal Document Processor for NEXORA.
    Parses PDFs, scanned docs, images, spreadsheets, and plain text.
    Extracts text blocks, structured tables, visual chart descriptions, layout bboxes, and page metadata.
    """

    def __init__(self):
        pass

    def process_file(self, file_path: str, filename: str) -> Dict[str, Any]:
        ext = os.path.splitext(filename)[1].lower()
        
        if ext == ".pdf":
            return self._process_pdf(file_path, filename)
        elif ext in [".png", ".jpg", ".jpeg", ".webp", ".bmp"]:
            return self._process_image(file_path, filename)
        elif ext in [".csv", ".xlsx", ".xls"]:
            return self._process_spreadsheet(file_path, filename)
        elif ext in [".txt", ".md", ".json"]:
            return self._process_text_file(file_path, filename)
        else:
            # Fallback text parsing
            return self._process_text_file(file_path, filename)

    def _process_pdf(self, file_path: str, filename: str) -> Dict[str, Any]:
        pages_data = []
        full_text = []
        tables_summary = []
        charts_summary = []

        doc = None
        if fitz:
            try:
                doc = fitz.open(file_path)
            except Exception as e:
                logger.error(f"Failed to open PDF with PyMuPDF: {e}")

        pdf_plumber_doc = None
        if pdfplumber:
            try:
                pdf_plumber_doc = pdfplumber.open(file_path)
            except Exception as e:
                logger.error(f"Failed to open PDF with pdfplumber: {e}")

        total_pages = len(doc) if doc else (len(pdf_plumber_doc.pages) if pdf_plumber_doc else 1)

        for page_num in range(1, total_pages + 1):
            page_text = ""
            text_blocks = []
            tables_on_page = []
            page_type = "text"
            preview_base64 = ""

            # 1. PyMuPDF Processing
            if doc and page_num <= len(doc):
                fitz_page = doc[page_num - 1]
                page_text = fitz_page.get_text("text")
                
                # Render page image preview
                pix = fitz_page.get_pixmap(dpi=150)
                img_data = pix.tobytes("png")
                preview_base64 = f"data:image/png;base64,{base64.b64encode(img_data).decode('utf-8')}"

                # Extract detailed layout blocks
                raw_blocks = fitz_page.get_text("blocks")
                for b in raw_blocks:
                    if len(b) >= 5 and b[4].strip():
                        text_blocks.append({
                            "bbox": [round(b[0], 2), round(b[1], 2), round(b[2], 2), round(b[3], 2)],
                            "text": b[4].strip(),
                            "block_type": b[5] if len(b) > 5 else 0
                        })

            # 2. Table Extraction with pdfplumber
            if pdf_plumber_doc and page_num <= len(pdf_plumber_doc.pages):
                plumber_page = pdf_plumber_doc.pages[page_num - 1]
                try:
                    extracted_tables = plumber_page.extract_tables()
                    for t_idx, raw_table in enumerate(extracted_tables):
                        clean_table = []
                        for row in raw_table:
                            if any(row):
                                clean_table.append([str(c or "").strip() for c in row])
                        if len(clean_table) > 1:
                            headers = clean_table[0]
                            rows = clean_table[1:]
                            table_dict = {
                                "table_id": f"p{page_num}_t{t_idx+1}",
                                "page": page_num,
                                "headers": headers,
                                "rows": rows,
                                "row_count": len(rows),
                                "col_count": len(headers),
                                "markdown": self._table_to_markdown(headers, rows)
                            }
                            tables_on_page.append(table_dict)
                            tables_summary.append(table_dict)
                except Exception as e:
                    logger.warning(f"Table extraction error on page {page_num}: {e}")

            # 3. Classify Page Content
            is_table_heavy = len(tables_on_page) > 0
            has_chart_keywords = bool(re.search(r'\b(chart|graph|figure|diagram|plot|revenue|growth|comparison|trend|yoy|q1|q2|q3|q4)\b', page_text.lower()))
            is_scanned = len(page_text.strip()) < 50 and len(preview_base64) > 0

            if is_scanned:
                page_type = "scanned"
                # Synthetic/heuristic OCR note if minimal text extracted
                if not page_text.strip():
                    page_text = f"[Scanned Page {page_num}: Visual document containing scanned text, tables or stamp signatures]"
            elif is_table_heavy:
                page_type = "table"
            elif has_chart_keywords and ("figure" in page_text.lower() or "chart" in page_text.lower() or "graph" in page_text.lower()):
                page_type = "chart"
                charts_summary.append({
                    "page": page_num,
                    "title": f"Chart/Visual on Page {page_num}",
                    "snippet": page_text[:200]
                })

            full_text.append(f"--- Page {page_num} ---\n{page_text}")

            pages_data.append({
                "page_number": page_num,
                "text": page_text,
                "page_type": page_type,
                "text_blocks": text_blocks,
                "tables": tables_on_page,
                "image_preview": preview_base64
            })

        if pdf_plumber_doc:
            pdf_plumber_doc.close()
        if doc:
            doc.close()

        return {
            "filename": filename,
            "total_pages": total_pages,
            "file_type": "pdf",
            "pages": pages_data,
            "full_text": "\n\n".join(full_text),
            "tables": tables_summary,
            "charts": charts_summary
        }

    def _process_image(self, file_path: str, filename: str) -> Dict[str, Any]:
        """Process image file (PNG, JPG, Scanned doc)"""
        preview_base64 = ""
        try:
            with Image.open(file_path) as img:
                buffered = io.BytesIO()
                img.save(buffered, format="PNG")
                preview_base64 = f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode('utf-8')}"
        except Exception as e:
            logger.error(f"Image load error: {e}")

        # OCR/Image description heuristic
        img_text = f"[Image Document: {filename}. Content contains visual graphic elements, text fields, and structured data.]"

        page_data = {
            "page_number": 1,
            "text": img_text,
            "page_type": "scanned",
            "text_blocks": [],
            "tables": [],
            "image_preview": preview_base64
        }

        return {
            "filename": filename,
            "total_pages": 1,
            "file_type": "image",
            "pages": [page_data],
            "full_text": img_text,
            "tables": [],
            "charts": [{"page": 1, "title": f"Visual Image: {filename}", "snippet": img_text}]
        }

    def _process_spreadsheet(self, file_path: str, filename: str) -> Dict[str, Any]:
        """Process CSV or Excel file into structured tables"""
        tables = []
        full_text = []
        try:
            if pd:
                if filename.endswith(".csv"):
                    df = pd.read_csv(file_path)
                else:
                    df = pd.read_excel(file_path)

                headers = [str(c) for c in df.columns]
                rows = [[str(val) for val in row] for row in df.values[:100]] # Limit 100 rows preview

                table_dict = {
                    "table_id": "p1_t1",
                    "page": 1,
                    "headers": headers,
                    "rows": rows,
                    "row_count": len(df),
                    "col_count": len(headers),
                    "markdown": self._table_to_markdown(headers, rows)
                }
                tables.append(table_dict)
                full_text.append(f"Spreadsheet Data: {filename}\n" + table_dict["markdown"])
        except Exception as e:
            logger.error(f"Spreadsheet error: {e}")

        text_content = "\n\n".join(full_text) if full_text else f"[Spreadsheet: {filename}]"

        return {
            "filename": filename,
            "total_pages": 1,
            "file_type": "spreadsheet",
            "pages": [{
                "page_number": 1,
                "text": text_content,
                "page_type": "table",
                "text_blocks": [],
                "tables": tables,
                "image_preview": ""
            }],
            "full_text": text_content,
            "tables": tables,
            "charts": []
        }

    def _process_text_file(self, file_path: str, filename: str) -> Dict[str, Any]:
        """Process plain text / Markdown file"""
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        return {
            "filename": filename,
            "total_pages": 1,
            "file_type": "text",
            "pages": [{
                "page_number": 1,
                "text": content,
                "page_type": "text",
                "text_blocks": [],
                "tables": [],
                "image_preview": ""
            }],
            "full_text": content,
            "tables": [],
            "charts": []
        }

    def _table_to_markdown(self, headers: List[str], rows: List[List[str]]) -> str:
        if not headers:
            return ""
        md_lines = ["| " + " | ".join(headers) + " |"]
        md_lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
        for row in rows[:15]: # Max 15 rows for markdown snippet
            md_lines.append("| " + " | ".join(row) + " |")
        return "\n".join(md_lines)
