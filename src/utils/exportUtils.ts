import type { Automaton } from '../types/automaton';
import type { TransformationStep } from '../types/transformation';

export function generateAutomatonText(automaton: Automaton): string {
  const lines: string[] = [];
  lines.push(`Automaton Type: ${automaton.type || 'Finite Automaton'}`);
  lines.push(`States: ${automaton.states.map((s) => s.id).join(', ')}`);
  lines.push(`Alphabet: {${Array.from(automaton.alphabet).join(', ')}}`);
  lines.push(`Start State: ${automaton.startState}`);
  lines.push(`Accept States: {${Array.from(automaton.acceptStates).join(', ')}}`);
  lines.push('\nTransitions:');
  for (const t of automaton.transitions) {
    lines.push(`  ${t.from} --${t.symbol}--> ${t.to}`);
  }
  return lines.join('\n');
}

export function generateFullReport(
  regex: string,
  steps: TransformationStep[],
  finalAutomaton: Automaton
): string {
  const lines: string[] = [];
  lines.push('======================================================================');
  lines.push(' FAFL SIMULATIONS — REGULAR EXPRESSION TO FA CONVERSION REPORT');
  lines.push('======================================================================');
  lines.push(`Date: ${new Date().toLocaleString()}`);
  lines.push(`Input Expression: ${regex}`);
  lines.push(`Validation: VALID`);
  lines.push('----------------------------------------------------------------------\n');

  lines.push('TRANSFORMATION STEPS TIMELINE:\n');

  for (const step of steps) {
    lines.push(`Step ${step.step}: ${step.title}`);
    lines.push(`Subtitle: ${step.subtitle}`);
    lines.push(`Operation: ${step.explanation.operation}`);
    lines.push(`Why: ${step.explanation.why}`);
    if (step.explanation.newTransitions.length > 0) {
      lines.push('New Transitions:');
      step.explanation.newTransitions.forEach((t) => lines.push(`  + ${t}`));
    }
    lines.push('');
  }

  lines.push('----------------------------------------------------------------------');
  lines.push('FINAL GENERATED AUTOMATON DETAILS:');
  lines.push('----------------------------------------------------------------------');
  lines.push(generateAutomatonText(finalAutomaton));
  lines.push('\n======================================================================');
  lines.push(' END OF REPORT');
  lines.push('======================================================================');

  return lines.join('\n');
}

export function downloadTextFile(filename: string, content: string) {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
