import React from 'react';
import type { Automaton } from '../types/automaton';
import type { RegexNode } from '../types/regex';

interface StatsBarProps {
  alphabetSize: number;
  tokensCount: number;
  astNodesCount: number;
  automaton?: Automaton;
  stepsCount: number;
}

function countAstNodes(node?: RegexNode): number {
  if (!node) return 0;
  if (node.type === 'symbol' || node.type === 'epsilon') return 1;
  if (node.type === 'star' || node.type === 'plus' || node.type === 'optional') {
    return 1 + countAstNodes(node.child);
  }
  if (node.type === 'concat' || node.type === 'union') {
    return 1 + countAstNodes(node.left) + countAstNodes(node.right);
  }
  return 1;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  alphabetSize,
  tokensCount,
  astNodesCount,
  automaton,
  stepsCount,
}) => {
  const statesCount = automaton ? automaton.states.length : 0;
  const transitionsCount = automaton ? automaton.transitions.length : 0;
  const epsilonCount = automaton
    ? automaton.transitions.filter((t) => t.symbol === 'ε').length
    : 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <h3 className="text-xs font-bold tracking-wide uppercase text-slate-400 m-0">
          Real-time Statistics
        </h3>
        <span className="text-[10px] text-slate-500 font-mono">Dynamic Automaton Metrics</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-2.5 text-center">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Alphabet</div>
          <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">{alphabetSize}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-2.5 text-center">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Regex Tokens</div>
          <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">{tokensCount}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-2.5 text-center">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">AST Nodes</div>
          <div className="text-base font-bold font-mono text-purple-400 mt-0.5">{astNodesCount}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-2.5 text-center">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">FA States</div>
          <div className="text-base font-bold font-mono text-white mt-0.5">{statesCount}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-2.5 text-center">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Transitions</div>
          <div className="text-base font-bold font-mono text-indigo-400 mt-0.5">{transitionsCount}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-2.5 text-center">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">ε-Transitions</div>
          <div className="text-base font-bold font-mono text-amber-400 mt-0.5">{epsilonCount}</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-2.5 text-center">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Steps</div>
          <div className="text-base font-bold font-mono text-rose-400 mt-0.5">{stepsCount}</div>
        </div>
      </div>
    </div>
  );
};
export { countAstNodes };
