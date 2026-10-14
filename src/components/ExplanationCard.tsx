import React from 'react';
import type { TransformationStep } from '../types/transformation';
import { BookOpen, HelpCircle } from 'lucide-react';
import { AutomatonDiff } from './AutomatonDiff';

interface ExplanationCardProps {
  step: TransformationStep;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({ step }) => {
  const { explanation, changes } = step;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-xl space-y-4">
      <div className="border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-indigo-400 border border-indigo-500/20">
            STEP {String(step.step).padStart(2, '0')}
          </span>
          <h2 className="text-base font-bold text-white m-0">{step.title}</h2>
        </div>
        <p className="text-xs text-slate-400 m-0">{step.subtitle}</p>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Operation Performed</span>
          </div>
          <p className="text-xs font-semibold text-slate-100">{explanation.operation}</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Why is this performed?</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{explanation.why}</p>
        </div>
      </div>

      {explanation.createdStates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3">
            <span className="font-semibold text-slate-400 block mb-1">Newly Created States:</span>
            <div className="flex flex-wrap gap-1">
              {explanation.createdStates.map((st) => (
                <span
                  key={st}
                  className="font-mono text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-bold"
                >
                  +{st}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3">
            <span className="font-semibold text-slate-400 block mb-1">New Transitions Added:</span>
            <div className="space-y-1 font-mono text-[11px] text-emerald-300">
              {explanation.newTransitions.length > 0 ? (
                explanation.newTransitions.map((tr, i) => (
                  <div key={i} className="truncate">
                    + {tr}
                  </div>
                ))
              ) : (
                <span className="text-slate-500 italic">None</span>
              )}
            </div>
          </div>
        </div>
      )}

      <AutomatonDiff changes={changes} />
    </div>
  );
};
