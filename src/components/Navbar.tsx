import React from 'react';
import { BookOpen, HelpCircle, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenTheory: () => void;
  onOpenExamples: () => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTheory,
  onOpenExamples,
  onOpenHelp,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080E1A]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-cyan-500 to-blue-600 font-extrabold text-white shadow-lg shadow-indigo-500/25">
            <span className="text-xs tracking-tighter">FAFL</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-white m-0 bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text">
                FAFL simulations
              </h1>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block m-0">
              Regular Expression → FA Interactive Simulator
            </p>
          </div>
        </div>

        {/* Right: Action Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onOpenExamples}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Examples</span>
          </button>

          <button
            onClick={onOpenTheory}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
            <span>Theory & Rules</span>
          </button>

          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
