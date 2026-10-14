export type TokenType =
  | 'LITERAL'
  | 'UNION'
  | 'STAR'
  | 'PLUS'
  | 'QUESTION'
  | 'LPAREN'
  | 'RPAREN'
  | 'EPSILON';

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export type RegexNode =
  | {
      type: 'symbol';
      value: string;
      id: string;
    }
  | {
      type: 'epsilon';
      id: string;
    }
  | {
      type: 'union';
      left: RegexNode;
      right: RegexNode;
      id: string;
    }
  | {
      type: 'concat';
      left: RegexNode;
      right: RegexNode;
      id: string;
    }
  | {
      type: 'star';
      child: RegexNode;
      id: string;
    }
  | {
      type: 'plus';
      child: RegexNode;
      id: string;
    }
  | {
      type: 'optional';
      child: RegexNode;
      id: string;
    };
