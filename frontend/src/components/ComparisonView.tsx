import React, { useState } from 'react';
import { Layers, ArrowRightLeft, Sparkles, FileText, BarChart2 } from 'lucide-react';
import type { DocumentItem, ComparisonMatrix } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface ComparisonViewProps {
  documents: DocumentItem[];
  onRunComparison: (docIds: string[]) => void;
  comparisonMatrix: ComparisonMatrix | null;
  comparisonNarrative: string;
  isLoading: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  documents,
  onRunComparison,
  comparisonMatrix,
  comparisonNarrative: _comparisonNarrative,
  isLoading
}) => {
  const [selectedDocA, setSelectedDocA] = useState<string>(documents[0]?.id || '');
  const [selectedDocB, setSelectedDocB] = useState<string>(documents[1]?.id || '');

  const handleCompareClick = () => {
    if (selectedDocA && selectedDocB && selectedDocA !== selectedDocB) {
      onRunComparison([selectedDocA, selectedDocB]);
    }
  };

  const sampleChartData = [
    { name: 'Revenue (Cr)', DocA: 200, DocB: 160 },
    { name: 'Net Profit (Cr)', DocA: 60, DocB: 40 },
    { name: 'R&D Spend (Cr)', DocA: 40, DocB: 25 },
    { name: 'Active Clients', DocA: 89, DocB: 35 }
  ];

  return (
    <div className="flex-1 bg-obsidian-950 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto p-8">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center shadow-glow-violet">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-2xl text-white tracking-tight">
                Multi-Document Intelligence Comparison
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Side-by-side metric benchmarking, comparative risk analysis, and variance tables.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleCompareClick}
          disabled={!selectedDocA || !selectedDocB || selectedDocA === selectedDocB || isLoading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold text-xs transition-all shadow-glow-cyan disabled:opacity-40 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoading ? 'Comparing Documents...' : 'Run Comparative Intelligence'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <label className="text-xs font-mono font-semibold uppercase text-cyan-400 block mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Document A (Primary Benchmark)
          </label>
          <select
            value={selectedDocA}
            onChange={(e) => setSelectedDocA(e.target.value)}
            className="w-full glass-input p-3 rounded-xl text-xs font-semibold text-slate-200"
          >
            <option value="">Select Document A...</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>{d.filename} ({d.total_pages} Pages)</option>
            ))}
          </select>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <label className="text-xs font-mono font-semibold uppercase text-violet-400 block mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Document B (Comparative Target)
          </label>
          <select
            value={selectedDocB}
            onChange={(e) => setSelectedDocB(e.target.value)}
            className="w-full glass-input p-3 rounded-xl text-xs font-semibold text-slate-200"
          >
            <option value="">Select Document B...</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>{d.filename} ({d.total_pages} Pages)</option>
            ))}
          </select>
        </div>
      </div>

      {comparisonMatrix ? (
        <div className="space-y-8">
          <div className="glass-card p-6 rounded-2xl border-slate-800">
            <h3 className="font-heading font-bold text-base text-slate-200 mb-4 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
              Structured Comparison Matrix
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-obsidian-850 text-cyan-300 font-mono border-b border-slate-800">
                  <tr>
                    {comparisonMatrix.headers.map((h, i) => (
                      <th key={i} className="px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {comparisonMatrix.rows.map((row, ri) => (
                    <tr key={ri} className="hover:bg-slate-800/30">
                      {row.map((cell, ci) => (
                        <td key={ci} className={`px-4 py-3 ${ci === 0 ? 'font-mono text-cyan-400 font-semibold' : 'text-slate-200'}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border-slate-800">
            <h3 className="font-heading font-bold text-base text-slate-200 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-violet-400" />
              Visual Financial Metric Comparison
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sampleChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="DocA" fill="#06B6D4" name="Document A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="DocB" fill="#8B5CF6" name="Document B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 rounded-2xl border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center mb-4">
            <ArrowRightLeft className="w-8 h-8" />
          </div>
          <h4 className="font-heading font-bold text-slate-200 text-lg">No Comparison Executed Yet</h4>
          <p className="text-xs text-slate-400 max-w-md mt-1 font-mono">
            Select two documents above and click "Run Comparative Intelligence" to generate structured comparison matrices, variance tables, and visual charts.
          </p>
        </div>
      )}
    </div>
  );
};
