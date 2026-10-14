import React from 'react';
import { BookOpen, X, Code, Layers, Sparkles } from 'lucide-react';

interface TheoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryPanel: React.FC<TheoryPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white m-0">FAFL simulations — Theory Guide</h2>
              <p className="text-xs text-slate-400 m-0">
                Understanding Regular Expressions, Finite Automata, and Thompson's Construction
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

        <div className="space-y-4 text-xs text-slate-300">
          <section className="rounded-xl border border-slate-800 bg-[#080E1A] p-4 space-y-2">
            <h3 className="text-sm font-bold text-indigo-300 m-0 flex items-center gap-2">
              <Code className="h-4 w-4 text-indigo-400" />
              What is a Regular Expression?
            </h3>
            <p className="leading-relaxed">
              A <strong>Regular Expression (regex)</strong> is a sequence of characters that specifies a search pattern or formal language over an alphabet Σ. Basic regular expressions are constructed recursively using symbols, empty string (ε), union (|), concatenation (·), and Kleene Star (*).
            </p>
          </section>

          <section className="rounded-xl border border-slate-800 bg-[#080E1A] p-4 space-y-2">
            <h3 className="text-sm font-bold text-cyan-300 m-0 flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              What is a Finite Automaton?
            </h3>
            <p className="leading-relaxed">
              A <strong>Finite Automaton (FA)</strong> is an abstract mathematical machine consisting of a finite set of states, an input alphabet, transition functions, a start state, and a set of accept states. An <strong>ε-NFA</strong> allows transitions between states without consuming input symbols (via ε-transitions).
            </p>
          </section>

          <section className="rounded-xl border border-slate-800 bg-[#080E1A] p-4 space-y-3">
            <h3 className="text-sm font-bold text-emerald-300 m-0 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Thompson's Construction Rules
            </h3>
            <p className="leading-relaxed">
              Thompson's construction converts any regular expression into an equivalent ε-NFA with exactly one start state and one accept state using structural induction.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg border border-slate-800 bg-[#1E293B] p-3">
                <div className="font-bold text-white mb-1">1. Symbol Construction (a)</div>
                <div className="font-mono text-emerald-400">q0 ──a──&gt; q1</div>
                <p className="text-[11px] text-slate-400 mt-1">Creates two states connected by the symbol transition.</p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#1E293B] p-3">
                <div className="font-bold text-white mb-1">2. Concatenation (A · B)</div>
                <div className="font-mono text-emerald-400">accept(A) ──ε──&gt; start(B)</div>
                <p className="text-[11px] text-slate-400 mt-1">Links accept state of A to start state of B via ε.</p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#1E293B] p-3">
                <div className="font-bold text-white mb-1">3. Union (A | B)</div>
                <div className="font-mono text-emerald-400">new_start ──ε──&gt; start(A), start(B)</div>
                <p className="text-[11px] text-slate-400 mt-1">Branches into both sub-automata from new start state.</p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#1E293B] p-3">
                <div className="font-bold text-white mb-1">4. Kleene Star (A*)</div>
                <div className="font-mono text-emerald-400">loopback + bypass ε-transitions</div>
                <p className="text-[11px] text-slate-400 mt-1">Bypass allows 0 occurrences; loopback allows unlimited passes.</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-[#080E1A] p-4 space-y-2">
            <h3 className="text-sm font-bold text-amber-300 m-0">Why Convert Regular Expressions to Finite Automata?</h3>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              <li><strong>Compiler Lexical Analysis (Scanners):</strong> Lexical analyzers like Flex/Lex convert regular expressions for tokens into NFAs/DFAs for high-speed code scanning.</li>
              <li><strong>Pattern Matching Algorithms:</strong> Search engines and text tools (Grep) construct NFAs/DFAs to execute regex matching in O(n) time.</li>
              <li><strong>Theoretical Equivalence:</strong> Demonstrates Kleene's Theorem: the class of languages defined by regular expressions is identical to languages accepted by finite automata.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
