import React from 'react';
import { EXAMPLES } from '../data/examples';
import type { ExampleRegex } from '../data/examples';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface ExampleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExample: (ex: ExampleRegex) => void;
}

export const ExampleSelector: React.FC<ExampleSelectorProps> = ({
  isOpen,
  onClose,
  onSelectExample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white m-0">Preset Regular Expressions</h2>
              <p className="text-xs text-slate-400 m-0">
                Choose a preset example to instantly run FAFL simulations and Thompson construction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {EXAMPLES.map((ex) => (
            <div
              key={ex.id}
              onClick={() => {
                onSelectExample(ex);
                onClose();
              }}
              className="group cursor-pointer rounded-xl border border-slate-800 bg-[#080E1A] p-4 transition-all hover:border-indigo-500/50 hover:bg-slate-800/80 hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                    {ex.name}
                  </span>
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
                    {ex.category}
                  </span>
                </div>

                <div className="font-mono text-base font-bold text-indigo-400 my-2">
                  {ex.expression}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {ex.explanation}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-indigo-400 border-t border-slate-800/60 pt-2.5 group-hover:text-indigo-300">
                <span>Load Simulation</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
