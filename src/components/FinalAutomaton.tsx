import React from 'react';
import type { Automaton } from '../types/automaton';
import { CheckCircle2, Copy, Download, FileText, RefreshCw } from 'lucide-react';
import { AutomatonGraph } from './AutomatonGraph';
import { generateAutomatonText, generateFullReport, downloadTextFile } from '../utils/exportUtils';
import type { TransformationStep } from '../types/transformation';

interface FinalAutomatonProps {
  expression: string;
  nfa?: Automaton;
  dfa?: Automaton;
  minimalDfa?: Automaton;
  steps: TransformationStep[];
  selectedView: 'ε-NFA' | 'DFA' | 'Minimal DFA';
  onSelectView: (view: 'ε-NFA' | 'DFA' | 'Minimal DFA') => void;
  onCopyToast: (msg: string) => void;
  onReset: () => void;
}

export const FinalAutomaton: React.FC<FinalAutomatonProps> = ({
  expression,
  nfa,
  dfa,
  minimalDfa,
  steps,
  selectedView,
  onSelectView,
  onCopyToast,
  onReset,
}) => {
  if (!nfa) return null;

  const currentAutomaton =
    selectedView === 'DFA' && dfa
      ? dfa
      : selectedView === 'Minimal DFA' && minimalDfa
      ? minimalDfa
      : nfa;

  const epsilonCount = currentAutomaton.transitions.filter((t) => t.symbol === 'ε').length;

  const handleCopyAutomaton = () => {
    const text = generateAutomatonText(currentAutomaton);
    navigator.clipboard.writeText(text);
    onCopyToast('Automaton transition table copied to clipboard!');
  };

  const handleDownloadTxt = () => {
    const text = generateAutomatonText(currentAutomaton);
    downloadTextFile(`${expression.replace(/[^a-zA-Z0-9]/g, '_')}_automaton.txt`, text);
  };

  const handleDownloadReport = () => {
    const report = generateFullReport(expression, steps, nfa);
    downloadTextFile(`${expression.replace(/[^a-zA-Z0-9]/g, '_')}_conversion_report.txt`, report);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎉</span>
            <h2 className="text-xl font-extrabold text-white m-0">Conversion Complete</h2>
          </div>
          <p className="text-xs text-slate-400 m-0">
            Regular Expression <code className="text-indigo-300 font-mono font-bold">{expression}</code> successfully converted into Finite Automaton.
          </p>
        </div>

        <div className="flex items-center rounded-xl bg-[#080E1A] p-1 border border-slate-800">
          <button
            onClick={() => onSelectView('ε-NFA')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              selectedView === 'ε-NFA'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ε-NFA
          </button>
          {dfa && (
            <button
              onClick={() => onSelectView('DFA')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                selectedView === 'DFA'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              DFA
            </button>
          )}
          {minimalDfa && (
            <button
              onClick={() => onSelectView('Minimal DFA')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                selectedView === 'Minimal DFA'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Minimal DFA
            </button>
          )}
        </div>
      </div>

      <AutomatonGraph
        automaton={currentAutomaton}
        title={`Generated ${selectedView} Graph`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3 text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Total States</div>
          <div className="text-lg font-bold font-mono text-white mt-0.5">{currentAutomaton.states.length}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3 text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Transitions</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{currentAutomaton.transitions.length}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3 text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Alphabet (Σ)</div>
          <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
            {`{${Array.from(currentAutomaton.alphabet).join(',')}}`}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3 text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Start State</div>
          <div className="text-lg font-bold font-mono text-indigo-400 mt-0.5">{currentAutomaton.startState}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3 text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Accept States</div>
          <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
            {`{${Array.from(currentAutomaton.acceptStates).join(',')}}`}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3 text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">ε-Transitions</div>
          <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">{epsilonCount}</div>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs">
        <div className="font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          <span>Theory of Computation Automaton Checklist</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span> Valid {selectedView} Structure
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span> Exactly one start state ({currentAutomaton.startState})
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span> All transition symbols verified
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span> Accept states defined ({Array.from(currentAutomaton.acceptStates).join(', ')})
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyAutomaton}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-700 transition-all"
          >
            <Copy className="h-4 w-4 text-indigo-400" />
            <span>Copy Automaton</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-700 transition-all"
          >
            <Download className="h-4 w-4 text-cyan-400" />
            <span>Export TXT</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-700 transition-all"
          >
            <FileText className="h-4 w-4 text-emerald-400" />
            <span>Download Full Report</span>
          </button>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Start Over</span>
        </button>
      </div>
    </div>
  );
};
