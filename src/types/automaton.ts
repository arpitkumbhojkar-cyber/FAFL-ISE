export interface State {
  id: string;
  isStart: boolean;
  isAccept: boolean;
  label?: string;
  x?: number;
  y?: number;
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  symbol: string; // symbol or 'ε'
}

export interface Automaton {
  states: State[];
  transitions: Transition[];
  alphabet: Set<string>;
  startState: string;
  acceptStates: Set<string>;
  type?: 'ε-NFA' | 'NFA' | 'DFA' | 'Minimal DFA';
}

export type ChangeType =
  | 'state-added'
  | 'state-removed'
  | 'transition-added'
  | 'transition-removed'
  | 'ast-created'
  | 'sub-automaton-combined';

export interface Change {
  type: ChangeType;
  description: string;
  stateId?: string;
  transition?: Transition;
}
