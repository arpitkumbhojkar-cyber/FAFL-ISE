import { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RegexEditor } from './components/RegexEditor';
import { RegexSummary } from './components/RegexSummary';
import { TokenDisplay } from './components/TokenDisplay';
import { ExpressionTree } from './components/ExpressionTree';
import { TransformationTimeline } from './components/TransformationTimeline';
import { ExplanationCard } from './components/ExplanationCard';
import { AutomatonGraph } from './components/AutomatonGraph';
import { StepControls } from './components/StepControls';
import { StringTester } from './components/StringTester';
import { FinalAutomaton } from './components/FinalAutomaton';
import { TheoryPanel } from './components/TheoryPanel';
import { ExampleSelector } from './components/ExampleSelector';
import { StatsBar, countAstNodes } from './components/StatsBar';
import { Toast } from './components/Toast';

import { convertRegexToFA } from './algorithms/convertRegexToFA';
import type { ConversionOutput } from './algorithms/convertRegexToFA';
import { validateRegex } from './algorithms/regexValidator';
import type { ValidationResult } from './algorithms/regexValidator';
import type { ExampleRegex } from './data/examples';

export function App() {
  const [regexInput, setRegexInput] = useState<string>('(a|b)*abb');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [conversionData, setConversionData] = useState<ConversionOutput | null>(null);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'ε-NFA' | 'DFA' | 'Minimal DFA'>('ε-NFA');

  const [isTheoryOpen, setIsTheoryOpen] = useState<boolean>(false);
  const [isExamplesOpen, setIsExamplesOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [simActiveStates, setSimActiveStates] = useState<string[]>([]);
  const [simActiveTransitions, setSimActiveTransitions] = useState<string[]>([]);

  const simulatorSectionRef = useRef<HTMLDivElement>(null);

  const runConversion = useCallback((input: string) => {
    const valRes = validateRegex(input);
    setValidationResult(valRes);

    if (valRes.isValid) {
      const output = convertRegexToFA(input);
      setConversionData(output);
      setCurrentStepIndex(0);
      setIsPlaying(false);
      setSelectedView('ε-NFA');
      setSimActiveStates([]);
      setSimActiveTransitions([]);
    } else {
      setConversionData(null);
    }
  }, []);

  useEffect(() => {
    runConversion('(a|b)*abb');
  }, [runConversion]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying && conversionData && conversionData.steps.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < conversionData.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 1800);
    }
    return () => clearInterval(timer);
  }, [isPlaying, conversionData]);

  const handleValidateOnly = () => {
    const valRes = validateRegex(regexInput);
    setValidationResult(valRes);
    if (valRes.isValid) {
      setToastMessage('✓ Regular Expression is syntactically valid!');
    } else {
      setToastMessage('⚠ Syntax errors detected in expression.');
    }
  };

  const handleConvertClick = () => {
    runConversion(regexInput);
    if (simulatorSectionRef.current) {
      simulatorSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClear = () => {
    setRegexInput('');
    setValidationResult(null);
    setConversionData(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleSelectExample = (ex: ExampleRegex) => {
    setRegexInput(ex.expression);
    runConversion(ex.expression);
    setToastMessage(`Loaded preset example: '${ex.name}'`);
    if (simulatorSectionRef.current) {
      simulatorSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentStep = conversionData?.steps[currentStepIndex];
  const totalStepsCount = conversionData?.steps.length || 0;
  const isFinalStep = currentStepIndex === totalStepsCount - 1 && totalStepsCount > 0;

  return (
    <div className="min-h-screen bg-[#080E1A] text-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-500/30">
      <Navbar
        onOpenTheory={() => setIsTheoryOpen(true)}
        onOpenExamples={() => setIsExamplesOpen(true)}
        onOpenHelp={() => setIsTheoryOpen(true)}
      />

      <Hero
        onStartSimulation={() => {
          if (simulatorSectionRef.current) {
            simulatorSectionRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onTryExample={() => setIsExamplesOpen(true)}
      />

      <main ref={simulatorSectionRef} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        <StatsBar
          alphabetSize={validationResult?.alphabet.size || 0}
          tokensCount={conversionData?.tokens.length || 0}
          astNodesCount={countAstNodes(conversionData?.ast)}
          automaton={currentStep?.automaton}
          stepsCount={totalStepsCount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <RegexEditor
              value={regexInput}
              onChange={setRegexInput}
              onValidate={handleValidateOnly}
              onConvert={handleConvertClick}
              onClear={handleClear}
              onOpenExamples={() => setIsExamplesOpen(true)}
            />

            <RegexSummary
              expression={regexInput}
              validationResult={validationResult}
            />

            {conversionData && (
              <>
                <TokenDisplay tokens={conversionData.tokens} />
                <ExpressionTree
                  ast={conversionData.ast}
                  activeNodeId={currentStep?.activeAstNodeId}
                />
                <TransformationTimeline
                  steps={conversionData.steps}
                  currentStepIndex={currentStepIndex}
                  onSelectStep={(idx) => {
                    setCurrentStepIndex(idx);
                    setIsPlaying(false);
                  }}
                />
              </>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6">
            {!conversionData ? (
              <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-12 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-bold text-white m-0">Enter a regular expression to begin</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Type a regular expression above or pick a preset example to trigger Thompson's Construction algorithm.
                </p>
                <button
                  onClick={() => setIsExamplesOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-all"
                >
                  Load Example Expression
                </button>
              </div>
            ) : (
              <>
                {currentStep && (
                  <ExplanationCard step={currentStep} />
                )}

                {currentStep && (
                  <AutomatonGraph
                    automaton={currentStep.automaton}
                    activeStateIds={simActiveStates}
                    activeTransitionIds={simActiveTransitions}
                    highlightNewStateIds={currentStep.changes
                      .filter((c) => c.type === 'state-added')
                      .map((c) => c.stateId!)
                      .filter(Boolean)}
                    highlightNewTransitionIds={currentStep.changes
                      .filter((c) => c.type === 'transition-added')
                      .map((c) => c.transition?.id!)
                      .filter(Boolean)}
                    title={`Step ${currentStep.step}: ${currentStep.title}`}
                  />
                )}

                <StepControls
                  currentStepIndex={currentStepIndex}
                  totalSteps={totalStepsCount}
                  isPlaying={isPlaying}
                  onPrevious={() => {
                    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
                    setIsPlaying(false);
                  }}
                  onNext={() => {
                    setCurrentStepIndex((prev) => Math.min(prev + 1, totalStepsCount - 1));
                    setIsPlaying(false);
                  }}
                  onPlayPause={() => setIsPlaying((prev) => !prev)}
                  onReset={() => {
                    setCurrentStepIndex(0);
                    setIsPlaying(false);
                  }}
                />

                <StringTester
                  automaton={conversionData.finalNFA}
                  onUpdateActiveStates={(states, trans) => {
                    setSimActiveStates(states);
                    setSimActiveTransitions(trans);
                  }}
                />

                {isFinalStep && conversionData.finalNFA && (
                  <FinalAutomaton
                    expression={regexInput}
                    nfa={conversionData.finalNFA}
                    dfa={conversionData.dfaCoverage?.dfa}
                    minimalDfa={conversionData.minimalDFA}
                    steps={conversionData.steps}
                    selectedView={selectedView}
                    onSelectView={setSelectedView}
                    onCopyToast={(msg) => setToastMessage(msg)}
                    onReset={() => {
                      setCurrentStepIndex(0);
                      setIsPlaying(false);
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <TheoryPanel isOpen={isTheoryOpen} onClose={() => setIsTheoryOpen(false)} />
      <ExampleSelector
        isOpen={isExamplesOpen}
        onClose={() => setIsExamplesOpen(false)}
        onSelectExample={handleSelectExample}
      />
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      <footer className="mt-12 border-t border-slate-800 bg-[#080E1A] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FAFL simulations — Regular Expression → FA Interactive Simulator</span>
          <span>Formal Automata & Formal Languages Academic Simulator</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
