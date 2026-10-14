import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';

interface StepControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onReset: () => void;
}

export const StepControls: React.FC<StepControlsProps> = ({
  currentStepIndex,
  totalSteps,
  isPlaying,
  onPrevious,
  onNext,
  onPlayPause,
  onReset,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        onPlayPause();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevious, onNext, onPlayPause, onReset]);

  if (totalSteps === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Simulation Step:
        </span>
        <span className="rounded-xl bg-indigo-600/20 px-3 py-1 font-mono text-sm font-bold text-indigo-300 border border-indigo-500/30">
          {currentStepIndex + 1} / {totalSteps}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={onPlayPause}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-cyan-400 transition-all active:scale-[0.98]"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 fill-white" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              <span>Play</span>
            </>
          )}
        </button>

        <button
          onClick={onNext}
          disabled={currentStepIndex === totalSteps - 1}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span>Next</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all"
          title="Reset simulation to step 1 (R)"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-500 font-mono">
        <span>Shortcuts:</span>
        <kbd className="rounded bg-slate-800 px-1.5 py-0.5 border border-slate-700">←</kbd>
        <kbd className="rounded bg-slate-800 px-1.5 py-0.5 border border-slate-700">→</kbd>
        <kbd className="rounded bg-slate-800 px-1.5 py-0.5 border border-slate-700">Space</kbd>
        <kbd className="rounded bg-slate-800 px-1.5 py-0.5 border border-slate-700">R</kbd>
      </div>
    </div>
  );
};
