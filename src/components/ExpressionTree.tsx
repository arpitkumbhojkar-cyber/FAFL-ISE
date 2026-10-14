import React, { useState } from 'react';
import type { RegexNode } from '../types/regex';

interface ExpressionTreeProps {
  ast?: RegexNode;
  activeNodeId?: string;
}

interface TreeNodePos {
  node: RegexNode;
  x: number;
  y: number;
  children: TreeNodePos[];
}

export const ExpressionTree: React.FC<ExpressionTreeProps> = ({ ast, activeNodeId }) => {
  const [selectedNode, setSelectedNode] = useState<RegexNode | null>(null);

  if (!ast) return null;

  const calculateTreeLayout = (
    node: RegexNode,
    x: number,
    y: number,
    level: number,
    spread: number
  ): TreeNodePos => {
    const children: TreeNodePos[] = [];
    const childY = y + 70;
    const nextSpread = spread / 2;

    if (node.type === 'concat' || node.type === 'union') {
      children.push(calculateTreeLayout(node.left, x - spread, childY, level + 1, nextSpread));
      children.push(calculateTreeLayout(node.right, x + spread, childY, level + 1, nextSpread));
    } else if (node.type === 'star' || node.type === 'plus' || node.type === 'optional') {
      children.push(calculateTreeLayout(node.child, x, childY, level + 1, nextSpread));
    }

    return { node, x, y, children };
  };

  const treeRoot = calculateTreeLayout(ast, 250, 45, 0, 100);

  const renderTreeSvg = (treeNode: TreeNodePos): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];

    for (const child of treeNode.children) {
      elements.push(
        <line
          key={`line-${treeNode.node.id}-${child.node.id}`}
          x1={treeNode.x}
          y1={treeNode.y}
          x2={child.x}
          y2={child.y}
          stroke="#334155"
          strokeWidth="2"
        />
      );
      elements.push(...renderTreeSvg(child));
    }

    const isActive = activeNodeId === treeNode.node.id;
    const isSelected = selectedNode?.id === treeNode.node.id;

    let nodeLabel = '';
    let bgColor = '#1E293B';
    let borderColor = '#6366F1';
    let textColor = '#F8FAFC';

    switch (treeNode.node.type) {
      case 'symbol':
        nodeLabel = treeNode.node.value;
        bgColor = '#064E3B';
        borderColor = '#10B981';
        break;
      case 'epsilon':
        nodeLabel = 'ε';
        bgColor = '#78350F';
        borderColor = '#F59E0B';
        break;
      case 'concat':
        nodeLabel = '· (concat)';
        bgColor = '#0E7490';
        borderColor = '#06B6D4';
        break;
      case 'union':
        nodeLabel = '| (union)';
        bgColor = '#4338CA';
        borderColor = '#6366F1';
        break;
      case 'star':
        nodeLabel = '* (star)';
        bgColor = '#6B21A8';
        borderColor = '#C084FC';
        break;
      case 'plus':
        nodeLabel = '+ (plus)';
        bgColor = '#9F1239';
        borderColor = '#FB7185';
        break;
      case 'optional':
        nodeLabel = '? (opt)';
        bgColor = '#115E59';
        borderColor = '#2DD4BF';
        break;
    }

    if (isActive) {
      borderColor = '#F59E0B';
    }

    elements.push(
      <g
        key={`node-${treeNode.node.id}`}
        transform={`translate(${treeNode.x}, ${treeNode.y})`}
        className="cursor-pointer transition-transform hover:scale-110"
        onClick={() => setSelectedNode(treeNode.node)}
      >
        {isActive && (
          <circle
            r="24"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3"
            className="animate-pulse"
          />
        )}

        <circle
          r="18"
          fill={bgColor}
          stroke={isSelected ? '#F8FAFC' : borderColor}
          strokeWidth={isSelected ? '3' : '2'}
        />

        <text
          textAnchor="middle"
          dy="5"
          fill={textColor}
          fontSize="12"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {nodeLabel}
        </text>
      </g>
    );

    return elements;
  };

  const getNodeInfo = (node: RegexNode) => {
    switch (node.type) {
      case 'symbol':
        return {
          title: `Symbol Node ('${node.value}')`,
          meaning: `Atomic alphabet literal '${node.value}'.`,
          rule: `Thompson Rule: Create start state q0 and accept state q1 with transition q0 --${node.value}--> q1.`,
        };
      case 'epsilon':
        return {
          title: `Epsilon Node ('ε')`,
          meaning: `Empty string symbol (ε).`,
          rule: `Thompson Rule: Create start state q0 and accept state q1 with ε-transition.`,
        };
      case 'concat':
        return {
          title: `Concatenation Node (·)`,
          meaning: `Executes left expression followed immediately by right expression.`,
          rule: `Thompson Rule: Connect final accept state of left sub-automaton to start state of right sub-automaton via ε-transition.`,
        };
      case 'union':
        return {
          title: `Union Node (|)`,
          meaning: `Non-deterministic choice between left or right expression.`,
          rule: `Thompson Rule: Create new start and accept states; connect start state to both branches and both branch accept states to new accept state via ε.`,
        };
      case 'star':
        return {
          title: `Kleene Star Node (*)`,
          meaning: `Zero or more repetitions of child expression.`,
          rule: `Thompson Rule: Create new start and accept states. Add bypass ε-transition (0 repetitions) and loopback ε-transition from child accept to child start (repetition).`,
        };
      case 'plus':
        return {
          title: `Positive Closure Node (+)`,
          meaning: `One or more repetitions of child expression.`,
          rule: `Thompson Rule: Create start & accept states with loopback ε-transition. Requires at least one pass.`,
        };
      case 'optional':
        return {
          title: `Optional Node (?)`,
          meaning: `Zero or one occurrence of child expression.`,
          rule: `Thompson Rule: Add bypass ε-transition from start to accept state without loopback.`,
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 m-0">
          Expression Tree (AST)
        </h3>
        <span className="text-xs text-slate-400">Click node to inspect Thompson rule</span>
      </div>

      <div className="overflow-x-auto flex justify-center bg-[#080E1A] rounded-xl border border-slate-800/80 p-4">
        <svg width="500" height="260" viewBox="0 0 500 260" className="max-w-full">
          {renderTreeSvg(treeRoot)}
        </svg>
      </div>

      {selectedNode && (
        <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-xs">
          <div className="font-bold text-cyan-300 text-sm mb-1">
            {getNodeInfo(selectedNode).title}
          </div>
          <p className="text-slate-200 mb-2">{getNodeInfo(selectedNode).meaning}</p>
          <div className="rounded-lg bg-[#080E1A] p-2.5 font-mono text-[11px] text-emerald-300 border border-emerald-500/20">
            {getNodeInfo(selectedNode).rule}
          </div>
        </div>
      )}
    </div>
  );
};
