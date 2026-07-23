import React, { useState } from 'react';
import { BarChart3, Table, FileCode, ArrowDownToLine } from 'lucide-react';
import type { DocumentItem, TableData } from '../types';
import { ResponsiveContainer, BarChart, Bar, LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AnalyticsStudioProps {
  documents: DocumentItem[];
}

export const AnalyticsStudio: React.FC<AnalyticsStudioProps> = ({ documents }) => {
  const allTables: { docName: string; table: TableData }[] = [];
  documents.forEach((d) => {
    d.tables.forEach((t) => {
      allTables.push({ docName: d.filename, table: t });
    });
  });

  const [selectedTableIdx, setSelectedTableIdx] = useState<number>(0);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const activeTableObj = allTables[selectedTableIdx]?.table;
  const activeDocName = allTables[selectedTableIdx]?.docName || 'Document';

  const chartSeries = activeTableObj?.rows.map((row) => {
    const rawVal = row[1] || '0';
    const cleanNum = parseFloat(rawVal.replace(/[^\d\.]/g, '')) || 0;
    return {
      label: row[0] || 'Item',
      value: cleanNum,
      raw: rawVal
    };
  }) || [];

  const handleDownloadCSV = () => {
    if (!activeTableObj) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + [activeTableObj.headers.join(","), ...activeTableObj.rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `extracted_table_p${activeTableObj.page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    if (!activeTableObj) return;
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeTableObj, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonStr);
    link.setAttribute("download", `extracted_table_p${activeTableObj.page}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-obsidian-950 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto p-8">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-600 flex items-center justify-center shadow-glow-cyan">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-2xl text-white tracking-tight">
              Extracted Data & Analytics Studio
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Structured table workspace, chart generator, and data export suite.
            </p>
          </div>
        </div>

        {activeTableObj && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 rounded-xl bg-obsidian-850 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-mono flex items-center gap-2 transition-all"
            >
              <ArrowDownToLine className="w-4 h-4" /> Download CSV
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-4 py-2 rounded-xl bg-obsidian-850 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 text-xs font-mono flex items-center gap-2 transition-all"
            >
              <FileCode className="w-4 h-4" /> Export JSON
            </button>
          </div>
        )}
      </div>

      {allTables.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
            <Table className="w-8 h-8" />
          </div>
          <h4 className="font-heading font-bold text-slate-200 text-lg">No Extracted Tables Found</h4>
          <p className="text-xs text-slate-400 max-w-md mt-1 font-mono">
            Upload documents containing financial statements, spreadsheets, or structured grid data to explore tables here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-4 space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
              <Table className="w-4 h-4 text-emerald-400" /> Extracted Tables Index ({allTables.length})
            </h3>
            {allTables.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTableIdx(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedTableIdx === idx
                    ? 'bg-obsidian-800 border-emerald-500/50 shadow-glow-cyan'
                    : 'bg-obsidian-850/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span className="truncate">{item.docName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Page {item.table.page}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">
                  {item.table.row_count} Rows • {item.table.col_count} Columns
                </div>
              </button>
            ))}
          </div>

          <div className="col-span-8 space-y-6">
            {activeTableObj && (
              <>
                <div className="glass-card p-6 rounded-2xl border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-heading font-bold text-slate-200 text-sm flex items-center gap-2">
                      <Table className="w-4 h-4 text-emerald-400" />
                      Table Data (From {activeDocName} — Page {activeTableObj.page})
                    </h4>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead className="bg-obsidian-850 text-cyan-300 font-mono border-b border-slate-800">
                        <tr>
                          {activeTableObj.headers.map((h, i) => (
                            <th key={i} className="px-4 py-3 font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {activeTableObj.rows.map((r, ri) => (
                          <tr key={ri} className="hover:bg-slate-800/30">
                            {r.map((c, ci) => (
                              <td key={ci} className="px-4 py-2.5 text-slate-200">{c}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-heading font-bold text-slate-200 text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      Generated Metric Visualization
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setChartType('bar')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono ${chartType === 'bar' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400' : 'bg-obsidian-850 text-slate-400'}`}
                      >
                        Bar Chart
                      </button>
                      <button
                        onClick={() => setChartType('line')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono ${chartType === 'line' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400' : 'bg-obsidian-850 text-slate-400'}`}
                      >
                        Line Chart
                      </button>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'bar' ? (
                        <BarChart data={chartSeries}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                          <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} />
                          <YAxis stroke="#94A3B8" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '8px' }} />
                          <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      ) : (
                        <ReLineChart data={chartSeries}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                          <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} />
                          <YAxis stroke="#94A3B8" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4 }} />
                        </ReLineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
