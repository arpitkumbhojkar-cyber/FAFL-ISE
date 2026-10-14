export interface ExampleRegex {
  id: string;
  name: string;
  expression: string;
  category: 'Basic' | 'Operators' | 'Complex';
  explanation: string;
  testCases: { input: string; expected: boolean }[];
}

export const EXAMPLES: ExampleRegex[] = [
  {
    id: 'ex-1',
    name: 'Basic Symbol',
    expression: 'a',
    category: 'Basic',
    explanation: 'Accepts the single symbol "a". The simplest non-empty language automaton.',
    testCases: [
      { input: 'a', expected: true },
      { input: 'b', expected: false },
      { input: '', expected: false },
    ],
  },
  {
    id: 'ex-2',
    name: 'Concatenation',
    expression: 'ab',
    category: 'Basic',
    explanation: 'Accepts the string "ab". First matching symbol "a", followed immediately by symbol "b".',
    testCases: [
      { input: 'ab', expected: true },
      { input: 'a', expected: false },
      { input: 'b', expected: false },
      { input: 'aba', expected: false },
    ],
  },
  {
    id: 'ex-3',
    name: 'Union (OR)',
    expression: 'a|b',
    category: 'Basic',
    explanation: 'Accepts either "a" or "b". Constructs parallel paths branching from a single start state.',
    testCases: [
      { input: 'a', expected: true },
      { input: 'b', expected: true },
      { input: 'ab', expected: false },
      { input: '', expected: false },
    ],
  },
  {
    id: 'ex-4',
    name: 'Kleene Star',
    expression: 'a*',
    category: 'Operators',
    explanation: 'Accepts zero or more occurrences of "a". Uses ε-transitions to enable zero repetitions and loopbacks.',
    testCases: [
      { input: '', expected: true },
      { input: 'a', expected: true },
      { input: 'aaa', expected: true },
      { input: 'b', expected: false },
    ],
  },
  {
    id: 'ex-5',
    name: 'Parenthesized Union',
    expression: '(a|b)c',
    category: 'Operators',
    explanation: 'Accepts either "ac" or "bc". Grouping forces union evaluation before concatenation with "c".',
    testCases: [
      { input: 'ac', expected: true },
      { input: 'bc', expected: true },
      { input: 'c', expected: false },
      { input: 'abc', expected: false },
    ],
  },
  {
    id: 'ex-6',
    name: 'Complex Expression',
    expression: '(a|b)*abb',
    category: 'Complex',
    explanation: 'Accepts any binary string over {a,b} that ends with "abb". Benchmark problem in theory of computation.',
    testCases: [
      { input: 'abb', expected: true },
      { input: 'aabb', expected: true },
      { input: 'babb', expected: true },
      { input: 'abababb', expected: true },
      { input: 'ab', expected: false },
      { input: 'abc', expected: false },
    ],
  },
  {
    id: 'ex-7',
    name: 'Positive Closure',
    expression: 'a+b',
    category: 'Operators',
    explanation: 'Accepts one or more "a" characters followed by "b". Requires at least one "a".',
    testCases: [
      { input: 'ab', expected: true },
      { input: 'aab', expected: true },
      { input: 'b', expected: false },
      { input: '', expected: false },
    ],
  },
  {
    id: 'ex-8',
    name: 'Optional Operator',
    expression: 'ab?',
    category: 'Operators',
    explanation: 'Accepts "a" followed by zero or one "b". Equivalent to "a(b|ε)".',
    testCases: [
      { input: 'a', expected: true },
      { input: 'ab', expected: true },
      { input: 'abb', expected: false },
      { input: 'b', expected: false },
    ],
  },
  {
    id: 'ex-9',
    name: 'Epsilon (Empty String)',
    expression: 'a|ε',
    category: 'Basic',
    explanation: 'Accepts either "a" or the empty string ε.',
    testCases: [
      { input: '', expected: true },
      { input: 'a', expected: true },
      { input: 'aa', expected: false },
    ],
  },
  {
    id: 'ex-10',
    name: 'Nested Union & Star',
    expression: '(a|b)*(aa|bb)',
    category: 'Complex',
    explanation: 'Demonstrates nested union, concatenation and Kleene star. Matches strings ending in "aa" or "bb".',
    testCases: [
      { input: 'aa', expected: true },
      { input: 'bb', expected: true },
      { input: 'abaa', expected: true },
      { input: 'babb', expected: true },
      { input: 'ab', expected: false },
    ],
  },
];
