import React from 'react';
import { Play, Sparkles } from 'lucide-react';

interface HeroProps {
  onStartSimulation: () => void;
  onTryExample: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartSimulation, onTryExample }) => {
  return (
    <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#080E1A] via-[#0F172A] to-[#080E1A] px-4 py-10 sm:px-6 sm:py-14">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[600px] rounded-full bg-indigo-600/15 blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-1/4 h-48 w-48 rounded-full bg-cyan-500/10 blur-2xl" />

      <div className="mx-auto max-w-4xl text-center relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md mb-6">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>FAFL simulations — Thompson Construction Algorithm</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-4 leading-tight">
          Turn expressions into machines.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Understand every transition.
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
          Convert regular expressions into finite automata visually. Step through Thompson's Construction, inspect ε-NFA operations, validate automata, and run string simulations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onStartSimulation}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-cyan-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Start Simulation</span>
          </button>

          <button
            onClick={onTryExample}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Try Preset Examples</span>
          </button>
        </div>
      </div>
    </div>
  );
};
