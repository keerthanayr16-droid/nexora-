import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MapPin, Table, ArrowUpRight, FileText, CornerDownRight } from 'lucide-react';
import type { ChatMessage, SourceHighlight } from '../types';

interface AIChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onJumpToCitation: (pageNumber: number, highlight?: SourceHighlight) => void;
  isLoading: boolean;
  selectedDocCount: number;
}

const SUGGESTED_QUERIES = [
  "What was the company's revenue growth?",
  "Compare the financial performance of 2023 and 2024.",
  "What are the important risks mentioned in this report?",
  "Extract all invoice details and structured data.",
  "Which framework achieved highest accuracy in the benchmark table?"
];

export const AIChat: React.FC<AIChatProps> = ({
  messages,
  onSendMessage,
  onJumpToCitation,
  isLoading,
  selectedDocCount
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleQueryClick = (q: string) => {
    if (!isLoading) {
      onSendMessage(q);
    }
  };

  return (
    <div className="w-[450px] bg-obsidian-900/80 flex flex-col h-[calc(100vh-4rem)] border-l border-slate-800/80">
      <div className="h-14 border-b border-slate-800/80 bg-obsidian-900 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-xs text-slate-200">
              NEXORA AI Intelligence Assistant
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Grounding Context: <strong className="text-cyan-400">{selectedDocCount} Docs Active</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="py-8 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-glow-cyan">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="font-heading font-bold text-sm text-slate-200">
              Ask NEXORA Anything
            </h4>
            <p className="text-xs text-slate-400 mt-1 mb-4 font-mono">
              Upload your document and query text, tables, graphs, scanned pages, or multi-doc comparisons.
            </p>

            <div className="space-y-2 text-left">
              <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-semibold block mb-1">
                Suggested Intelligence Queries:
              </span>
              {SUGGESTED_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQueryClick(q)}
                  className="w-full text-left p-2.5 rounded-xl bg-obsidian-850 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 transition-all flex items-center justify-between group"
                >
                  <span className="group-hover:text-cyan-300 truncate">{q}</span>
                  <CornerDownRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-glow-cyan mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-glow-cyan font-medium'
                  : 'glass-card border-slate-800 text-slate-200'
              }`}>
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold block flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Exact Source Citations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((cit, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const highlight = msg.highlights?.find(h => h.page_number === cit.page_number);
                            onJumpToCitation(cit.page_number, highlight);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-obsidian-950 hover:bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 text-[10px] font-mono transition-all flex items-center gap-1 group shadow-sm"
                          title="Click to jump to exact page and highlight text on document"
                        >
                          <FileText className="w-3 h-3 text-cyan-400" />
                          <span>Page {cit.page_number}</span>
                          <span className="text-slate-400 font-normal">({cit.section})</span>
                          <ArrowUpRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {msg.analytics_data && (
                  <div className="mt-3 p-3 rounded-xl bg-obsidian-950 border border-emerald-500/30 text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold mb-2">
                      <Table className="w-3.5 h-3.5" /> Structured Table Preview
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-slate-300">
                        <thead className="border-b border-slate-800 text-cyan-400 font-mono">
                          <tr>
                            {msg.analytics_data.headers.slice(0, 3).map((h, i) => (
                              <th key={i} className="py-1 px-2">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {msg.analytics_data.rows.slice(0, 3).map((r, ri) => (
                            <tr key={ri} className="border-b border-slate-800/40">
                              {r.slice(0, 3).map((c, ci) => (
                                <td key={ci} className="py-1 px-2 text-slate-200">{c}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-1 border border-slate-700">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-glow-cyan animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-card p-4 rounded-2xl border-slate-800 text-slate-400 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="font-mono">Analyzing layout, table data & citations...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-slate-800 bg-obsidian-900">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about uploaded documents..."
            disabled={isLoading}
            className="w-full glass-input py-3 pl-4 pr-12 rounded-xl text-xs placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-1.5 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 text-white disabled:opacity-40 transition-all shadow-glow-cyan hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
