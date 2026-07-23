import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DocumentViewer } from './components/DocumentViewer';
import { AIChat } from './components/AIChat';
import { ComparisonView } from './components/ComparisonView';
import { AnalyticsStudio } from './components/AnalyticsStudio';
import type { DocumentItem, ChatMessage, SourceHighlight, ComparisonMatrix } from './types';
import { Sparkles, Cpu, Layers, CheckCircle2, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export function App() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'comparison' | 'analytics'>('workspace');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [highlightedHighlight, setHighlightedHighlight] = useState<SourceHighlight | null>(null);
  const [targetPageNumber, setTargetPageNumber] = useState<number | null>(null);
  
  const [comparisonMatrix, setComparisonMatrix] = useState<ComparisonMatrix | null>(null);
  const [comparisonNarrative, setComparisonNarrative] = useState<string>('');
  
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStep, setUploadStep] = useState<number>(1);
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
  const [isLoadingCompare, setIsLoadingCompare] = useState<boolean>(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) {
        setIsBackendConnected(true);
        await fetchDocuments();
      }
    } catch (e) {
      console.warn("Backend not running locally yet:", e);
      setIsBackendConnected(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/documents`);
      if (res.ok) {
        const list = await res.json();
        const detailedDocs: DocumentItem[] = [];
        for (const item of list) {
          const docRes = await fetch(`${API_BASE}/api/document/${item.id}`);
          if (docRes.ok) {
            detailedDocs.push(await docRes.json());
          }
        }
        setDocuments(detailedDocs);
        if (detailedDocs.length > 0) {
          setSelectedDocIds(detailedDocs.map((d) => d.id));
          if (!activeDocId) {
            setActiveDocId(detailedDocs[detailedDocs.length - 1].id);
          }
        }
      }
    } catch (e) {
      console.error("Error fetching documents:", e);
    }
  };

  const loadSampleData = async () => {
    setIsUploading(true);
    setUploadStep(1);
    try {
      setTimeout(() => setUploadStep(2), 600);
      setTimeout(() => setUploadStep(3), 1200);
      const res = await fetch(`${API_BASE}/api/load-sample-data`, { method: 'POST' });
      if (res.ok) {
        setTimeout(() => setUploadStep(4), 1800);
        await fetchDocuments();
      }
    } catch (e) {
      console.error("Error loading sample data:", e);
    } finally {
      setTimeout(() => setIsUploading(false), 2200);
    }
  };

  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadStep(1);

    const stepInterval = setInterval(() => {
      setUploadStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 700);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setUploadStep(4);
        await fetchDocuments();
      } else {
        alert("Failed to process document");
      }
    } catch (e) {
      console.error("Upload error:", e);
      alert("Error uploading file to server");
    } finally {
      clearInterval(stepInterval);
      setTimeout(() => setIsUploading(false), 1200);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/document/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
        setSelectedDocIds(prev => prev.filter(docId => docId !== id));
        if (activeDocId === id) {
          setActiveDocId(documents.find(d => d.id !== id)?.id || null);
        }
      }
    } catch (e) {
      console.error("Error deleting doc:", e);
    }
  };

  const handleToggleDocCheck = (id: string) => {
    setSelectedDocIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setIsLoadingChat(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          doc_ids: selectedDocIds.length > 0 ? selectedDocIds : documents.map(d => d.id)
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.answer,
          citations: data.citations,
          highlights: data.highlights,
          analytics_data: data.analytics_data,
          comparison_matrix: data.comparison_matrix,
          timestamp: new Date().toLocaleTimeString()
        };
        setChatMessages(prev => [...prev, aiMsg]);
        if (data.comparison_matrix) {
          setComparisonMatrix(data.comparison_matrix);
        }
      }
    } catch (e) {
      console.error("Chat API error:", e);
      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "Sorry, I encountered an issue connecting to the RAG engine. Please verify the backend is running.",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleJumpToCitation = (pageNumber: number, highlight?: SourceHighlight) => {
    setTargetPageNumber(pageNumber);
    if (highlight) {
      setHighlightedHighlight(highlight);
    }
    setActiveTab('workspace');
  };

  const handleRunComparison = async (docIds: string[]) => {
    setIsLoadingCompare(true);
    try {
      const res = await fetch(`${API_BASE}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc_ids: docIds })
      });

      if (res.ok) {
        const data = await res.json();
        setComparisonMatrix(data.comparison_matrix);
        setComparisonNarrative(data.answer);
      }
    } catch (e) {
      console.error("Comparison error:", e);
    } finally {
      setIsLoadingCompare(false);
    }
  };

  const activeDoc = documents.find((d) => d.id === activeDocId) || documents[documents.length - 1] || null;

  return (
    <div className="min-h-screen bg-theme-bg text-slate-100 flex flex-col font-sans relative">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeDocCount={documents.length}
        isBackendConnected={isBackendConnected}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          documents={documents}
          selectedDocIds={selectedDocIds}
          activeDocId={activeDocId}
          onSelectDoc={setActiveDocId}
          onToggleDocCheck={handleToggleDocCheck}
          onUploadFile={handleUploadFile}
          onDeleteDoc={handleDeleteDoc}
          onLoadSamples={loadSampleData}
          isUploading={isUploading}
        />

        {activeTab === 'workspace' && (
          <main className="flex-1 flex">
            <DocumentViewer
              document={activeDoc}
              highlightedHighlight={highlightedHighlight}
              targetPageNumber={targetPageNumber}
            />
            <AIChat
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onJumpToCitation={handleJumpToCitation}
              isLoading={isLoadingChat}
              selectedDocCount={selectedDocIds.length}
            />
          </main>
        )}

        {activeTab === 'comparison' && (
          <main className="flex-1 flex">
            <ComparisonView
              documents={documents}
              onRunComparison={handleRunComparison}
              comparisonMatrix={comparisonMatrix}
              comparisonNarrative={comparisonNarrative}
              isLoading={isLoadingCompare}
            />
          </main>
        )}

        {activeTab === 'analytics' && (
          <main className="flex-1 flex">
            <AnalyticsStudio documents={documents} />
          </main>
        )}
      </div>

      {isUploading && (
        <div className="fixed inset-0 bg-theme-bg/90 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-lg glass-card p-8 rounded-3xl border border-cyan-500/40 shadow-glow-cyan text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center mx-auto mb-5 shadow-glow-cyan">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>

            <h3 className="font-heading font-extrabold text-xl text-white">
              Document Intelligence Ingestion Pipeline
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1 mb-6">
              Parsing layout, extracting tables, running OCR & embedding vector index...
            </p>

            <div className="space-y-3 text-left">
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                uploadStep >= 1 ? 'bg-theme-card border-cyan-500/50 text-cyan-300' : 'bg-theme-panel border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center gap-2">
                  {uploadStep > 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
                  <span>1. PyMuPDF Layout & Text Parsing</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-cyan-400">Step 1</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                uploadStep >= 2 ? 'bg-theme-card border-cyan-500/50 text-cyan-300' : 'bg-theme-panel border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center gap-2">
                  {uploadStep > 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : uploadStep === 2 ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Layers className="w-4 h-4" />}
                  <span>2. Multimodal Table & Chart Detection</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-cyan-400">Step 2</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                uploadStep >= 3 ? 'bg-theme-card border-cyan-500/50 text-cyan-300' : 'bg-theme-panel border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center gap-2">
                  {uploadStep > 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : uploadStep === 3 ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <Sparkles className="w-4 h-4" />}
                  <span>3. Metadata Chunking & Vector Indexing</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-cyan-400">Step 3</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
