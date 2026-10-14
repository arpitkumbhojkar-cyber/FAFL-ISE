import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import type { TransformationStep } from '../types/transformation';

interface TransformationTimelineProps {
  steps: TransformationStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

export const TransformationTimeline: React.FC<TransformationTimelineProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
}) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 m-0">
          Transformation Timeline
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          Step {currentStepIndex + 1} of {steps.length}
        </span>
      </div>

      <div className="relative pl-3 space-y-4">
        <div className="absolute left-[21px] top-3 bottom-3 w-0.5 bg-slate-800" />

        {steps.map((st, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          const formattedNumber = String(index + 1).padStart(2, '0');

          return (
            <button
              key={st.step}
              onClick={() => onSelectStep(index)}
              className={`group relative flex w-full items-start gap-3.5 rounded-xl p-2.5 text-left transition-all ${
                isCurrent
                  ? 'bg-indigo-600/15 border border-indigo-500/30 shadow-md'
                  : 'hover:bg-slate-800/60'
              }`}
            >
              <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0F172A]">
                {isCompleted && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-400/20" />
                )}
                {isCurrent && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 animate-pulse">
                    <span className="text-[10px] font-bold">{index + 1}</span>
                  </div>
                )}
                {isPending && (
                  <Circle className="h-4 w-4 text-slate-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-semibold ${
                      isCurrent
                        ? 'text-indigo-300 font-bold'
                        : isCompleted
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {formattedNumber} — {st.title}
                  </span>
                </div>
                <p
                  className={`text-[11px] truncate mt-0.5 ${
                    isCurrent ? 'text-slate-200 font-medium' : 'text-slate-400'
                  }`}
                >
                  {st.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
