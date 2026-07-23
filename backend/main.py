import os
import uuid
import shutil
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from document_processor import DocumentProcessor
from rag_engine import RAGEngine
from agent_orchestrator import AgentOrchestrator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexora.main")

app = FastAPI(
    title="NEXORA API — Multimodal Document Intelligence System",
    description="AI-powered backend for document understanding, RAG retrieval, page citations, table analytics, and comparison.",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories setup
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Core Engine Instances
doc_processor = DocumentProcessor()
rag_engine = RAGEngine()
agent_orchestrator = AgentOrchestrator(rag_engine=rag_engine)

# In-Memory Store
DOCUMENTS_STORE: Dict[str, Dict[str, Any]] = {}

# Pydantic Schemas
class ChatRequest(BaseModel):
    query: str
    doc_ids: List[str]

class CompareRequest(BaseModel):
    doc_ids: List[str]

class ExtractRequest(BaseModel):
    doc_id: str

@app.get("/api/health")
def health_check():
    return {"status": "online", "app": "NEXORA Document Intelligence Platform", "active_docs": len(DOCUMENTS_STORE)}

@app.get("/api/documents")
def list_documents():
    return [
        {
            "id": doc_id,
            "filename": doc["filename"],
            "total_pages": doc["total_pages"],
            "file_type": doc["file_type"],
            "page_breakdown": doc.get("page_breakdown", {}),
            "table_count": len(doc.get("tables", [])),
            "chart_count": len(doc.get("charts", []))
        }
        for doc_id, doc in DOCUMENTS_STORE.items()
    ]

@app.get("/api/document/{doc_id}")
def get_document(doc_id: str):
    if doc_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    return DOCUMENTS_STORE[doc_id]

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    doc_id = str(uuid.uuid4())[:8]
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process document
        parsed_doc = doc_processor.process_file(file_path, file.filename)
        parsed_doc["id"] = doc_id
        parsed_doc["file_path"] = file_path
        
        # Calculate Page Breakdown stats
        page_types = {}
        for p in parsed_doc.get("pages", []):
            pt = p.get("page_type", "text")
            page_types[pt] = page_types.get(pt, 0) + 1
        parsed_doc["page_breakdown"] = page_types

        # Index in RAG Engine
        rag_engine.index_document(doc_id, parsed_doc)
        
        # Save to store
        DOCUMENTS_STORE[doc_id] = parsed_doc
        
        logger.info(f"Uploaded & processed file: {file.filename} (ID: {doc_id})")
        return {
            "id": doc_id,
            "filename": file.filename,
            "total_pages": parsed_doc["total_pages"],
            "file_type": parsed_doc["file_type"],
            "page_breakdown": page_types,
            "status": "ready"
        }
    except Exception as e:
        logger.error(f"Error processing upload: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@app.delete("/api/document/{doc_id}")
def delete_document(doc_id: str):
    if doc_id in DOCUMENTS_STORE:
        rag_engine.remove_document(doc_id)
        doc_info = DOCUMENTS_STORE.pop(doc_id)
        if os.path.exists(doc_info.get("file_path", "")):
            try:
                os.remove(doc_info["file_path"])
            except:
                pass
        return {"status": "deleted", "id": doc_id}
    raise HTTPException(status_code=404, detail="Document not found")

@app.post("/api/chat")
def chat_with_docs(req: ChatRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    doc_ids = req.doc_ids if req.doc_ids else list(DOCUMENTS_STORE.keys())
    if not doc_ids:
        raise HTTPException(status_code=400, detail="No documents uploaded or selected for chat")

    response = agent_orchestrator.process_query(
        query=req.query,
        active_doc_ids=doc_ids,
        doc_store=DOCUMENTS_STORE
    )

    return response

@app.post("/api/compare")
def compare_documents(req: CompareRequest):
    if len(req.doc_ids) < 2:
        raise HTTPException(status_code=400, detail="Please select at least 2 documents to compare")
    
    response = agent_orchestrator.process_query(
        query="Compare the financial metrics, revenue, risks, and overall performance across these documents.",
        active_doc_ids=req.doc_ids,
        doc_store=DOCUMENTS_STORE
    )
    return response

@app.post("/api/extract")
def extract_structured_data(req: ExtractRequest):
    if req.doc_id not in DOCUMENTS_STORE:
        raise HTTPException(status_code=404, detail="Document not found")
    
    response = agent_orchestrator.process_query(
        query="Extract all invoice details, financial metrics, dates, amounts, and company details.",
        active_doc_ids=[req.doc_id],
        doc_store=DOCUMENTS_STORE
    )
    return response

@app.post("/api/load-sample-data")
def load_sample_data():
    """Initializes rich pre-loaded sample documents so the user can test NEXORA immediately!"""
    sample_1_id = "sample_techcorp_2024"
    sample_2_id = "sample_ai_research_paper"

    # Sample 1: TechCorp Annual Financial Report
    sample_1_pages = [
        {
            "page_number": 1,
            "text": "NEXORA TECH CORP - 2024 ANNUAL FINANCIAL REPORT\n\nExecutive Overview:\nTech Corp delivered exceptional operational and financial results in 2024. Total revenue reached ₹200 Crore, representing a 25% YoY increase compared to ₹160 Crore in 2023. Operating profit margin expanded to 30%, driven by enterprise cloud adoption and AI document processing solutions.",
            "page_type": "text",
            "tables": [],
            "image_preview": ""
        },
        {
            "page_number": 2,
            "text": "Financial Metrics Breakdown (2022 - 2024):\nBelow is the annual financial table illustrating key performance indicators across fiscal years.",
            "page_type": "table",
            "tables": [{
                "table_id": "p2_t1",
                "page": 2,
                "headers": ["Metric", "FY 2022", "FY 2023", "FY 2024"],
                "rows": [
                    ["Revenue (Cr)", "₹100", "₹160", "₹200"],
                    ["Net Profit (Cr)", "₹20", "₹40", "₹60"],
                    ["R&D Investment (Cr)", "₹15", "₹25", "₹40"],
                    ["Active Customers", "1,200", "3,500", "8,900"]
                ],
                "row_count": 4,
                "col_count": 4,
                "markdown": "| Metric | FY 2022 | FY 2023 | FY 2024 |\n| --- | --- | --- | --- |\n| Revenue (Cr) | ₹100 | ₹160 | ₹200 |\n| Net Profit (Cr) | ₹20 | ₹40 | ₹60 |\n| R&D Investment (Cr) | ₹15 | ₹25 | ₹40 |\n| Active Customers | 1,200 | 3,500 | 8,900 |"
            }],
            "image_preview": ""
        },
        {
            "page_number": 3,
            "text": "Risk Factors & Industry Analysis:\nKey risks include macroeconomic inflation, GPU supply chain lead times, and regulatory compliance changes in regional data privacy. Mitigation strategies include multi-region cloud deployment and proprietary local embedding models.",
            "page_type": "chart",
            "tables": [],
            "image_preview": ""
        }
    ]

    doc_1 = {
        "id": sample_1_id,
        "filename": "TechCorp_2024_Annual_Report.pdf",
        "total_pages": 3,
        "file_type": "pdf",
        "pages": sample_1_pages,
        "full_text": "\n\n".join([p["text"] for p in sample_1_pages]),
        "tables": [sample_1_pages[1]["tables"][0]],
        "charts": [{"page": 3, "title": "Revenue Trend Graph", "snippet": "Revenue shows consistent upward trajectory from 2022 to 2024."}],
        "page_breakdown": {"text": 1, "table": 1, "chart": 1}
    }

    # Sample 2: AI Research Paper
    sample_2_pages = [
        {
            "page_number": 1,
            "text": "MULTIMODAL DOCUMENT INTELLIGENCE VIA HYBRID RAG & VISION-LLMs\n\nAbstract:\nWe present NEXORA Architecture, a framework combining layout-aware PyMuPDF parsing, BM25 dense vector retrieval, and vision-language agents. Our experiments demonstrate a 42% improvement in page citation accuracy over standard text-only RAG pipelines.",
            "page_type": "text",
            "tables": [],
            "image_preview": ""
        },
        {
            "page_number": 2,
            "text": "Experimental Results & Benchmark Comparison Table:\nComparing retrieval benchmark scores across document processing algorithms.",
            "page_type": "table",
            "tables": [{
                "table_id": "p2_t1",
                "page": 2,
                "headers": ["Framework", "Accuracy (%)", "Citation Precision", "Latency (ms)"],
                "rows": [
                    ["Vanilla LLM RAG", "64.2%", "52.0%", "1,200"],
                    ["OCR-Only Pipeline", "71.5%", "68.4%", "2,400"],
                    ["NEXORA Multimodal RAG", "94.8%", "96.2%", "450"]
                ],
                "row_count": 3,
                "col_count": 4,
                "markdown": "| Framework | Accuracy (%) | Citation Precision | Latency (ms) |\n| --- | --- | --- | --- |\n| Vanilla LLM RAG | 64.2% | 52.0% | 1,200 |\n| OCR-Only Pipeline | 71.5% | 68.4% | 2,400 |\n| NEXORA Multimodal RAG | 94.8% | 96.2% | 450 |"
            }],
            "image_preview": ""
        }
    ]

    doc_2 = {
        "id": sample_2_id,
        "filename": "Multimodal_Doc_AI_Research_Paper.pdf",
        "total_pages": 2,
        "file_type": "pdf",
        "pages": sample_2_pages,
        "full_text": "\n\n".join([p["text"] for p in sample_2_pages]),
        "tables": [sample_2_pages[1]["tables"][0]],
        "charts": [],
        "page_breakdown": {"text": 1, "table": 1}
    }

    DOCUMENTS_STORE[sample_1_id] = doc_1
    DOCUMENTS_STORE[sample_2_id] = doc_2

    rag_engine.index_document(sample_1_id, doc_1)
    rag_engine.index_document(sample_2_id, doc_2)

    return {"status": "loaded", "count": 2, "sample_docs": [sample_1_id, sample_2_id]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
