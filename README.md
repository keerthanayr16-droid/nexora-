# NEXORA — Multimodal Document Intelligence Platform

> **Understand. Explore. Discover.**  
> An AI-powered document intelligence system capable of understanding plain text, scanned documents, tables, charts, graphs, diagrams, and multi-document comparisons with exact page citations and visual source highlighting.

---

## 🌐 Permanent Production Live Links

- 🚀 **Permanent Production Web App (Vercel)**: **[https://nexora-doc-ai.vercel.app](https://nexora-doc-ai.vercel.app)**
- ⚡ **Local Dev Web App**: `http://localhost:5173`
- ⚙️ **FastAPI Backend API**: `http://127.0.0.1:8000`

---

## 💻 Programming Languages & Technology Stack

| Language / Framework | Category | Purpose in NEXORA |
| :--- | :--- | :--- |
| **TypeScript** | Frontend Core | React 19 SPA, Type-Safe State Management, Recharts Visualizations |
| **Python 3.14** | Backend Engine | FastAPI REST Server, PyMuPDF Layout Parsing, Pandas Table Analytics, RAG Engine |
| **Tailwind CSS v4** | UI Design System | Custom Midnight Azure Theme, Glassmorphism, Glow Animations |
| **HTML5 / Canvas** | Document Viewer | Multi-page PDF Rendering, Page Citation Overlays & Bounding Box Highlights |
| **JSON / Docker / YAML**| Cloud Manifests | Vercel Deployment (`vercel.json`), Dockerfile, and Render (`render.yaml`) |

---

## 🔥 Key System Features

1. **Multimodal Document Ingestion & Classification**:
   - Classifies each page as `Text`, `Table`, `Chart`, `Diagram`, or `Scanned Image`.
   - Layout-aware text extraction with PyMuPDF (`fitz`).
   - Table detection & relational DataFrame conversion via `pdfplumber` and `pandas`.

2. **Smart 2-Step Document Processing Pipeline**:
   - **Step 1**: Select local PDF, invoice, contract, or spreadsheet.
   - **Step 2**: Click **"⚡ Run Document Intelligence Pipeline"** to watch live processing progress (`Text Parsing` → `Table/Chart Detection` → `Vector Embeddings Indexing`).

3. **Grounded Source Citations & Visual Page Highlighting**:
   - Every AI response lists exact citations: `[Page X, Section Y]`.
   - Clicking a citation automatically navigates the Document Viewer to that page and renders a pulsing bounding box overlay highlighting the source section.

4. **Multi-Document Comparison Dashboard**:
   - Benchmark two or more documents side-by-side (e.g. FY 2023 vs FY 2024, Company A vs Company B).
   - Generates structured comparative matrices and dual-bar metric charts.

5. **Extracted Data & Analytics Studio**:
   - Interactive table viewer with natural language pandas query engine.
   - Dynamic Recharts metric visualizer (Bar & Line charts).
   - Export extracted data as **CSV** or **JSON**.

---

## 🏗️ System Architecture

```text
               USER PDF / IMAGE / SPREADSHEET
                            │
                            ▼
              Select PDF & Click "Run Pipeline"
                            │
                            ▼
           ┌────────────────┴────────────────┐
           ▼                                 ▼
   React 19 Frontend               FastAPI Python Backend
   (TypeScript + Tailwind)         (PyMuPDF + pdfplumber)
           │                                 │
           │                                 ▼
           │                     Document Classification
           │                   ┌─────────────┼─────────────┐
           │                   ▼             ▼             ▼
           │                 Text         Tables        Charts
           │                   │             │             │
           │                   └─────────────┼─────────────┘
           │                                 ▼
           │                       Chunking & Metadata
           │                                 │
           │                                 ▼
           │                       Hybrid BM25 + Vector RAG
           │                                 │
           ▼                                 ▼
    Grounded Response ◀────────────── Agentic LLM / Vision
   [Page X Citations]
```

---

## ⚡ Quick Start (Local Setup)

### 1. Clone Repository
```bash
git clone https://github.com/keerthanayr16-droid/nexora-.git
cd nexora-
```

### 2. Start Backend API
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 3. Start Frontend App
```bash
cd ../frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser!
