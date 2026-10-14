import type { Token } from '../types/regex';
import { tokenizeRegex } from './tokenizer';

export interface ValidationError {
  position?: number;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  tokens: Token[];
  alphabet: Set<string>;
  operators: string[];
  tokenCount: number;
}

export function validateRegex(input: string): ValidationResult {
  const errors: ValidationError[] = [];
  const alphabet = new Set<string>();
  const operators = new Set<string>();

  if (!input || input.trim().length === 0) {
    return {
      isValid: false,
      errors: [{ message: 'Expression is empty. Please enter a regular expression.' }],
      tokens: [],
      alphabet: new Set(),
      operators: [],
      tokenCount: 0,
    };
  }

  const tokens = tokenizeRegex(input);

  if (tokens.length === 0) {
    return {
      isValid: false,
      errors: [{ message: 'Expression contains no valid tokens.' }],
      tokens: [],
      alphabet: new Set(),
      operators: [],
      tokenCount: 0,
    };
  }

  let parenBalance = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const prev = i > 0 ? tokens[i - 1] : null;

    if (token.type === 'LITERAL') {
      alphabet.add(token.value);
    } else if (token.type === 'EPSILON') {
      // Epsilon is special empty string symbol, not in input alphabet
    } else if (token.type === 'UNION') {
      operators.add('Union (|)');
    } else if (token.type === 'STAR') {
      operators.add('Kleene Star (*)');
    } else if (token.type === 'PLUS') {
      operators.add('Positive Closure (+)');
    } else if (token.type === 'QUESTION') {
      operators.add('Optional (?)');
    }

    // Check parenthesis balance
    if (token.type === 'LPAREN') {
      parenBalance++;
    } else if (token.type === 'RPAREN') {
      parenBalance--;
      if (parenBalance < 0) {
        errors.push({
          position: token.position,
          message: `Unexpected closing parenthesis ')' at position ${token.position + 1}.`,
        });
      }
    }

    // Postfix operators (*, +, ?) cannot be at the start or after '(' or after '|'
    if (['STAR', 'PLUS', 'QUESTION'].includes(token.type)) {
      if (!prev) {
        errors.push({
          position: token.position,
          message: `Operator '${token.value}' cannot appear at the beginning of the expression (position ${token.position + 1}).`,
        });
      } else if (prev.type === 'LPAREN') {
        errors.push({
          position: token.position,
          message: `Operator '${token.value}' cannot follow opening parenthesis '(' at position ${token.position + 1}.`,
        });
      } else if (prev.type === 'UNION') {
        errors.push({
          position: token.position,
          message: `Operator '${token.value}' cannot follow union '|' at position ${token.position + 1}.`,
        });
      } else if (['STAR', 'PLUS', 'QUESTION'].includes(prev.type)) {
        errors.push({
          position: token.position,
          message: `Consecutive quantifier '${token.value}' at position ${token.position + 1}. Wrap in parentheses like '(${prev.value})*'.`,
        });
      }
    }

    // Union operator '|' checks
    if (token.type === 'UNION') {
      if (!prev) {
        errors.push({
          position: token.position,
          message: `Union '|' cannot appear at the beginning of the expression (position ${token.position + 1}).`,
        });
      } else if (prev.type === 'UNION') {
        errors.push({
          position: token.position,
          message: `Empty union branch detected at position ${token.position + 1} ('||').`,
        });
      } else if (prev.type === 'LPAREN') {
        errors.push({
          position: token.position,
          message: `Union '|' cannot immediately follow '(' at position ${token.position + 1}.`,
        });
      }
    }

    // Empty parentheses ()
    if (token.type === 'RPAREN' && prev && prev.type === 'LPAREN') {
      errors.push({
        position: token.position,
        message: `Empty parentheses '()' detected at position ${token.position + 1}. Use 'ε' for empty string.`,
      });
    }
  }

  // Trailing union operator
  const lastToken = tokens[tokens.length - 1];
  if (lastToken && lastToken.type === 'UNION') {
    errors.push({
      position: lastToken.position,
      message: `Expression cannot end with union operator '|' at position ${lastToken.position + 1}.`,
    });
  }

  // Missing closing parenthesis
  if (parenBalance > 0) {
    errors.push({
      message: `Missing ${parenBalance} closing parenthesis ')'.`,
    });
  }

  // Check implicit operators presence
  let hasConcat = false;
  for (let i = 0; i < tokens.length - 1; i++) {
    const curr = tokens[i];
    const next = tokens[i + 1];
    const isCurrOperand = ['LITERAL', 'EPSILON', 'RPAREN', 'STAR', 'PLUS', 'QUESTION'].includes(curr.type);
    const isNextOperand = ['LITERAL', 'EPSILON', 'LPAREN'].includes(next.type);
    if (isCurrOperand && isNextOperand) {
      hasConcat = true;
      break;
    }
  }
  if (hasConcat) {
    operators.add('Concatenation');
  }

  return {
    isValid: errors.length === 0,
    errors,
    tokens,
    alphabet,
    operators: Array.from(operators),
    tokenCount: tokens.length,
  };
}
