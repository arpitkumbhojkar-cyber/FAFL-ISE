import type { Automaton, Change, State, Transition } from '../types/automaton';
import type { RegexNode } from '../types/regex';
import type { TransformationStep } from '../types/transformation';

interface SubAutomaton {
  states: State[];
  transitions: Transition[];
  startStateId: string;
  acceptStateId: string;
  alphabet: Set<string>;
}

class IdGenerator {
  private count = 0;
  reset() {
    this.count = 0;
  }
  next(): string {
    const id = `q${this.count}`;
    this.count++;
    return id;
  }
}

export function layoutAutomaton(states: State[], transitions: Transition[]): State[] {
  if (states.length === 0) return [];

  // Build adjacency graph for rank calculation
  const startState = states.find((s) => s.isStart) || states[0];
  const ranks: Map<string, number> = new Map();
  ranks.set(startState.id, 0);

  let changed = true;
  let passes = 0;
  while (changed && passes < states.length + 5) {
    changed = false;
    passes++;
    for (const t of transitions) {
      if (ranks.has(t.from)) {
        const fromRank = ranks.get(t.from)!;
        const targetRank = fromRank + 1;
        if (!ranks.has(t.to) || ranks.get(t.to)! < targetRank) {
          if (!ranks.has(t.to)) {
            ranks.set(t.to, targetRank);
            changed = true;
          }
        }
      }
    }
  }

  // Ensure all states have a rank
  for (const s of states) {
    if (!ranks.has(s.id)) {
      ranks.set(s.id, 0);
    }
  }

  // Group states by rank
  const rankGroups: Map<number, State[]> = new Map();
  for (const s of states) {
    const r = ranks.get(s.id)!;
    if (!rankGroups.has(r)) rankGroups.set(r, []);
    rankGroups.get(r)!.push(s);
  }

  const sortedRanks = Array.from(rankGroups.keys()).sort((a, b) => a - b);

  const HORIZONTAL_SPACING = 140;
  const VERTICAL_SPACING = 100;
  const START_X = 80;
  const START_Y = 160;

  const positionedStates: State[] = [];

  sortedRanks.forEach((r, rankIndex) => {
    const group = rankGroups.get(r)!;
    const totalGroupHeight = (group.length - 1) * VERTICAL_SPACING;
    const startYForGroup = START_Y - totalGroupHeight / 2;

    group.forEach((state, itemIndex) => {
      positionedStates.push({
        ...state,
        x: START_X + rankIndex * HORIZONTAL_SPACING,
        y: startYForGroup + itemIndex * VERTICAL_SPACING,
      });
    });
  });

  return positionedStates;
}

export function buildAutomatonFromAST(ast: RegexNode): {
  finalAutomaton: Automaton;
  steps: TransformationStep[];
} {
  const idGen = new IdGenerator();
  const steps: TransformationStep[] = [];
  let stepIndex = 1;

  function createStep(
    title: string,
    subtitle: string,
    stepType: TransformationStep['stepType'],
    expression: string,
    sub: SubAutomaton,
    activeAstNodeId: string,
    beforeSub?: SubAutomaton,
    changes: Change[] = [],
    explanationDetails?: TransformationStep['explanation']
  ): TransformationStep {
    const currentAutomaton: Automaton = {
      states: layoutAutomaton(
        sub.states.map((s) => ({
          ...s,
          isStart: s.id === sub.startStateId,
          isAccept: s.id === sub.acceptStateId,
        })),
        sub.transitions
      ),
      transitions: sub.transitions,
      alphabet: sub.alphabet,
      startState: sub.startStateId,
      acceptStates: new Set([sub.acceptStateId]),
      type: 'ε-NFA',
    };

    let beforeAutomaton: Automaton | undefined;
    if (beforeSub) {
      beforeAutomaton = {
        states: layoutAutomaton(
          beforeSub.states.map((s) => ({
            ...s,
            isStart: s.id === beforeSub.startStateId,
            isAccept: s.id === beforeSub.acceptStateId,
          })),
          beforeSub.transitions
        ),
        transitions: beforeSub.transitions,
        alphabet: beforeSub.alphabet,
        startState: beforeSub.startStateId,
        acceptStates: new Set([beforeSub.acceptStateId]),
        type: 'ε-NFA',
      };
    }

    const stepObj: TransformationStep = {
      step: stepIndex++,
      title,
      subtitle,
      stepType,
      expression,
      ast,
      activeAstNodeId,
      automaton: currentAutomaton,
      beforeAutomaton,
      changes,
      explanation: explanationDetails || {
        operation: title,
        why: subtitle,
        createdStates: sub.states.map((s) => s.id),
        newTransitions: sub.transitions.map((t) => `${t.from} --${t.symbol}--> ${t.to}`),
        humanReadable: subtitle,
      },
    };

    steps.push(stepObj);
    return stepObj;
  }

  function buildSub(node: RegexNode): SubAutomaton {
    switch (node.type) {
      case 'symbol': {
        const s0Id = idGen.next();
        const s1Id = idGen.next();
        const s0: State = { id: s0Id, isStart: true, isAccept: false };
        const s1: State = { id: s1Id, isStart: false, isAccept: true };
        const trans: Transition = {
          id: `t_${s0Id}_${s1Id}`,
          from: s0Id,
          to: s1Id,
          symbol: node.value,
        };

        const sub: SubAutomaton = {
          states: [s0, s1],
          transitions: [trans],
          startStateId: s0Id,
          acceptStateId: s1Id,
          alphabet: new Set([node.value]),
        };

        createStep(
          `Basic Automaton: '${node.value}'`,
          `Constructs an atomic state transition for literal '${node.value}'.`,
          'symbol',
          node.value,
          sub,
          node.id,
          undefined,
          [
            { type: 'state-added', description: `Created initial state ${s0Id}`, stateId: s0Id },
            { type: 'state-added', description: `Created accept state ${s1Id}`, stateId: s1Id },
            { type: 'transition-added', description: `Added transition ${s0Id} --${node.value}--> ${s1Id}`, transition: trans },
          ],
          {
            operation: `Basic Symbol Construction: '${node.value}'`,
            why: `Every atomic symbol in a regular expression corresponds to a basic automaton with two states connected by a symbol transition.`,
            createdStates: [s0Id, s1Id],
            newTransitions: [`${s0Id} --${node.value}--> ${s1Id}`],
            humanReadable: `Created start state ${s0Id} and accept state ${s1Id} with a direct transition on symbol '${node.value}'.`,
          }
        );

        return sub;
      }

      case 'epsilon': {
        const s0Id = idGen.next();
        const s1Id = idGen.next();
        const s0: State = { id: s0Id, isStart: true, isAccept: false };
        const s1: State = { id: s1Id, isStart: false, isAccept: true };
        const trans: Transition = {
          id: `t_${s0Id}_${s1Id}`,
          from: s0Id,
          to: s1Id,
          symbol: 'ε',
        };

        const sub: SubAutomaton = {
          states: [s0, s1],
          transitions: [trans],
          startStateId: s0Id,
          acceptStateId: s1Id,
          alphabet: new Set(),
        };

        createStep(
          `Basic Automaton: 'ε'`,
          `Constructs an atomic automaton for the empty string (ε).`,
          'epsilon',
          'ε',
          sub,
          node.id,
          undefined,
          [
            { type: 'state-added', description: `Created initial state ${s0Id}`, stateId: s0Id },
            { type: 'state-added', description: `Created accept state ${s1Id}`, stateId: s1Id },
            { type: 'transition-added', description: `Added ε-transition ${s0Id} --ε--> ${s1Id}`, transition: trans },
          ],
          {
            operation: `Epsilon (Empty String) Construction`,
            why: `Epsilon represents the empty string. It moves from start to accept state without consuming any input characters.`,
            createdStates: [s0Id, s1Id],
            newTransitions: [`${s0Id} --ε--> ${s1Id}`],
            humanReadable: `Created start state ${s0Id} and accept state ${s1Id} connected by an ε-transition.`,
          }
        );

        return sub;
      }

      case 'concat': {
        const leftSub = buildSub(node.left);
        const rightSub = buildSub(node.right);

        const beforeSub: SubAutomaton = {
          states: [...leftSub.states, ...rightSub.states],
          transitions: [...leftSub.transitions, ...rightSub.transitions],
          startStateId: leftSub.startStateId,
          acceptStateId: rightSub.acceptStateId,
          alphabet: new Set([...leftSub.alphabet, ...rightSub.alphabet]),
        };

        const concatTrans: Transition = {
          id: `t_${leftSub.acceptStateId}_${rightSub.startStateId}`,
          from: leftSub.acceptStateId,
          to: rightSub.startStateId,
          symbol: 'ε',
        };

        const combinedStates: State[] = [
          ...leftSub.states.map((s) => ({
            ...s,
            isStart: s.id === leftSub.startStateId,
            isAccept: false,
          })),
          ...rightSub.states.map((s) => ({
            ...s,
            isStart: false,
            isAccept: s.id === rightSub.acceptStateId,
          })),
        ];

        const combinedTransitions = [
          ...leftSub.transitions,
          ...rightSub.transitions,
          concatTrans,
        ];

        const alphabet = new Set([...leftSub.alphabet, ...rightSub.alphabet]);

        const sub: SubAutomaton = {
          states: combinedStates,
          transitions: combinedTransitions,
          startStateId: leftSub.startStateId,
          acceptStateId: rightSub.acceptStateId,
          alphabet,
        };

        createStep(
          `Concatenation Construction`,
          `Connects the accept state of the first automaton to the start state of the second via an ε-transition.`,
          'concat',
          `Concatenation`,
          sub,
          node.id,
          beforeSub,
          [
            {
              type: 'transition-added',
              description: `Connected ${leftSub.acceptStateId} to ${rightSub.startStateId} with ε-transition`,
              transition: concatTrans,
            },
          ],
          {
            operation: `Concatenation Construction (A · B)`,
            why: `To accept string AB, the machine must complete the language of A and immediately transition to language B without consuming input.`,
            createdStates: [],
            newTransitions: [`${leftSub.acceptStateId} --ε--> ${rightSub.startStateId}`],
            humanReadable: `Linked the accept state of the left expression (${leftSub.acceptStateId}) to the start state of the right expression (${rightSub.startStateId}) using an ε-transition.`,
          }
        );

        return sub;
      }

      case 'union': {
        const leftSub = buildSub(node.left);
        const rightSub = buildSub(node.right);

        const beforeSub: SubAutomaton = {
          states: [...leftSub.states, ...rightSub.states],
          transitions: [...leftSub.transitions, ...rightSub.transitions],
          startStateId: leftSub.startStateId,
          acceptStateId: leftSub.acceptStateId,
          alphabet: new Set([...leftSub.alphabet, ...rightSub.alphabet]),
        };

        const newStartId = idGen.next();
        const newAcceptId = idGen.next();

        const newStart: State = { id: newStartId, isStart: true, isAccept: false };
        const newAccept: State = { id: newAcceptId, isStart: false, isAccept: true };

        const tStartToLeft: Transition = {
          id: `t_${newStartId}_${leftSub.startStateId}`,
          from: newStartId,
          to: leftSub.startStateId,
          symbol: 'ε',
        };
        const tStartToRight: Transition = {
          id: `t_${newStartId}_${rightSub.startStateId}`,
          from: newStartId,
          to: rightSub.startStateId,
          symbol: 'ε',
        };
        const tLeftToAccept: Transition = {
          id: `t_${leftSub.acceptStateId}_${newAcceptId}`,
          from: leftSub.acceptStateId,
          to: newAcceptId,
          symbol: 'ε',
        };
        const tRightToAccept: Transition = {
          id: `t_${rightSub.acceptStateId}_${newAcceptId}`,
          from: rightSub.acceptStateId,
          to: newAcceptId,
          symbol: 'ε',
        };

        const combinedStates: State[] = [
          newStart,
          ...leftSub.states.map((s) => ({ ...s, isStart: false, isAccept: false })),
          ...rightSub.states.map((s) => ({ ...s, isStart: false, isAccept: false })),
          newAccept,
        ];

        const combinedTransitions = [
          ...leftSub.transitions,
          ...rightSub.transitions,
          tStartToLeft,
          tStartToRight,
          tLeftToAccept,
          tRightToAccept,
        ];

        const alphabet = new Set([...leftSub.alphabet, ...rightSub.alphabet]);

        const sub: SubAutomaton = {
          states: combinedStates,
          transitions: combinedTransitions,
          startStateId: newStartId,
          acceptStateId: newAcceptId,
          alphabet,
        };

        createStep(
          `Union Construction (|)`,
          `Creates new start state ${newStartId} and accept state ${newAcceptId}, branching into both sub-automata with ε-transitions.`,
          'union',
          `Union (|)`,
          sub,
          node.id,
          beforeSub,
          [
            { type: 'state-added', description: `Created new start state ${newStartId}`, stateId: newStartId },
            { type: 'state-added', description: `Created new accept state ${newAcceptId}`, stateId: newAcceptId },
            { type: 'transition-added', description: `${newStartId} --ε--> ${leftSub.startStateId}`, transition: tStartToLeft },
            { type: 'transition-added', description: `${newStartId} --ε--> ${rightSub.startStateId}`, transition: tStartToRight },
            { type: 'transition-added', description: `${leftSub.acceptStateId} --ε--> ${newAcceptId}`, transition: tLeftToAccept },
            { type: 'transition-added', description: `${rightSub.acceptStateId} --ε--> ${newAcceptId}`, transition: tRightToAccept },
          ],
          {
            operation: `Union Construction (A | B)`,
            why: `Union represents non-deterministic choice. The automaton can non-deterministcally choose either branch from the new start state via ε.`,
            createdStates: [newStartId, newAcceptId],
            newTransitions: [
              `${newStartId} --ε--> ${leftSub.startStateId}`,
              `${newStartId} --ε--> ${rightSub.startStateId}`,
              `${leftSub.acceptStateId} --ε--> ${newAcceptId}`,
              `${rightSub.acceptStateId} --ε--> ${newAcceptId}`,
            ],
            humanReadable: `Added new start ${newStartId} branching to both alternatives, and merged both final branches into new accept state ${newAcceptId}.`,
          }
        );

        return sub;
      }

      case 'star': {
        const childSub = buildSub(node.child);

        const newStartId = idGen.next();
        const newAcceptId = idGen.next();

        const newStart: State = { id: newStartId, isStart: true, isAccept: false };
        const newAccept: State = { id: newAcceptId, isStart: false, isAccept: true };

        const tStartToChild: Transition = {
          id: `t_${newStartId}_${childSub.startStateId}`,
          from: newStartId,
          to: childSub.startStateId,
          symbol: 'ε',
        };
        const tStartToAccept: Transition = {
          id: `t_${newStartId}_${newAcceptId}`,
          from: newStartId,
          to: newAcceptId,
          symbol: 'ε',
        };
        const tChildToChild: Transition = {
          id: `t_${childSub.acceptStateId}_${childSub.startStateId}`,
          from: childSub.acceptStateId,
          to: childSub.startStateId,
          symbol: 'ε',
        };
        const tChildToAccept: Transition = {
          id: `t_${childSub.acceptStateId}_${newAcceptId}`,
          from: childSub.acceptStateId,
          to: newAcceptId,
          symbol: 'ε',
        };

        const combinedStates: State[] = [
          newStart,
          ...childSub.states.map((s) => ({ ...s, isStart: false, isAccept: false })),
          newAccept,
        ];

        const combinedTransitions = [
          ...childSub.transitions,
          tStartToChild,
          tStartToAccept,
          tChildToChild,
          tChildToAccept,
        ];

        const sub: SubAutomaton = {
          states: combinedStates,
          transitions: combinedTransitions,
          startStateId: newStartId,
          acceptStateId: newAcceptId,
          alphabet: childSub.alphabet,
        };

        createStep(
          `Kleene Star Construction (*)`,
          `Adds states ${newStartId} and ${newAcceptId} with loopback and bypass ε-transitions to allow 0 or more repetitions.`,
          'star',
          `Kleene Star (*)`,
          sub,
          node.id,
          childSub,
          [
            { type: 'state-added', description: `Created new start state ${newStartId}`, stateId: newStartId },
            { type: 'state-added', description: `Created new accept state ${newAcceptId}`, stateId: newAcceptId },
            { type: 'transition-added', description: `${newStartId} --ε--> ${childSub.startStateId}`, transition: tStartToChild },
            { type: 'transition-added', description: `${newStartId} --ε--> ${newAcceptId} (0 repetitions)`, transition: tStartToAccept },
            { type: 'transition-added', description: `${childSub.acceptStateId} --ε--> ${childSub.startStateId} (loopback)`, transition: tChildToChild },
            { type: 'transition-added', description: `${childSub.acceptStateId} --ε--> ${newAcceptId}`, transition: tChildToAccept },
          ],
          {
            operation: `Kleene Star Construction (A*)`,
            why: `Kleene Star allows zero or more repetitions. A direct bypass ε-transition (${newStartId} → ${newAcceptId}) allows zero occurrences. A loopback ε-transition (${childSub.acceptStateId} → ${childSub.startStateId}) enables unlimited repetitions.`,
            createdStates: [newStartId, newAcceptId],
            newTransitions: [
              `${newStartId} --ε--> ${childSub.startStateId}`,
              `${newStartId} --ε--> ${newAcceptId} (skip)`,
              `${childSub.acceptStateId} --ε--> ${childSub.startStateId} (loop)`,
              `${childSub.acceptStateId} --ε--> ${newAcceptId}`,
            ],
            humanReadable: `Created start state ${newStartId} with a bypass for zero repetitions and a loopback from state ${childSub.acceptStateId} to state ${childSub.startStateId}.`,
          }
        );

        return sub;
      }

      case 'plus': {
        const childSub = buildSub(node.child);

        const newStartId = idGen.next();
        const newAcceptId = idGen.next();

        const newStart: State = { id: newStartId, isStart: true, isAccept: false };
        const newAccept: State = { id: newAcceptId, isStart: false, isAccept: true };

        const tStartToChild: Transition = {
          id: `t_${newStartId}_${childSub.startStateId}`,
          from: newStartId,
          to: childSub.startStateId,
          symbol: 'ε',
        };
        const tChildToChild: Transition = {
          id: `t_${childSub.acceptStateId}_${childSub.startStateId}`,
          from: childSub.acceptStateId,
          to: childSub.startStateId,
          symbol: 'ε',
        };
        const tChildToAccept: Transition = {
          id: `t_${childSub.acceptStateId}_${newAcceptId}`,
          from: childSub.acceptStateId,
          to: newAcceptId,
          symbol: 'ε',
        };

        const combinedStates: State[] = [
          newStart,
          ...childSub.states.map((s) => ({ ...s, isStart: false, isAccept: false })),
          newAccept,
        ];

        const combinedTransitions = [
          ...childSub.transitions,
          tStartToChild,
          tChildToChild,
          tChildToAccept,
        ];

        const sub: SubAutomaton = {
          states: combinedStates,
          transitions: combinedTransitions,
          startStateId: newStartId,
          acceptStateId: newAcceptId,
          alphabet: childSub.alphabet,
        };

        createStep(
          `Positive Closure Construction (+)`,
          `Constructs automaton for one or more repetitions (A+). Requires at least 1 iteration before looping.`,
          'plus',
          `Positive Closure (+)`,
          sub,
          node.id,
          childSub,
          [
            { type: 'state-added', description: `Created new start state ${newStartId}`, stateId: newStartId },
            { type: 'state-added', description: `Created new accept state ${newAcceptId}`, stateId: newAcceptId },
            { type: 'transition-added', description: `${newStartId} --ε--> ${childSub.startStateId}`, transition: tStartToChild },
            { type: 'transition-added', description: `${childSub.acceptStateId} --ε--> ${childSub.startStateId} (loopback)`, transition: tChildToChild },
            { type: 'transition-added', description: `${childSub.acceptStateId} --ε--> ${newAcceptId}`, transition: tChildToAccept },
          ],
          {
            operation: `Positive Closure Construction (A+)`,
            why: `Unlike Kleene Star, Positive Closure requires at least one occurrence. Therefore, there is NO bypass from start to accept state.`,
            createdStates: [newStartId, newAcceptId],
            newTransitions: [
              `${newStartId} --ε--> ${childSub.startStateId}`,
              `${childSub.acceptStateId} --ε--> ${childSub.startStateId} (loop)`,
              `${childSub.acceptStateId} --ε--> ${newAcceptId}`,
            ],
            humanReadable: `Created start state ${newStartId} forcing at least one pass through the child expression before allowing exit to ${newAcceptId}.`,
          }
        );

        return sub;
      }

      case 'optional': {
        const childSub = buildSub(node.child);

        const newStartId = idGen.next();
        const newAcceptId = idGen.next();

        const newStart: State = { id: newStartId, isStart: true, isAccept: false };
        const newAccept: State = { id: newAcceptId, isStart: false, isAccept: true };

        const tStartToChild: Transition = {
          id: `t_${newStartId}_${childSub.startStateId}`,
          from: newStartId,
          to: childSub.startStateId,
          symbol: 'ε',
        };
        const tStartToAccept: Transition = {
          id: `t_${newStartId}_${newAcceptId}`,
          from: newStartId,
          to: newAcceptId,
          symbol: 'ε',
        };
        const tChildToAccept: Transition = {
          id: `t_${childSub.acceptStateId}_${newAcceptId}`,
          from: childSub.acceptStateId,
          to: newAcceptId,
          symbol: 'ε',
        };

        const combinedStates: State[] = [
          newStart,
          ...childSub.states.map((s) => ({ ...s, isStart: false, isAccept: false })),
          newAccept,
        ];

        const combinedTransitions = [
          ...childSub.transitions,
          tStartToChild,
          tStartToAccept,
          tChildToAccept,
        ];

        const sub: SubAutomaton = {
          states: combinedStates,
          transitions: combinedTransitions,
          startStateId: newStartId,
          acceptStateId: newAcceptId,
          alphabet: childSub.alphabet,
        };

        createStep(
          `Optional Construction (?)`,
          `Constructs automaton for zero or one occurrence (A?). Adds a bypass ε-transition without loopback.`,
          'optional',
          `Optional (?)`,
          sub,
          node.id,
          childSub,
          [
            { type: 'state-added', description: `Created new start state ${newStartId}`, stateId: newStartId },
            { type: 'state-added', description: `Created new accept state ${newAcceptId}`, stateId: newAcceptId },
            { type: 'transition-added', description: `${newStartId} --ε--> ${childSub.startStateId}`, transition: tStartToChild },
            { type: 'transition-added', description: `${newStartId} --ε--> ${newAcceptId} (skip)`, transition: tStartToAccept },
            { type: 'transition-added', description: `${childSub.acceptStateId} --ε--> ${newAcceptId}`, transition: tChildToAccept },
          ],
          {
            operation: `Optional Operator Construction (A?)`,
            why: `Optional operator allows zero or one match. Includes a bypass from start to accept state, but no loopback.`,
            createdStates: [newStartId, newAcceptId],
            newTransitions: [
              `${newStartId} --ε--> ${childSub.startStateId}`,
              `${newStartId} --ε--> ${newAcceptId} (skip)`,
              `${childSub.acceptStateId} --ε--> ${newAcceptId}`,
            ],
            humanReadable: `Created start state ${newStartId} allowing the expression to be executed once or bypassed entirely.`,
          }
        );

        return sub;
      }
    }
  }

  const finalSub = buildSub(ast);

  const finalAutomaton: Automaton = {
    states: layoutAutomaton(
      finalSub.states.map((s) => ({
        ...s,
        isStart: s.id === finalSub.startStateId,
        isAccept: s.id === finalSub.acceptStateId,
      })),
      finalSub.transitions
    ),
    transitions: finalSub.transitions,
    alphabet: finalSub.alphabet,
    startState: finalSub.startStateId,
    acceptStates: new Set([finalSub.acceptStateId]),
    type: 'ε-NFA',
  };

  createStep(
    `ε-NFA Construction Complete`,
    `Thompson's construction is complete. Full nondeterministic finite automaton with ε-transitions generated.`,
    'nfa_complete',
    `Complete ε-NFA`,
    finalSub,
    ast.id,
    undefined,
    [],
    {
      operation: `Final ε-NFA Assembly`,
      why: `All sub-expressions have been recursively combined according to Thompson construction rules.`,
      createdStates: finalSub.states.map((s) => s.id),
      newTransitions: [],
      humanReadable: `Generated complete ε-NFA with ${finalSub.states.length} states and ${finalSub.transitions.length} transitions.`,
    }
  );

  return { finalAutomaton, steps };
}
