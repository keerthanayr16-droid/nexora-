import React from 'react';
import { Sparkles, FileText, Layers, BarChart3, Database } from 'lucide-react';

interface NavbarProps {
  activeTab: 'workspace' | 'comparison' | 'analytics';
  setActiveTab: (tab: 'workspace' | 'comparison' | 'analytics') => void;
  activeDocCount: number;
  isBackendConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeDocCount,
  isBackendConnected
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-theme-panel/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-500 to-indigo-600 flex items-center justify-center shadow-glow-cyan">
          <Sparkles className="w-5 h-5 text-slate-950 animate-pulse font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-xl tracking-tight text-white">
              NEXORA
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Doc AI Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 tracking-wide font-mono">
            Understand. Explore. Discover.
          </p>
        </div>
      </div>

      <nav className="flex items-center gap-1 bg-theme-bg/80 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'workspace'
              ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Doc Intelligence Workspace</span>
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'comparison'
              ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Multi-Doc Compare</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Extracted Studio</span>
        </button>
      </nav>

      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-theme-card border border-slate-800 text-slate-300">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Docs Active: <strong className="text-white">{activeDocCount}</strong></span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-theme-card border border-slate-800">
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 shadow-[0_0_8px_#00E676]' : 'bg-amber-400'}`} />
          <span className="text-slate-300">
            {isBackendConnected ? 'FastAPI Engine Active' : 'Connecting...'}
          </span>
        </div>
      </div>
    </header>
  );
};
