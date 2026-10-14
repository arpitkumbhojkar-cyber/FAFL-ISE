import type { Automaton } from '../types/automaton';

export interface SimulationStep {
  stepIndex: number;
  symbol: string;
  beforeStates: string[];
  moveStates: string[];
  afterStates: string[];
  activeTransitions: { from: string; to: string; symbol: string }[];
}

export interface SimulationResult {
  isAccepted: boolean;
  inputString: string;
  steps: SimulationStep[];
  finalActiveStates: string[];
}

export function epsilonClosureState(stateId: string, automaton: Automaton): Set<string> {
  return epsilonClosureSet(new Set([stateId]), automaton);
}

export function epsilonClosureSet(stateIds: Set<string>, automaton: Automaton): Set<string> {
  const closure = new Set<string>(stateIds);
  const stack = Array.from(stateIds);

  while (stack.length > 0) {
    const curr = stack.pop()!;
    const epsTransitions = automaton.transitions.filter(
      (t) => t.from === curr && t.symbol === 'ε'
    );

    for (const t of epsTransitions) {
      if (!closure.has(t.to)) {
        closure.add(t.to);
        stack.push(t.to);
      }
    }
  }

  return closure;
}

export function moveSet(stateIds: Set<string>, symbol: string, automaton: Automaton): {
  nextStates: Set<string>;
  usedTransitions: { from: string; to: string; symbol: string }[];
} {
  const nextStates = new Set<string>();
  const usedTransitions: { from: string; to: string; symbol: string }[] = [];

  for (const s of stateIds) {
    const symbolTrans = automaton.transitions.filter(
      (t) => t.from === s && t.symbol === symbol
    );
    for (const t of symbolTrans) {
      nextStates.add(t.to);
      usedTransitions.push(t);
    }
  }

  return { nextStates, usedTransitions };
}

export function simulateNFA(inputString: string, automaton: Automaton): SimulationResult {
  const steps: SimulationStep[] = [];

  let currentStates = epsilonClosureState(automaton.startState, automaton);

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    const beforeList = Array.from(currentStates);

    const { nextStates, usedTransitions } = moveSet(currentStates, char, automaton);
    const moveList = Array.from(nextStates);

    const afterSet = epsilonClosureSet(nextStates, automaton);
    const afterList = Array.from(afterSet);

    steps.push({
      stepIndex: i + 1,
      symbol: char,
      beforeStates: beforeList,
      moveStates: moveList,
      afterStates: afterList,
      activeTransitions: usedTransitions,
    });

    currentStates = afterSet;
  }

  const isAccepted = Array.from(currentStates).some((stateId) =>
    automaton.acceptStates.has(stateId)
  );

  return {
    isAccepted,
    inputString,
    steps,
    finalActiveStates: Array.from(currentStates),
  };
}
