import React, { useState } from 'react';
import type { Token } from '../types/regex';

interface TokenDisplayProps {
  tokens: Token[];
}

export const TokenDisplay: React.FC<TokenDisplayProps> = ({ tokens }) => {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  if (!tokens || tokens.length === 0) return null;

  const getTokenMeaning = (token: Token): string => {
    switch (token.type) {
      case 'LITERAL':
        return `Literal symbol '${token.value}' from alphabet.`;
      case 'UNION':
        return `Union operator '|' (OR). Evaluates alternatives.`;
      case 'STAR':
        return `Kleene Star '*' (0 or more repetitions).`;
      case 'PLUS':
        return `Positive Closure '+' (1 or more repetitions).`;
      case 'QUESTION':
        return `Optional operator '?' (0 or 1 occurrence).`;
      case 'LPAREN':
        return `Left parenthesis '('. Groups sub-expression.`;
      case 'RPAREN':
        return `Right parenthesis ')'. Closes sub-expression group.`;
      case 'EPSILON':
        return `Epsilon 'ε'. Empty string symbol.`;
      default:
        return `Token '${token.value}'.`;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 m-0">
          Tokenized Sequence
        </h3>
        <span className="text-xs text-slate-400">Click any token for details</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {tokens.map((token, index) => {
          const isSelected = selectedToken?.position === token.position;
          let colorClass = 'border-slate-700 bg-slate-800 text-slate-200';

          if (token.type === 'LITERAL') {
            colorClass = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
          } else if (['UNION', 'STAR', 'PLUS', 'QUESTION'].includes(token.type)) {
            colorClass = 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300';
          } else if (['LPAREN', 'RPAREN'].includes(token.type)) {
            colorClass = 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300';
          } else if (token.type === 'EPSILON') {
            colorClass = 'border-amber-500/40 bg-amber-500/10 text-amber-300';
          }

          return (
            <button
              key={`${token.position}-${index}`}
              onClick={() => setSelectedToken(token)}
              className={`group relative flex flex-col items-center justify-center rounded-xl border px-3 py-2 transition-all hover:scale-105 ${colorClass} ${
                isSelected ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-[#0F172A]' : ''
              }`}
            >
              <span className="font-mono text-base font-bold">{token.value}</span>
              <span className="text-[10px] text-slate-400 font-sans mt-0.5">#{index + 1}</span>
            </button>
          );
        })}
      </div>

      {selectedToken && (
        <div className="mt-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs">
          <div className="flex items-center justify-between font-bold text-indigo-300 mb-1">
            <span>
              Token: <code className="text-white bg-slate-800 px-1.5 py-0.5 rounded">{selectedToken.value}</code>
            </span>
            <span className="text-slate-400 font-mono">Position {selectedToken.position + 1}</span>
          </div>
          <p className="text-slate-200">{getTokenMeaning(selectedToken)}</p>
        </div>
      )}
    </div>
  );
};
