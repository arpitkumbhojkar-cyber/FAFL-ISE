import React, { useRef } from 'react';
import { Play, CheckCircle2, Trash2, Sparkles, Code } from 'lucide-react';

interface RegexEditorProps {
  value: string;
  onChange: (val: string) => void;
  onValidate: () => void;
  onConvert: () => void;
  onClear: () => void;
  onOpenExamples: () => void;
}

export const RegexEditor: React.FC<RegexEditorProps> = ({
  value,
  onChange,
  onValidate,
  onConvert,
  onClear,
  onOpenExamples,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const insertSymbol = (symbol: string) => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || value.length;
    const end = inputRef.current.selectionEnd || value.length;
    const newValue = value.slice(0, start) + symbol + value.slice(end);
    onChange(newValue);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(start + symbol.length, start + symbol.length);
      }
    }, 0);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-bold tracking-wide uppercase text-slate-300 m-0">
            Input Regular Expression
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">Syntax: |, *, +, ?, (), ε</span>
      </div>

      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onConvert();
            }
          }}
          placeholder="e.g. (a|b)*abb"
          className="w-full rounded-xl border border-slate-700/80 bg-[#080E1A] px-4 py-3.5 font-mono text-base text-white placeholder-slate-500 shadow-inner outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
        {value.length > 0 && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="Clear input"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        <span className="text-xs text-slate-400 mr-1 font-medium">Quick Operators:</span>
        {[
          { label: '| (Union)', val: '|' },
          { label: '* (Star)', val: '*' },
          { label: '+ (Plus)', val: '+' },
          { label: '? (Optional)', val: '?' },
          { label: '(', val: '(' },
          { label: ')', val: ')' },
          { label: 'ε (Epsilon)', val: 'ε' },
        ].map((op) => (
          <button
            key={op.val}
            onClick={() => insertSymbol(op.val)}
            className="rounded-lg border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 font-mono text-xs font-semibold text-slate-200 hover:border-indigo-500/50 hover:bg-indigo-600/20 hover:text-indigo-300 transition-all"
          >
            {op.val}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={onValidate}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white transition-all"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Validate</span>
        </button>

        <button
          onClick={onOpenExamples}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white transition-all"
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Load Example</span>
        </button>

        <button
          onClick={onClear}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white transition-all"
        >
          <Trash2 className="h-4 w-4 text-rose-400" />
          <span>Clear</span>
        </button>

        <button
          onClick={onConvert}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-cyan-400 transition-all active:scale-[0.98]"
        >
          <Play className="h-4 w-4 fill-white" />
          <span>Convert to FA</span>
        </button>
      </div>
    </div>
  );
};
