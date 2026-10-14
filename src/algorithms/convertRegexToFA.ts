import type { Automaton } from '../types/automaton';
import type { RegexNode, Token } from '../types/regex';
import type { TransformationStep } from '../types/transformation';
import { validateAutomaton } from './automatonValidator';
import { parseRegexToAST } from './parser';
import { validateRegex } from './regexValidator';
import type { ValidationResult } from './regexValidator';
import { convertNFAToDFA, minimizeDFA } from './subsetConstruction';
import type { DFACoverage } from './subsetConstruction';
import { buildAutomatonFromAST } from './thompson';
import { tokenizeRegex } from './tokenizer';

export interface ConversionOutput {
  isValid: boolean;
  validationResult: ValidationResult;
  tokens: Token[];
  ast?: RegexNode;
  steps: TransformationStep[];
  finalNFA?: Automaton;
  nfaValidation?: ReturnType<typeof validateAutomaton>;
  dfaCoverage?: DFACoverage;
  minimalDFA?: Automaton;
  error?: string;
}

export function convertRegexToFA(regexString: string): ConversionOutput {
  const validationResult = validateRegex(regexString);

  if (!validationResult.isValid) {
    return {
      isValid: false,
      validationResult,
      tokens: validationResult.tokens,
      steps: [],
      error: validationResult.errors[0]?.message || 'Invalid Regular Expression',
    };
  }

  try {
    const tokens = tokenizeRegex(regexString);
    const ast = parseRegexToAST(tokens);

    const initialAutomaton: Automaton = {
      states: [],
      transitions: [],
      alphabet: validationResult.alphabet,
      startState: '',
      acceptStates: new Set(),
      type: 'ε-NFA',
    };

    const parseStep: TransformationStep = {
      step: 1,
      title: 'Parse & Validate',
      subtitle: 'Tokenized regular expression and verified syntactic validity.',
      stepType: 'parse',
      expression: regexString,
      tokens,
      ast,
      automaton: initialAutomaton,
      changes: [],
      explanation: {
        operation: 'Lexical Analysis & Syntax Validation',
        why: 'Before constructing finite automata, the input string must be tokenized and validated to ensure correct operator placement and balanced parentheses.',
        createdStates: [],
        newTransitions: [],
        humanReadable: `Regex '${regexString}' successfully tokenized into ${tokens.length} tokens with alphabet {${Array.from(validationResult.alphabet).join(', ')}}.`,
      },
    };

    const astStep: TransformationStep = {
      step: 2,
      title: 'Expression Tree (AST)',
      subtitle: 'Constructed Abstract Syntax Tree with explicit operator precedence.',
      stepType: 'ast',
      expression: regexString,
      tokens,
      ast,
      automaton: initialAutomaton,
      changes: [],
      explanation: {
        operation: 'AST Construction (Shunting-Yard)',
        why: 'The expression tree makes precedence explicit: Parentheses > Postfix (*, +, ?) > Concatenation (·) > Union (|).',
        createdStates: [],
        newTransitions: [],
        humanReadable: 'AST generated with explicit parenthesization and implicit concatenation operators.',
      },
    };

    const { finalAutomaton, steps: thompsonSteps } = buildAutomatonFromAST(ast);

    const adjustedThompsonSteps = thompsonSteps.map((st, idx) => ({
      ...st,
      step: idx + 3,
      tokens,
    }));

    const allSteps: TransformationStep[] = [parseStep, astStep, ...adjustedThompsonSteps];

    const nfaValidation = validateAutomaton(finalAutomaton);

    const validationStep: TransformationStep = {
      step: allSteps.length + 1,
      title: 'Automaton Validation',
      subtitle: 'Checked mathematical properties of the generated ε-NFA.',
      stepType: 'validation',
      expression: regexString,
      tokens,
      ast,
      automaton: finalAutomaton,
      changes: [],
      explanation: {
        operation: 'Theory of Computation Validation',
        why: 'Ensures the generated machine has exactly one start state, valid transitions, valid alphabet tokens, and reachable states.',
        createdStates: finalAutomaton.states.map((s) => s.id),
        newTransitions: finalAutomaton.transitions.map((t) => `${t.from} --${t.symbol}--> ${t.to}`),
        humanReadable: nfaValidation.isValid
          ? `✓ Valid ε-NFA verified with ${finalAutomaton.states.length} states.`
          : 'Automaton validation detected warnings.',
      },
    };

    allSteps.push(validationStep);

    let dfaCoverage: DFACoverage | undefined;
    let minimalDFA: Automaton | undefined;

    try {
      dfaCoverage = convertNFAToDFA(finalAutomaton);
      minimalDFA = minimizeDFA(dfaCoverage.dfa);

      const dfaStep: TransformationStep = {
        step: allSteps.length + 1,
        title: 'Convert to DFA',
        subtitle: 'Applied Powerset Subset Construction to eliminate ε-transitions.',
        stepType: 'dfa',
        expression: regexString,
        tokens,
        ast,
        automaton: dfaCoverage.dfa,
        changes: [],
        explanation: {
          operation: 'Subset Construction (Powerset Algorithm)',
          why: 'Converts nondeterministic ε-NFA into a deterministic finite automaton (DFA) where each state represents an ε-closure set of NFA states.',
          createdStates: dfaCoverage.dfa.states.map((s) => s.id),
          newTransitions: dfaCoverage.dfa.transitions.map((t) => `${t.from} --${t.symbol}--> ${t.to}`),
          humanReadable: `Generated DFA with ${dfaCoverage.dfa.states.length} deterministic states and ${dfaCoverage.dfa.transitions.length} transitions.`,
        },
      };

      allSteps.push(dfaStep);
    } catch (err) {
      console.warn('DFA conversion skipped or encountered issue', err);
    }

    return {
      isValid: true,
      validationResult,
      tokens,
      ast,
      steps: allSteps,
      finalNFA: finalAutomaton,
      nfaValidation,
      dfaCoverage,
      minimalDFA,
    };
  } catch (err: any) {
    return {
      isValid: false,
      validationResult,
      tokens: validationResult.tokens,
      steps: [],
      error: err.message || 'Error during conversion process',
    };
  }
}
