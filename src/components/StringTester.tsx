import React, { useState } from 'react';
import type { Automaton } from '../types/automaton';
import { simulateNFA } from '../algorithms/epsilonClosure';
import type { SimulationResult } from '../algorithms/epsilonClosure';
import { Play, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface StringTesterProps {
  automaton?: Automaton;
  onUpdateActiveStates?: (states: string[], transitions: string[]) => void;
}

export const StringTester: React.FC<StringTesterProps> = ({
  automaton,
  onUpdateActiveStates,
}) => {
  const [testString, setTestString] = useState('');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);

  if (!automaton) return null;

  const handleRunSimulation = () => {
    const res = simulateNFA(testString, automaton);
    setSimulationResult(res);
    setActiveStepIndex(-1);

    if (onUpdateActiveStates) {
      onUpdateActiveStates(res.finalActiveStates, []);
    }
  };

  const handleSelectSimStep = (index: number) => {
    if (!simulationResult) return;
    setActiveStepIndex(index);

    if (index === -1) {
      if (onUpdateActiveStates) onUpdateActiveStates(simulationResult.finalActiveStates, []);
    } else {
      const step = simulationResult.steps[index];
      if (onUpdateActiveStates) {
        const activeTransIds = step.activeTransitions.map(
          (t) => automaton.transitions.find((tr) => tr.from === t.from && tr.to === t.to && tr.symbol === t.symbol)?.id || ''
        ).filter(Boolean);
        onUpdateActiveStates(step.afterStates, activeTransIds);
      }
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 m-0">
          String Acceptance Simulator
        </h3>
        <span className="text-xs text-slate-400 font-mono">ε-NFA Execution</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative w-full flex-1">
          <input
            type="text"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRunSimulation();
            }}
            placeholder="Enter test string (e.g. aabb)..."
            className="w-full rounded-xl border border-slate-700 bg-[#080E1A] px-4 py-2.5 font-mono text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
          {testString === '' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">
              (Empty string ε)
            </span>
          )}
        </div>

        <button
          onClick={handleRunSimulation}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition-all"
        >
          <Play className="h-4 w-4 fill-white" />
          <span>Test String</span>
        </button>
      </div>

      {simulationResult && (
        <div className="space-y-3 pt-2">
          <div
            className={`flex items-center justify-between rounded-xl border p-4 shadow-lg ${
              simulationResult.isAccepted
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {simulationResult.isAccepted ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="h-6 w-6 text-rose-400 shrink-0" />
              )}
              <div>
                <div className="text-sm font-bold uppercase tracking-wider">
                  {simulationResult.isAccepted ? '✓ STRING ACCEPTED' : '✗ STRING REJECTED'}
                </div>
                <div className="text-xs opacity-90 font-mono mt-0.5">
                  Input: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-white">"{simulationResult.inputString || 'ε'}"</code>
                </div>
              </div>
            </div>

            <div className="text-right text-xs font-mono">
              <span className="block text-slate-400">Final Active States:</span>
              <span className="font-bold text-white">
                {`{${simulationResult.finalActiveStates.join(', ')}}`}
              </span>
            </div>
          </div>

          {simulationResult.steps.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Execution Path & State Traversal:
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {simulationResult.steps.map((st, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSimStep(idx)}
                    className={`flex items-center justify-between w-full rounded-lg border p-2 text-xs font-mono transition-all text-left ${
                      activeStepIndex === idx
                        ? 'border-indigo-500 bg-indigo-500/20 text-white'
                        : 'border-slate-800 hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-indigo-400 font-bold">
                        Char {st.stepIndex}: '{st.symbol}'
                      </span>
                      <span className="text-slate-400">
                        {`{${st.beforeStates.join(',')}}`}
                      </span>
                      <ArrowRight className="h-3 w-3 text-slate-500" />
                      <span className="text-emerald-400 font-bold">
                        {`{${st.afterStates.join(',')}}`}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500">
                      Step {st.stepIndex}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
