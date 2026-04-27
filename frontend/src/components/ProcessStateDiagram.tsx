import React, { useEffect, useRef } from 'react';
import { useKernelStore } from '../store/kernelStore';
import type { PCB } from '../types/kernel';

// State node positions (x%, y%) in the SVG canvas
const STATE_NODES = [
  { id: 'NEW',        label: 'NEW',        x: 50,  y: 10,  color: '#ffe600', desc: 'Just created' },
  { id: 'READY',      label: 'READY',      x: 20,  y: 45,  color: '#00f5ff', desc: 'Waiting in queue' },
  { id: 'RUNNING',    label: 'RUNNING',    x: 50,  y: 45,  color: '#00ff9f', desc: 'On CPU' },
  { id: 'WAITING',    label: 'WAITING',    x: 80,  y: 45,  color: '#bf00ff', desc: 'Blocked / I/O' },
  { id: 'TERMINATED', label: 'DONE',       x: 50,  y: 82,  color: '#ff2d78', desc: 'Finished' },
];

// Arrows between states
const ARROWS = [
  { from: 'NEW',     to: 'READY',      label: 'Admit' },
  { from: 'READY',   to: 'RUNNING',    label: 'Dispatch' },
  { from: 'RUNNING', to: 'READY',      label: 'Preempt' },
  { from: 'RUNNING', to: 'WAITING',    label: 'Block' },
  { from: 'WAITING', to: 'READY',      label: 'Unblock' },
  { from: 'RUNNING', to: 'TERMINATED', label: 'Exit' },
];

const NODE_R = 32; // radius in px (SVG units out of 400x300)

function getNodePos(id: string, W: number, H: number) {
  const n = STATE_NODES.find(s => s.id === id)!;
  return { x: (n.x / 100) * W, y: (n.y / 100) * H };
}

function arrowPath(from: string, to: string, W: number, H: number): string {
  const f = getNodePos(from, W, H);
  const t = getNodePos(to, W, H);
  const dx = t.x - f.x, dy = t.y - f.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const sx = f.x + ux * NODE_R, sy = f.y + uy * NODE_R;
  const ex = t.x - ux * NODE_R, ey = t.y - uy * NODE_R;

  // Slight curve for bidirectional arrows
  const isBidi = ARROWS.some(a => a.from === to && a.to === from);
  if (isBidi) {
    const cx = (sx + ex) / 2 - uy * 20;
    const cy = (sy + ey) / 2 + ux * 20;
    return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
  }
  return `M ${sx} ${sy} L ${ex} ${ey}`;
}

function midPoint(from: string, to: string, W: number, H: number) {
  const f = getNodePos(from, W, H);
  const t = getNodePos(to, W, H);
  const isBidi = ARROWS.some(a => a.from === to && a.to === from);
  const dx = t.x - f.x, dy = t.y - f.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const sx = f.x + ux * NODE_R, sy = f.y + uy * NODE_R;
  const ex = t.x - ux * NODE_R, ey = t.y - uy * NODE_R;
  if (isBidi) {
    return { x: (sx + ex) / 2 - uy * 20, y: (sy + ey) / 2 + ux * 20 };
  }
  return { x: (sx + ex) / 2, y: (sy + ey) / 2 };
}

// Count processes per state
function countByState(processes: PCB[]) {
  const counts: Record<string, number> = { NEW: 0, READY: 0, RUNNING: 0, WAITING: 0, TERMINATED: 0 };
  processes.forEach(p => { if (counts[p.state] !== undefined) counts[p.state]++; });
  return counts;
}

export const ProcessStateDiagram: React.FC = () => {
  const { processes } = useKernelStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const counts = countByState(processes);

  const W = 400, H = 300;

  // Active transitions (which arrows are "hot")
  const activeArrows = new Set<string>();
  if (counts.NEW > 0)     activeArrows.add('NEW->READY');
  if (counts.READY > 0)   activeArrows.add('READY->RUNNING');
  if (counts.RUNNING > 0) { activeArrows.add('RUNNING->READY'); activeArrows.add('RUNNING->WAITING'); activeArrows.add('RUNNING->TERMINATED'); }
  if (counts.WAITING > 0) activeArrows.add('WAITING->READY');

  return (
    <div className="flex flex-col h-full bg-[#07010f] font-mono overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b shrink-0"
        style={{ borderColor: 'rgba(0,245,255,0.15)', background: 'rgba(0,0,0,0.4)' }}>
        <div>
          <div className="text-[9px] text-[#00f5ff]/40 uppercase tracking-widest">Real-Time</div>
          <div className="text-sm font-black uppercase tracking-wider neon-text-cyan" style={{ color: '#00f5ff' }}>
            Process State Diagram
          </div>
        </div>
        <div className="flex gap-3">
          {STATE_NODES.map(n => (
            <div key={n.id} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: n.color, boxShadow: `0 0 6px ${n.color}` }} />
              <span className="text-[9px] font-black uppercase" style={{ color: n.color }}>{n.label}</span>
              <span className="text-[9px] font-black text-white/60 ml-0.5">
                {counts[n.id] > 0 ? `×${counts[n.id]}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Diagram */}
      <div className="flex-1 flex items-center justify-center p-4 relative min-h-[200px]">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full"
          style={{ maxHeight: 'min(340px, calc(100% - 8px))', filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.05))' }}>

          <defs>
            {/* Arrow markers for each color */}
            {['#00f5ff', '#bf00ff', '#ff2d78', '#00ff9f', '#ffe600'].map(c => (
              <marker key={c} id={`arrow-${c.replace('#','')}`}
                markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill={c} />
              </marker>
            ))}
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Grid dots */}
          {Array.from({ length: 8 }).map((_, i) =>
            Array.from({ length: 6 }).map((_, j) => (
              <circle key={`${i}-${j}`} cx={i * 57 + 28} cy={j * 57 + 15}
                r="1" fill="rgba(0,245,255,0.08)" />
            ))
          )}

          {/* Arrows */}
          {ARROWS.map(({ from, to, label }) => {
            const key = `${from}->${to}`;
            const isActive = activeArrows.has(key);
            const fromNode = STATE_NODES.find(n => n.id === from)!;
            const color = isActive ? fromNode.color : 'rgba(255,255,255,0.1)';
            const mid = midPoint(from, to, W, H);

            return (
              <g key={key}>
                <path
                  d={arrowPath(from, to, W, H)}
                  fill="none"
                  stroke={color}
                  strokeWidth={isActive ? 1.5 : 0.8}
                  strokeDasharray={isActive ? 'none' : '4 4'}
                  markerEnd={`url(#arrow-${color.replace('#','')})`}
                  style={{ transition: 'all 0.5s', filter: isActive ? `drop-shadow(0 0 4px ${color})` : 'none' }}
                />
                <text x={mid.x} y={mid.y - 4} textAnchor="middle"
                  fontSize="7" fill={isActive ? color : 'rgba(255,255,255,0.2)'}
                  fontFamily="monospace" fontWeight="bold">
                  {label}
                </text>
              </g>
            );
          })}

          {/* State Nodes */}
          {STATE_NODES.map(node => {
            const { x, y } = getNodePos(node.id, W, H);
            const count = counts[node.id];
            const isActive = count > 0;
            const isRunning = node.id === 'RUNNING' && count > 0;

            return (
              <g key={node.id} style={{ cursor: 'default' }}>
                {/* Outer glow ring for active */}
                {isActive && (
                  <circle cx={x} cy={y} r={NODE_R + 8}
                    fill="none" stroke={node.color} strokeWidth="0.5"
                    opacity="0.3"
                    style={{ animation: isRunning ? 'state-pulse 1s ease-in-out infinite' : 'none' }} />
                )}

                {/* Main circle */}
                <circle cx={x} cy={y} r={NODE_R}
                  fill={isActive ? `${node.color}18` : 'rgba(0,0,0,0.4)'}
                  stroke={node.color}
                  strokeWidth={isActive ? 1.5 : 0.5}
                  opacity={isActive ? 1 : 0.3}
                  filter={isActive ? 'url(#glow)' : 'none'}
                  style={{ transition: 'all 0.4s' }}
                />

                {/* State label */}
                <text x={x} y={y - 6} textAnchor="middle"
                  fontSize="9" fontWeight="bold" fontFamily="monospace"
                  fill={isActive ? node.color : 'rgba(255,255,255,0.2)'}
                  style={{ transition: 'fill 0.4s' }}>
                  {node.label}
                </text>

                {/* Count badge */}
                {count > 0 && (
                  <text x={x} y={y + 10} textAnchor="middle"
                    fontSize="14" fontWeight="black" fontFamily="monospace"
                    fill={node.color} filter="url(#glow)">
                    {count}
                  </text>
                )}

                {/* Desc */}
                <text x={x} y={y + 22} textAnchor="middle"
                  fontSize="6" fontFamily="monospace"
                  fill={isActive ? `${node.color}80` : 'rgba(255,255,255,0.1)'}>
                  {node.desc}
                </text>
              </g>
            );
          })}
        </svg>

        {/* No processes hint */}
        {processes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-[#00f5ff]/20 text-xs uppercase tracking-widest">No processes</div>
              <div className="text-[#00f5ff]/10 text-[10px] mt-1">Spawn processes or load a workload</div>
            </div>
          </div>
        )}
      </div>

      {/* Process list mini-table */}
      {processes.length > 0 && (
        <div className="border-t px-4 py-3 shrink-0 max-h-36 overflow-y-auto"
          style={{ borderColor: 'rgba(0,245,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
          <div className="grid gap-1">
            {processes.slice(0, 8).map(p => {
              const node = STATE_NODES.find(n => n.id === p.state);
              const color = node?.color || '#ffffff';
              return (
                <div key={p.pid} className="flex items-center gap-3 text-[10px]">
                  <span className="text-white/30 w-8">P{p.pid}</span>
                  <span className="text-white/60 w-20 truncate">{p.name}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                    <span className="font-bold" style={{ color }}>{p.state}</span>
                  </div>
                  <div className="ml-auto flex gap-3 text-white/30">
                    <span>PRI:{p.priority}</span>
                    <span>REM:{p.remaining_time}</span>
                  </div>
                </div>
              );
            })}
            {processes.length > 8 && (
              <div className="text-[9px] text-white/20 text-center">+{processes.length - 8} more</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessStateDiagram;
