import React, { useState, useRef } from 'react';
import type { Automaton, State, Transition } from '../types/automaton';
import { ZoomIn, ZoomOut, RotateCcw, Info, X } from 'lucide-react';

interface AutomatonGraphProps {
  automaton?: Automaton;
  activeStateIds?: string[];
  activeTransitionIds?: string[];
  highlightNewStateIds?: string[];
  highlightNewTransitionIds?: string[];
  title?: string;
}

export const AutomatonGraph: React.FC<AutomatonGraphProps> = ({
  automaton,
  activeStateIds = [],
  activeTransitionIds = [],
  highlightNewStateIds = [],
  highlightNewTransitionIds = [],
  title = 'Automaton Graph Visualization',
}) => {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedTransition, setSelectedTransition] = useState<Transition | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  if (!automaton || automaton.states.length === 0) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-2xl border border-slate-800 bg-[#0F172A] text-slate-500">
        <p className="text-sm font-medium">No automaton states to display.</p>
      </div>
    );
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof SVGElement && e.target.tagName === 'svg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.5));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const stateMap = new Map<string, State>(automaton.states.map((s) => [s.id, s]));

  const renderTransitions = () => {
    return automaton.transitions.map((t) => {
      const source = stateMap.get(t.from);
      const target = stateMap.get(t.to);

      if (!source || !target) return null;

      const sx = source.x ?? 100;
      const sy = source.y ?? 100;
      const tx = target.x ?? 200;
      const ty = target.y ?? 100;

      const isActive = activeTransitionIds.includes(t.id);
      const isNew = highlightNewTransitionIds.includes(t.id);
      const isSelected = selectedTransition?.id === t.id;

      if (t.from === t.to) {
        const r = 24;
        const pathData = `M ${sx - 10} ${sy - r} C ${sx - 35} ${sy - 70}, ${sx + 35} ${sy - 70}, ${sx + 10} ${sy - r}`;
        const labelX = sx;
        const labelY = sy - 65;

        return (
          <g key={t.id} onClick={() => { setSelectedTransition(t); setSelectedState(null); }}>
            <path
              d={pathData}
              fill="none"
              stroke={isActive ? '#10B981' : isNew ? '#F59E0B' : isSelected ? '#F8FAFC' : '#475569'}
              strokeWidth={isActive || isNew || isSelected ? '3' : '2'}
              markerEnd="url(#arrowhead)"
              className="cursor-pointer transition-colors"
            />
            <rect
              x={labelX - 16}
              y={labelY - 10}
              width="32"
              height="18"
              rx="4"
              fill="#080E1A"
              stroke={t.symbol === 'ε' ? '#F59E0B' : '#06B6D4'}
              strokeWidth="1"
            />
            <text
              x={labelX}
              y={labelY + 3}
              textAnchor="middle"
              fill={t.symbol === 'ε' ? '#F59E0B' : '#2DD4BF'}
              fontSize="11"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {t.symbol}
            </text>
          </g>
        );
      }

      const hasReverse = automaton.transitions.some(
        (other) => other.from === t.to && other.to === t.from
      );

      const dx = tx - sx;
      const dy = ty - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist === 0) return null;

      const r = 24;
      const uX = dx / dist;
      const uY = dy / dist;

      const startX = sx + uX * r;
      const startY = sy + uY * r;
      const endX = tx - uX * (r + 6);
      const endY = ty - uY * (r + 6);

      let pathData = '';
      let labelX = (sx + tx) / 2;
      let labelY = (sy + ty) / 2;

      if (hasReverse) {
        const perpX = -uY * 30;
        const perpY = uX * 30;
        const ctrlX = (sx + tx) / 2 + perpX;
        const ctrlY = (sy + ty) / 2 + perpY;
        pathData = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
        labelX = ctrlX;
        labelY = ctrlY;
      } else {
        const perpX = -uY * 12;
        const perpY = uX * 12;
        const ctrlX = (sx + tx) / 2 + perpX;
        const ctrlY = (sy + ty) / 2 + perpY;
        pathData = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;
        labelX = ctrlX;
        labelY = ctrlY;
      }

      return (
        <g key={t.id} onClick={() => { setSelectedTransition(t); setSelectedState(null); }}>
          <path
            d={pathData}
            fill="none"
            stroke={isActive ? '#10B981' : isNew ? '#F59E0B' : isSelected ? '#F8FAFC' : '#475569'}
            strokeWidth={isActive || isNew || isSelected ? '3' : '2'}
            markerEnd="url(#arrowhead)"
            className="cursor-pointer transition-colors"
          />
          <rect
            x={labelX - 14}
            y={labelY - 10}
            width="28"
            height="18"
            rx="4"
            fill="#080E1A"
            stroke={t.symbol === 'ε' ? '#F59E0B' : '#06B6D4'}
            strokeWidth="1"
          />
          <text
            x={labelX}
            y={labelY + 3}
            textAnchor="middle"
            fill={t.symbol === 'ε' ? '#F59E0B' : '#2DD4BF'}
            fontSize="11"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {t.symbol}
          </text>
        </g>
      );
    });
  };

  const renderStates = () => {
    return automaton.states.map((s) => {
      const x = s.x ?? 100;
      const y = s.y ?? 100;

      const isActive = activeStateIds.includes(s.id);
      const isNew = highlightNewStateIds.includes(s.id);
      const isSelected = selectedState?.id === s.id;

      return (
        <g
          key={s.id}
          transform={`translate(${x}, ${y})`}
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={() => { setSelectedState(s); setSelectedTransition(null); }}
        >
          {s.isStart && (
            <g transform="translate(-48, 0)">
              <line x1="0" y1="0" x2="22" y2="0" stroke="#6366F1" strokeWidth="3" markerEnd="url(#arrowhead-start)" />
              <text x="-10" y="-8" fill="#818CF8" fontSize="10" fontWeight="bold">START</text>
            </g>
          )}

          {(isActive || isNew) && (
            <circle
              r="30"
              fill="none"
              stroke={isActive ? '#10B981' : '#F59E0B'}
              strokeWidth="3"
              className="animate-pulse"
            />
          )}

          <circle
            r="24"
            fill="#1E293B"
            stroke={isActive ? '#10B981' : isNew ? '#F59E0B' : isSelected ? '#F8FAFC' : s.isStart ? '#6366F1' : '#475569'}
            strokeWidth={isSelected ? '3' : '2'}
          />

          {s.isAccept && (
            <circle
              r="19"
              fill="none"
              stroke={isActive ? '#10B981' : isNew ? '#F59E0B' : '#6366F1'}
              strokeWidth="2"
            />
          )}

          <text
            textAnchor="middle"
            dy="4"
            fill="#F8FAFC"
            fontSize="12"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {s.id}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-[#0F172A] shadow-xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-[#080E1A]/70">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {title}
          </span>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
            {automaton.states.length} states, {automaton.transitions.length} transitions
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleReset}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Reset View"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="h-96 w-full cursor-grab active:cursor-grabbing bg-[#080E1A]/90 overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 400"
          className="select-none"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748B" />
            </marker>
            <marker
              id="arrowhead-start"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366F1" />
            </marker>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
            {renderTransitions()}
            {renderStates()}
          </g>
        </svg>

        {selectedState && (
          <div className="absolute left-4 bottom-4 w-72 rounded-xl border border-indigo-500/40 bg-[#0F172A]/95 p-4 backdrop-blur-md shadow-2xl z-20 text-xs">
            <div className="flex items-center justify-between font-bold text-indigo-300 border-b border-slate-800 pb-2 mb-2">
              <span className="flex items-center gap-1.5">
                <Info className="h-4 w-4" /> State Inspector: <code className="text-white bg-slate-800 px-1.5 rounded">{selectedState.id}</code>
              </span>
              <button onClick={() => setSelectedState(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1.5 text-slate-300 font-mono">
              <div>Type: <span className="text-white font-bold">{selectedState.isStart && selectedState.isAccept ? 'Start & Accept State' : selectedState.isStart ? 'Start State' : selectedState.isAccept ? 'Accept State' : 'Intermediate State'}</span></div>
              <div>Incoming Transitions:</div>
              <ul className="list-disc list-inside text-slate-400 pl-2">
                {automaton.transitions.filter((t) => t.to === selectedState.id).map((t) => (
                  <li key={t.id}>{t.from} --{t.symbol}--&gt; {t.to}</li>
                ))}
                {automaton.transitions.filter((t) => t.to === selectedState.id).length === 0 && (
                  <li className="italic text-slate-500">None</li>
                )}
              </ul>
              <div>Outgoing Transitions:</div>
              <ul className="list-disc list-inside text-slate-400 pl-2">
                {automaton.transitions.filter((t) => t.from === selectedState.id).map((t) => (
                  <li key={t.id}>{t.from} --{t.symbol}--&gt; {t.to}</li>
                ))}
                {automaton.transitions.filter((t) => t.from === selectedState.id).length === 0 && (
                  <li className="italic text-slate-500">None</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {selectedTransition && (
          <div className="absolute left-4 bottom-4 w-72 rounded-xl border border-cyan-500/40 bg-[#0F172A]/95 p-4 backdrop-blur-md shadow-2xl z-20 text-xs">
            <div className="flex items-center justify-between font-bold text-cyan-300 border-b border-slate-800 pb-2 mb-2">
              <span className="flex items-center gap-1.5">
                <Info className="h-4 w-4" /> Transition Inspector
              </span>
              <button onClick={() => setSelectedTransition(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1.5 text-slate-300 font-mono">
              <div>From State: <span className="text-white font-bold">{selectedTransition.from}</span></div>
              <div>To State: <span className="text-white font-bold">{selectedTransition.to}</span></div>
              <div>Symbol: <span className="text-amber-400 font-bold">{selectedTransition.symbol}</span></div>
              <div>Type: <span className="text-slate-400">{selectedTransition.symbol === 'ε' ? 'Epsilon Transition (No symbol consumed)' : 'Input Symbol Transition'}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
