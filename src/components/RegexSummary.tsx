import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ValidationResult } from '../algorithms/regexValidator';

interface RegexSummaryProps {
  expression: string;
  validationResult: ValidationResult | null;
}

export const RegexSummary: React.FC<RegexSummaryProps> = ({
  expression,
  validationResult,
}) => {
  if (!validationResult) return null;

  const alphabetArr = Array.from(validationResult.alphabet);

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 m-0">
          Regex Summary
        </h3>

        {validationResult.isValid ? (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4" />
            <span>✓ Valid Expression</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-4 w-4" />
            <span>✗ Invalid Expression</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Expression
          </div>
          <div className="font-mono text-sm font-bold text-indigo-300 truncate">
            {expression || 'ε'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Alphabet (Σ)
          </div>
          <div className="font-mono text-sm font-bold text-emerald-300">
            {alphabetArr.length > 0 ? `{${alphabetArr.join(', ')}}` : '∅'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Tokens
          </div>
          <div className="font-mono text-sm font-bold text-cyan-300">
            {validationResult.tokenCount}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#080E1A] p-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Type
          </div>
          <div className="text-sm font-semibold text-slate-200">
            Regular Expression
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-400">Operators Detected:</span>
        {validationResult.operators.length > 0 ? (
          validationResult.operators.map((op) => (
            <span
              key={op}
              className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-300"
            >
              {op}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-500">None</span>
        )}
      </div>

      {!validationResult.isValid && validationResult.errors.length > 0 && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Syntax Validation Errors</span>
          </div>
          <ul className="space-y-1.5 text-xs text-rose-300 list-disc list-inside">
            {validationResult.errors.map((err, idx) => (
              <li key={idx}>
                {err.position !== undefined && (
                  <span className="font-mono font-bold text-rose-200 mr-1">
                    [Position {err.position + 1}]
                  </span>
                )}
                {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
