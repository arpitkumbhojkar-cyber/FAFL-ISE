import type { RegexNode, Token } from '../types/regex';

let nodeIdCounter = 0;
function resetNodeIdCounter() {
  nodeIdCounter = 0;
}
function nextNodeId(): string {
  nodeIdCounter++;
  return `node_${nodeIdCounter}`;
}

type InternalToken =
  | Token
  | { type: 'CONCAT'; value: '·'; position: number };

export function parseRegexToAST(tokens: Token[]): RegexNode {
  resetNodeIdCounter();

  if (tokens.length === 0) {
    return { type: 'epsilon', id: nextNodeId() };
  }

  // Step 1: Insert implicit concatenation tokens
  const formatted: InternalToken[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    formatted.push(current);

    if (i < tokens.length - 1) {
      const next = tokens[i + 1];

      const isCurrentEnding =
        ['LITERAL', 'EPSILON', 'RPAREN', 'STAR', 'PLUS', 'QUESTION'].includes(current.type);
      const isNextStarting =
        ['LITERAL', 'EPSILON', 'LPAREN'].includes(next.type);

      if (isCurrentEnding && isNextStarting) {
        formatted.push({
          type: 'CONCAT',
          value: '·',
          position: current.position,
        });
      }
    }
  }

  // Step 2: Convert to Postfix (Shunting Yard)
  const outputQueue: InternalToken[] = [];
  const operatorStack: InternalToken[] = [];

  const precedence: Record<string, number> = {
    '*': 3,
    '+': 3,
    '?': 3,
    '·': 2,
    '|': 1,
  };

  for (const token of formatted) {
    if (token.type === 'LITERAL' || token.type === 'EPSILON') {
      outputQueue.push(token);
    } else if (['STAR', 'PLUS', 'QUESTION'].includes(token.type)) {
      outputQueue.push(token);
    } else if (token.type === 'CONCAT' || token.type === 'UNION') {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type !== 'LPAREN' &&
        (precedence[operatorStack[operatorStack.length - 1].value] || 0) >=
          (precedence[token.value] || 0)
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type !== 'LPAREN'
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.pop(); // Pop '('
    }
  }

  while (operatorStack.length > 0) {
    outputQueue.push(operatorStack.pop()!);
  }

  // Step 3: Build AST from Postfix
  const stack: RegexNode[] = [];

  for (const item of outputQueue) {
    if (item.type === 'LITERAL') {
      stack.push({
        type: 'symbol',
        value: item.value,
        id: nextNodeId(),
      });
    } else if (item.type === 'EPSILON') {
      stack.push({
        type: 'epsilon',
        id: nextNodeId(),
      });
    } else if (item.type === 'STAR') {
      const child = stack.pop();
      if (!child) throw new Error('Invalid expression for star operation');
      stack.push({
        type: 'star',
        child,
        id: nextNodeId(),
      });
    } else if (item.type === 'PLUS') {
      const child = stack.pop();
      if (!child) throw new Error('Invalid expression for plus operation');
      stack.push({
        type: 'plus',
        child,
        id: nextNodeId(),
      });
    } else if (item.type === 'QUESTION') {
      const child = stack.pop();
      if (!child) throw new Error('Invalid expression for optional operation');
      stack.push({
        type: 'optional',
        child,
        id: nextNodeId(),
      });
    } else if (item.type === 'CONCAT') {
      const right = stack.pop();
      const left = stack.pop();
      if (!left || !right) throw new Error('Invalid expression for concatenation');
      stack.push({
        type: 'concat',
        left,
        right,
        id: nextNodeId(),
      });
    } else if (item.type === 'UNION') {
      const right = stack.pop();
      const left = stack.pop();
      if (!left || !right) throw new Error('Invalid expression for union');
      stack.push({
        type: 'union',
        left,
        right,
        id: nextNodeId(),
      });
    }
  }

  if (stack.length !== 1) {
    throw new Error('Failed to construct AST: malformed expression');
  }

  return stack[0];
}
