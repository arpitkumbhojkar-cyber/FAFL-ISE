import type { Automaton, Change } from './automaton';
import type { RegexNode, Token } from './regex';

export type StepType =
  | 'parse'
  | 'ast'
  | 'symbol'
  | 'epsilon'
  | 'concat'
  | 'union'
  | 'star'
  | 'plus'
  | 'optional'
  | 'nfa_complete'
  | 'validation'
  | 'dfa';

export interface ExplanationDetails {
  operation: string;
  why: string;
  createdStates: string[];
  newTransitions: string[];
  humanReadable: string;
}

export interface TransformationStep {
  step: number;
  title: string;
  subtitle: string;
  stepType: StepType;
  expression: string;
  tokens?: Token[];
  ast?: RegexNode;
  activeAstNodeId?: string;
  automaton: Automaton;
  beforeAutomaton?: Automaton;
  changes: Change[];
  explanation: ExplanationDetails;
}
