import type { Automaton, State, Transition } from '../types/automaton';
import { epsilonClosureSet, moveSet } from './epsilonClosure';
import { layoutAutomaton } from './thompson';

export interface SubsetConstructionStep {
  dfaStateName: string;
  nfaStates: string[];
  transitions: { symbol: string; targetDfaStateName: string; targetNfaStates: string[] }[];
}

export interface DFACoverage {
  dfa: Automaton;
  steps: SubsetConstructionStep[];
  nfaStateMap: Map<string, string[]>;
}

export function convertNFAToDFA(nfa: Automaton): DFACoverage {
  const alphabetList = Array.from(nfa.alphabet).sort();
  const dfaStates: State[] = [];
  const dfaTransitions: Transition[] = [];
  const dfaAcceptStates = new Set<string>();

  const dfaStateMap = new Map<string, string>();
  const nfaStateMap = new Map<string, string[]>();
  const steps: SubsetConstructionStep[] = [];

  let dfaCount = 0;

  function getDfaStateKey(nfaSet: Set<string>): string {
    return Array.from(nfaSet).sort().join(',');
  }

  const initialNfaSet = epsilonClosureSet(new Set([nfa.startState]), nfa);
  const initialKey = getDfaStateKey(initialNfaSet);

  const startDfaName = 'D0';
  dfaCount++;
  dfaStateMap.set(initialKey, startDfaName);
  nfaStateMap.set(startDfaName, Array.from(initialNfaSet).sort());

  const isInitialAccept = Array.from(initialNfaSet).some((id) => nfa.acceptStates.has(id));
  if (isInitialAccept) dfaAcceptStates.add(startDfaName);

  dfaStates.push({
    id: startDfaName,
    isStart: true,
    isAccept: isInitialAccept,
    label: `{${Array.from(initialNfaSet).join(',')}}`,
  });

  const unprocessedKeys: string[] = [initialKey];

  while (unprocessedKeys.length > 0) {
    const currentKey = unprocessedKeys.shift()!;
    const currentDfaName = dfaStateMap.get(currentKey)!;
    const currentNfaSet = new Set(currentKey ? currentKey.split(',') : []);

    const stepTransitions: { symbol: string; targetDfaStateName: string; targetNfaStates: string[] }[] = [];

    for (const sym of alphabetList) {
      const { nextStates } = moveSet(currentNfaSet, sym, nfa);
      const closureSet = epsilonClosureSet(nextStates, nfa);

      if (closureSet.size === 0) {
        continue;
      }

      const targetKey = getDfaStateKey(closureSet);
      let targetDfaName = dfaStateMap.get(targetKey);

      if (!targetDfaName) {
        targetDfaName = `D${dfaCount++}`;
        dfaStateMap.set(targetKey, targetDfaName);
        nfaStateMap.set(targetDfaName, Array.from(closureSet).sort());

        const isAccept = Array.from(closureSet).some((id) => nfa.acceptStates.has(id));
        if (isAccept) dfaAcceptStates.add(targetDfaName);

        dfaStates.push({
          id: targetDfaName,
          isStart: false,
          isAccept,
          label: `{${Array.from(closureSet).join(',')}}`,
        });

        unprocessedKeys.push(targetKey);
      }

      dfaTransitions.push({
        id: `t_${currentDfaName}_${targetDfaName}_${sym}`,
        from: currentDfaName,
        to: targetDfaName,
        symbol: sym,
      });

      stepTransitions.push({
        symbol: sym,
        targetDfaStateName: targetDfaName,
        targetNfaStates: Array.from(closureSet).sort(),
      });
    }

    steps.push({
      dfaStateName: currentDfaName,
      nfaStates: Array.from(currentNfaSet).sort(),
      transitions: stepTransitions,
    });
  }

  const laidOutStates = layoutAutomaton(dfaStates, dfaTransitions);

  const dfa: Automaton = {
    states: laidOutStates,
    transitions: dfaTransitions,
    alphabet: nfa.alphabet,
    startState: startDfaName,
    acceptStates: dfaAcceptStates,
    type: 'DFA',
  };

  return { dfa, steps, nfaStateMap };
}

export function minimizeDFA(dfa: Automaton): Automaton {
  const reachable = new Set<string>();
  const queue = [dfa.startState];
  reachable.add(dfa.startState);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const outgoing = dfa.transitions.filter((t) => t.from === curr);
    for (const t of outgoing) {
      if (!reachable.has(t.to)) {
        reachable.add(t.to);
        queue.push(t.to);
      }
    }
  }

  const activeStates = dfa.states.filter((s) => reachable.has(s.id));
  const activeTransitions = dfa.transitions.filter(
    (t) => reachable.has(t.from) && reachable.has(t.to)
  );

  const acceptSet = new Set(Array.from(dfa.acceptStates).filter((id) => reachable.has(id)));
  const nonAcceptSet = new Set(activeStates.map((s) => s.id).filter((id) => !acceptSet.has(id)));

  let partitions: Set<string>[] = [];
  if (acceptSet.size > 0) partitions.push(acceptSet);
  if (nonAcceptSet.size > 0) partitions.push(nonAcceptSet);

  const alphabetList = Array.from(dfa.alphabet);

  function getPartitionIndex(stateId: string): number {
    return partitions.findIndex((p) => p.has(stateId));
  }

  let changed = true;
  while (changed) {
    changed = false;
    const nextPartitions: Set<string>[] = [];

    for (const group of partitions) {
      if (group.size <= 1) {
        nextPartitions.push(group);
        continue;
      }

      const signatureMap = new Map<string, Set<string>>();

      for (const stateId of group) {
        const sigParts: string[] = [];
        for (const sym of alphabetList) {
          const trans = activeTransitions.find((t) => t.from === stateId && t.symbol === sym);
          const targetPartition = trans ? getPartitionIndex(trans.to) : -1;
          sigParts.push(`${sym}:${targetPartition}`);
        }
        const sig = sigParts.join('|');

        if (!signatureMap.has(sig)) {
          signatureMap.set(sig, new Set());
        }
        signatureMap.get(sig)!.add(stateId);
      }

      if (signatureMap.size > 1) {
        changed = true;
        for (const subGroup of signatureMap.values()) {
          nextPartitions.push(subGroup);
        }
      } else {
        nextPartitions.push(group);
      }
    }

    partitions = nextPartitions;
  }

  const minStates: State[] = [];
  const minTransitions: Transition[] = [];
  const minAcceptStates = new Set<string>();
  const stateToMinId = new Map<string, string>();

  partitions.forEach((group, idx) => {
    const minId = `M${idx}`;
    const groupList = Array.from(group).sort();
    const isStart = groupList.includes(dfa.startState);
    const isAccept = groupList.some((id) => acceptSet.has(id));

    groupList.forEach((id) => stateToMinId.set(id, minId));

    minStates.push({
      id: minId,
      isStart,
      isAccept,
      label: groupList.join('/'),
    });

    if (isAccept) minAcceptStates.add(minId);
  });

  const startMinId = stateToMinId.get(dfa.startState)!;

  const transSet = new Set<string>();

  for (const t of activeTransitions) {
    const fromMin = stateToMinId.get(t.from)!;
    const toMin = stateToMinId.get(t.to)!;
    const key = `${fromMin}->${toMin}:${t.symbol}`;

    if (!transSet.has(key)) {
      transSet.add(key);
      minTransitions.push({
        id: `mt_${fromMin}_${toMin}_${t.symbol}`,
        from: fromMin,
        to: toMin,
        symbol: t.symbol,
      });
    }
  }

  const laidOutMin = layoutAutomaton(minStates, minTransitions);

  return {
    states: laidOutMin,
    transitions: minTransitions,
    alphabet: dfa.alphabet,
    startState: startMinId,
    acceptStates: minAcceptStates,
    type: 'Minimal DFA',
  };
}
