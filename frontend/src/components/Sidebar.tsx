import React, { useState, useRef } from 'react';
import { FileText, CheckSquare, Square, Trash2, Table, BarChart2, Scan, FileCode, Play, Sparkles, FolderPlus } from 'lucide-react';
import type { DocumentItem } from '../types';

interface SidebarProps {
  documents: DocumentItem[];
  selectedDocIds: string[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onToggleDocCheck: (id: string) => void;
  onUploadFile: (file: File) => void;
  onDeleteDoc: (id: string) => void;
  onLoadSamples: () => void;
  isUploading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  selectedDocIds,
  activeDocId,
  onSelectDoc,
  onToggleDocCheck,
  onUploadFile,
  onDeleteDoc,
  onLoadSamples,
  isUploading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stagedFile, setStagedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setStagedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setStagedFile(e.target.files[0]);
    }
  };

  const handleRunPipeline = () => {
    if (stagedFile) {
      onUploadFile(stagedFile);
      setStagedFile(null);
    }
  };

  return (
    <aside className="w-80 border-r border-slate-800/80 bg-theme-panel/70 backdrop-blur-xl flex flex-col h-[calc(100vh-4rem)] p-4 overflow-y-auto">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-card border-2 border-dashed p-5 rounded-2xl cursor-pointer text-center group relative overflow-hidden transition-all mb-3 ${
          stagedFile ? 'border-emerald-400 bg-emerald-500/10' : 'border-cyan-500/30 hover:border-cyan-400'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.txt"
          className="hidden"
        />
        
        {stagedFile ? (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto shadow-glow-emerald">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-semibold text-xs text-emerald-300 truncate">
              {stagedFile.name}
            </h4>
            <span className="text-[10px] font-mono text-slate-300">
              {(stagedFile.size / 1024).toFixed(1)} KB • Ready to Run
            </span>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <FolderPlus className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-semibold text-sm text-slate-200 group-hover:text-cyan-300">
              1. Select PDF or Document
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
              PDF, Scanned Image, CSV, Report, Contract
            </p>
            <span className="inline-block mt-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              Choose Local PDF File
            </span>
          </>
        )}
      </div>

      {stagedFile && (
        <button
          onClick={handleRunPipeline}
          disabled={isUploading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 mb-4 transition-all shadow-glow-emerald animate-pulse"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>2. Run Document Intelligence Pipeline</span>
        </button>
      )}

      <button
        onClick={onLoadSamples}
        className="w-full py-2 px-3 rounded-xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-300 text-[11px] font-mono flex items-center justify-center gap-1.5 mb-5 transition-all"
      >
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Load Demo Financial & Legal PDFs</span>
      </button>

      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          Uploaded Documents ({documents.length})
        </h4>
      </div>

      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {documents.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs border border-slate-800/80 rounded-2xl p-6 bg-theme-panel/40">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-400">No Document Selected Yet</p>
            <p className="mt-1 font-mono text-[10px] text-cyan-400/80">
              Select your local PDF above, then click 'Run Document Intelligence' to process and explore.
            </p>
          </div>
        ) : (
          documents.map((doc) => {
            const isSelected = selectedDocIds.includes(doc.id);
            const isActive = activeDocId === doc.id;

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                  isActive
                    ? 'bg-theme-card/90 border-cyan-500/60 shadow-glow-cyan'
                    : 'bg-theme-panel/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 overflow-hidden">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleDocCheck(doc.id);
                      }}
                      className="mt-0.5 text-cyan-400 hover:text-cyan-300"
                      title="Toggle active for RAG search"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>

                    <div className="overflow-hidden">
                      <h5 className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300">
                        {doc.filename}
                      </h5>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                        <span>{doc.total_pages} {doc.total_pages === 1 ? 'Page' : 'Pages'}</span>
                        <span>•</span>
                        <span className="uppercase text-cyan-400">{doc.file_type}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDoc(doc.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition-opacity"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60 flex-wrap">
                  {doc.page_breakdown?.table > 0 && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Table className="w-2.5 h-2.5" /> {doc.page_breakdown.table} Tables
                    </span>
                  )}

                  {doc.page_breakdown?.chart > 0 && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/30 flex items-center gap-1">
                      <BarChart2 className="w-2.5 h-2.5" /> {doc.page_breakdown.chart} Charts
                    </span>
                  )}

                  {doc.page_breakdown?.scanned > 0 && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Scan className="w-2.5 h-2.5" /> {doc.page_breakdown.scanned} Scanned
                    </span>
                  )}

                  {doc.page_breakdown?.text > 0 && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-1">
                      <FileCode className="w-2.5 h-2.5 text-cyan-400" /> {doc.page_breakdown.text} Text
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
