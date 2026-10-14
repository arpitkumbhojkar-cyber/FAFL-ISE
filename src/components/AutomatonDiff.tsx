import React from 'react';
import type { Change } from '../types/automaton';
import { PlusCircle, MinusCircle, ArrowRight } from 'lucide-react';

interface AutomatonDiffProps {
  changes: Change[];
}

export const AutomatonDiff: React.FC<AutomatonDiffProps> = ({ changes }) => {
  if (!changes || changes.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3 text-xs text-slate-400 italic">
        No state or transition structural diffs for this step.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
        <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
        <span>Transformation Structural Diff</span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {changes.map((change, idx) => {
          const isAdded = change.type.includes('added');
          const isRemoved = change.type.includes('removed');

          return (
            <div
              key={idx}
              className={`flex items-start gap-2 rounded-lg border p-2 text-xs font-mono ${
                isAdded
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : isRemoved
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                  : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
              }`}
            >
              {isAdded && <PlusCircle className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />}
              {isRemoved && <MinusCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      isAdded
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : isRemoved
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    {isAdded ? 'ADDED' : isRemoved ? 'REMOVED' : 'MODIFIED'}
                  </span>
                  <span className="font-semibold text-slate-200">{change.description}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
