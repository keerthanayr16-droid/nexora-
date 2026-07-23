import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, Table, BarChart2, Scan, MapPin } from 'lucide-react';
import type { DocumentItem, SourceHighlight } from '../types';

interface DocumentViewerProps {
  document: DocumentItem | null;
  highlightedHighlight: SourceHighlight | null;
  targetPageNumber: number | null;
  onPageChange?: (pageNum: number) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  highlightedHighlight,
  targetPageNumber,
  onPageChange
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(100);

  useEffect(() => {
    if (targetPageNumber && document && targetPageNumber <= document.total_pages) {
      setCurrentPage(targetPageNumber);
    }
  }, [targetPageNumber, document]);

  if (!document) {
    return (
      <div className="flex-1 bg-theme-bg flex flex-col items-center justify-center p-8 text-center border-r border-slate-800/80 relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
        <div className="absolute w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

        <div className="max-w-xl glass-card p-10 rounded-3xl border border-cyan-500/30 shadow-glow-cyan relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 text-white flex items-center justify-center mx-auto mb-6 shadow-glow-cyan">
            <FileText className="w-8 h-8" />
          </div>

          <h2 className="font-heading font-extrabold text-2xl text-white tracking-tight">
            NEXORA Document Intelligence Platform
          </h2>
          <p className="text-xs text-slate-300 mt-2 mb-8 leading-relaxed font-sans max-w-md mx-auto">
            Select a PDF document from the left panel, then click <strong className="text-cyan-400 font-mono">"Run Document Intelligence Pipeline"</strong> to extract layout text, structured tables, charts, and enable grounded AI citations.
          </p>

          <div className="grid grid-cols-3 gap-4 text-left mb-8">
            <div className="p-3.5 rounded-2xl bg-theme-panel/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block mb-1">Step 1</span>
              <h4 className="text-xs font-semibold text-white">Select PDF</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Choose local PDF or scanned doc.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-theme-panel/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1">Step 2</span>
              <h4 className="text-xs font-semibold text-white">Run Pipeline</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Executes layout OCR & vector indexing.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-theme-panel/80 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-violet-400 font-bold block mb-1">Step 3</span>
              <h4 className="text-xs font-semibold text-white">AI Citations</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Ask questions with exact page citations.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 flex-wrap text-[10px] font-mono text-slate-400">
            <span className="text-slate-400 uppercase font-semibold">Supported Domains:</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">Financial Reports</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">Contracts & Invoices</span>
            <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/30">Research Papers</span>
          </div>
        </div>
      </div>
    );
  }

  const pageData = document.pages.find((p) => p.page_number === currentPage) || document.pages[0];

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const p = currentPage - 1;
      setCurrentPage(p);
      onPageChange?.(p);
    }
  };

  const handleNextPage = () => {
    if (currentPage < document.total_pages) {
      const p = currentPage + 1;
      setCurrentPage(p);
      onPageChange?.(p);
    }
  };

  const isHighlighted = highlightedHighlight && highlightedHighlight.page_number === currentPage;

  return (
    <div className="flex-1 bg-theme-bg flex flex-col h-[calc(100vh-4rem)] border-r border-slate-800/80 overflow-hidden">
      <div className="h-14 border-b border-slate-800/80 bg-theme-panel/80 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="font-heading font-semibold text-xs text-slate-200 truncate max-w-[200px]">
            {document.filename}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {document.file_type.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg bg-theme-card hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-all border border-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-300">
            Page <strong className="text-cyan-400">{currentPage}</strong> / {document.total_pages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= document.total_pages}
            className="p-1.5 rounded-lg bg-theme-card hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-all border border-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-theme-card border border-slate-800 rounded-lg p-1 text-slate-300">
            <button
              onClick={() => setZoom(Math.max(60, zoom - 20))}
              className="p-1 hover:text-cyan-400 text-slate-400"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-10 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(180, zoom + 20))}
              className="p-1 hover:text-cyan-400 text-slate-400"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-start bg-theme-bg relative">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="w-full max-w-3xl glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl relative transition-transform duration-200 min-h-[600px] mb-8"
        >
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                PAGE {currentPage} CLASSIFICATION:
              </span>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md border font-semibold flex items-center gap-1.5 ${
                pageData?.page_type === 'table'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : pageData?.page_type === 'chart'
                  ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                  : pageData?.page_type === 'scanned'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              }`}>
                {pageData?.page_type === 'table' && <Table className="w-3 h-3" />}
                {pageData?.page_type === 'chart' && <BarChart2 className="w-3 h-3" />}
                {pageData?.page_type === 'scanned' && <Scan className="w-3 h-3" />}
                {pageData?.page_type === 'text' && <FileText className="w-3 h-3" />}
                {pageData?.page_type.toUpperCase()}
              </span>
            </div>

            {isHighlighted && (
              <span className="text-xs font-mono px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-glow-cyan flex items-center gap-1.5 animate-bounce">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Source Grounding Highlight</span>
              </span>
            )}
          </div>

          {pageData?.image_preview ? (
            <div className="relative mb-6 rounded-xl overflow-hidden border border-slate-800">
              <img
                src={pageData.image_preview}
                alt={`Page ${currentPage}`}
                className="w-full object-contain max-h-[700px] rounded-xl"
              />
              {isHighlighted && (
                <div
                  style={{
                    left: `${highlightedHighlight.bbox[0] || 40}px`,
                    top: `${highlightedHighlight.bbox[1] || 60}px`,
                    width: `${(highlightedHighlight.bbox[2] - highlightedHighlight.bbox[0]) || 300}px`,
                    height: `${(highlightedHighlight.bbox[3] - highlightedHighlight.bbox[1]) || 80}px`
                  }}
                  className="absolute source-highlight-box rounded-lg pointer-events-none flex items-center justify-center"
                >
                  <span className="text-[10px] font-mono bg-cyan-950/90 text-cyan-300 px-2 py-0.5 rounded border border-cyan-400">
                    AI Citation Source
                  </span>
                </div>
              )}
            </div>
          ) : null}

          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {pageData?.text || 'No text extracted for this page.'}
          </div>

          {pageData?.tables && pageData.tables.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Table className="w-4 h-4" /> Extracted Page Table Data
              </h4>
              {pageData.tables.map((t, idx) => (
                <div key={idx} className="overflow-x-auto rounded-xl border border-slate-800 bg-theme-panel/90 mb-4">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-theme-card text-cyan-300 font-mono border-b border-slate-800">
                      <tr>
                        {t.headers.map((h, i) => (
                          <th key={i} className="px-4 py-2.5 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {t.rows.map((r, ri) => (
                        <tr key={ri} className="hover:bg-slate-800/40">
                          {r.map((c, ci) => (
                            <td key={ci} className="px-4 py-2 text-slate-200">{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-20 border-t border-slate-800/80 bg-theme-panel/90 px-4 flex items-center gap-3 overflow-x-auto">
        {document.pages.map((p) => (
          <button
            key={p.page_number}
            onClick={() => {
              setCurrentPage(p.page_number);
              onPageChange?.(p.page_number);
            }}
            className={`h-14 w-12 rounded-lg border flex flex-col items-center justify-center text-[10px] font-mono shrink-0 transition-all ${
              currentPage === p.page_number
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-glow-cyan'
                : 'bg-theme-card border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span>P.{p.page_number}</span>
            <span className="text-[8px] uppercase text-slate-400 mt-0.5">{p.page_type}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
