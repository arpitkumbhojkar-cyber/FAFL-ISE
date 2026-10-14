import type { Automaton } from '../types/automaton';

export interface AutomatonValidationResult {
  isValid: boolean;
  messages: { type: 'success' | 'error' | 'warning'; text: string }[];
  checks: {
    hasStates: boolean;
    hasOneStartState: boolean;
    hasAcceptStates: boolean;
    validTransitionStates: boolean;
    validSymbols: boolean;
    allStatesReachable: boolean;
  };
}

export function validateAutomaton(automaton: Automaton): AutomatonValidationResult {
  const messages: { type: 'success' | 'error' | 'warning'; text: string }[] = [];
  const stateIds = new Set(automaton.states.map((s) => s.id));

  const hasStates = automaton.states.length > 0;
  if (!hasStates) {
    messages.push({ type: 'error', text: 'Automaton contains no states.' });
  } else {
    messages.push({ type: 'success', text: `Automaton contains ${automaton.states.length} states.` });
  }

  const startStates = automaton.states.filter((s) => s.isStart);
  const hasOneStartState = startStates.length === 1 && stateIds.has(automaton.startState);
  if (startStates.length === 0) {
    messages.push({ type: 'error', text: 'Automaton has no initial start state.' });
  } else if (startStates.length > 1) {
    messages.push({ type: 'error', text: 'Automaton has multiple initial start states.' });
  } else {
    messages.push({ type: 'success', text: `Valid single initial start state (${automaton.startState}).` });
  }

  const acceptStatesList = Array.from(automaton.acceptStates);
  const validAcceptStates = acceptStatesList.every((id) => stateIds.has(id));
  const hasAcceptStates = acceptStatesList.length > 0 && validAcceptStates;
  if (acceptStatesList.length === 0) {
    messages.push({ type: 'warning', text: 'Automaton has no accepting states (empty language).' });
  } else if (!validAcceptStates) {
    messages.push({ type: 'error', text: 'One or more accept state IDs are missing from the state list.' });
  } else {
    messages.push({
      type: 'success',
      text: `${acceptStatesList.length} valid accepting state(s) defined (${acceptStatesList.join(', ')}).`,
    });
  }

  let validTransitionStates = true;
  for (const t of automaton.transitions) {
    if (!stateIds.has(t.from) || !stateIds.has(t.to)) {
      validTransitionStates = false;
      messages.push({
        type: 'error',
        text: `Invalid transition ${t.from} --${t.symbol}--> ${t.to}: referenced state does not exist.`,
      });
    }
  }
  if (validTransitionStates && automaton.transitions.length > 0) {
    messages.push({
      type: 'success',
      text: `All ${automaton.transitions.length} transitions connect valid existing states.`,
    });
  }

  let validSymbols = true;
  for (const t of automaton.transitions) {
    if (t.symbol !== 'ε' && !automaton.alphabet.has(t.symbol)) {
      validSymbols = false;
      messages.push({
        type: 'warning',
        text: `Transition symbol '${t.symbol}' is not declared in the alphabet {${Array.from(automaton.alphabet).join(', ')}}.`,
      });
    }
  }
  if (validSymbols) {
    messages.push({ type: 'success', text: 'All transition symbols belong to alphabet or ε.' });
  }

  const visited = new Set<string>();
  if (automaton.startState) {
    const queue = [automaton.startState];
    visited.add(automaton.startState);
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const outgoing = automaton.transitions.filter((t) => t.from === curr);
      for (const t of outgoing) {
        if (!visited.has(t.to)) {
          visited.add(t.to);
          queue.push(t.to);
        }
      }
    }
  }
  const allStatesReachable = visited.size === automaton.states.length;
  if (allStatesReachable) {
    messages.push({ type: 'success', text: 'All states are reachable from the start state.' });
  } else {
    const unreachable = automaton.states.filter((s) => !visited.has(s.id)).map((s) => s.id);
    messages.push({
      type: 'warning',
      text: `Unreachable states detected: ${unreachable.join(', ')}.`,
    });
  }

  const isValid = hasStates && hasOneStartState && hasAcceptStates && validTransitionStates && validSymbols;

  return {
    isValid,
    messages,
    checks: {
      hasStates,
      hasOneStartState,
      hasAcceptStates,
      validTransitionStates,
      validSymbols,
      allStatesReachable,
    },
  };
}
