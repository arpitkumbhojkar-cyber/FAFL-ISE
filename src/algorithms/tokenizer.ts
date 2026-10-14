import type { Token } from '../types/regex';

export function tokenizeRegex(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Check for explicit epsilon strings: 'epsilon', 'eps', 'ε'
    const remaining = input.slice(i);
    if (remaining.startsWith('epsilon')) {
      tokens.push({ type: 'EPSILON', value: 'ε', position: i });
      i += 7;
      continue;
    }
    if (remaining.startsWith('eps')) {
      tokens.push({ type: 'EPSILON', value: 'ε', position: i });
      i += 3;
      continue;
    }
    if (char === 'ε') {
      tokens.push({ type: 'EPSILON', value: 'ε', position: i });
      i++;
      continue;
    }

    // Operators
    if (char === '|') {
      tokens.push({ type: 'UNION', value: '|', position: i });
      i++;
      continue;
    }
    if (char === '*') {
      tokens.push({ type: 'STAR', value: '*', position: i });
      i++;
      continue;
    }
    if (char === '+') {
      tokens.push({ type: 'PLUS', value: '+', position: i });
      i++;
      continue;
    }
    if (char === '?') {
      tokens.push({ type: 'QUESTION', value: '?', position: i });
      i++;
      continue;
    }
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(', position: i });
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')', position: i });
      i++;
      continue;
    }

    // Literals (letters, digits, or other standard characters)
    if (char === '\\' && i + 1 < input.length) {
      tokens.push({ type: 'LITERAL', value: input[i + 1], position: i });
      i += 2;
      continue;
    }

    // Standard literal character
    tokens.push({ type: 'LITERAL', value: char, position: i });
    i++;
  }

  return tokens;
}
