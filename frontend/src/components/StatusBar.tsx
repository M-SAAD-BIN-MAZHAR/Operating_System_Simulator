import { useState, useEffect } from 'react';
import { useKernelStore } from '../store/kernelStore';

export default function StatusBar() {
  const { isConnected, stats, processes, algo, memStats, uptime, setAlgo } = useKernelStore();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour12: false })), 1000);
    return () => clearInterval(t);
  }, []);

  const algos = ['fcfs', 'rr', 'priority', 'mlfq'];
  const handleAlgoClick = () => {
    const next = (algos.indexOf(algo.toLowerCase()) + 1) % algos.length;
    setAlgo(algos[next]);
  };

  const cpuPct   = Math.round(stats?.cpu || 0);
  const memPct   = Math.round((memStats.used / 32) * 100);
  const procs    = processes.length;

  const algoColors: Record<string, string> = {
    fcfs: '#00f5ff', rr: '#bf00ff', priority: '#ff2d78', mlfq: '#00ff9f'
  };
  const algoColor = algoColors[algo.toLowerCase()] || '#00f5ff';

  const Bar = ({ pct, color }: { pct: number; color: string }) => (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
      <span className="text-[10px] font-bold w-7 text-right" style={{ color }}>{pct}%</span>
    </div>
  );

  return (
    <div className="fixed top-0 left-0 right-0 h-8 z-[99999] flex items-center justify-between px-3
      bg-[#03000f]/95 backdrop-blur-md border-b border-[#00f5ff]/20
      font-mono text-[11px] select-none overflow-hidden"
      style={{ boxShadow: '0 0 20px rgba(0,245,255,0.1)' }}>

      {/* LEFT — Identity */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rotate-45 bg-[#00f5ff] shrink-0"
            style={{ boxShadow: '0 0 8px #00f5ff' }} />
          <span className="font-black tracking-widest text-[11px] neon-text-cyan text-[#00f5ff] hidden sm:block">
            KNIGHTKERNEL OS
          </span>
          <span className="font-black text-[11px] text-[#00f5ff] sm:hidden">KK</span>
        </div>

        <div className="h-4 w-px bg-[#00f5ff]/20 hidden sm:block" />

        <div className="flex items-center gap-1 hidden sm:flex">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isConnected ? 'bg-[#00ff9f]' : 'bg-[#ff2d78]'}`}
            style={{ boxShadow: isConnected ? '0 0 6px #00ff9f' : '0 0 6px #ff2d78',
                     animation: isConnected ? 'pulse-glow 2s infinite' : 'none' }} />
          <span className={`font-bold text-[10px] hidden md:block ${isConnected ? 'text-[#00ff9f]' : 'text-[#ff2d78]'}`}>
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* CENTER — Algo badge */}
      <div className="absolute left-1/2 -translate-x-1/2 shrink-0">
        <button onClick={handleAlgoClick}
          className="px-3 py-0.5 font-black text-[10px] uppercase tracking-widest transition-all duration-300 border whitespace-nowrap"
          style={{
            borderColor: algoColor, color: algoColor,
            background: `${algoColor}15`,
            boxShadow: `0 0 10px ${algoColor}40`
          }}>
          ⚡ {algo.toUpperCase()}
        </button>
      </div>

      {/* RIGHT — Telemetry */}
      <div className="flex items-center gap-3 shrink-0">
        {/* CPU bar — hide on very small */}
        <div className="hidden md:flex items-center gap-1.5">
          <span className="text-[#00f5ff]/40 text-[9px] uppercase">CPU</span>
          <Bar pct={cpuPct} color="#00f5ff" />
        </div>
        {/* MEM bar — hide on small */}
        <div className="hidden lg:flex items-center gap-1.5">
          <span className="text-[#bf00ff]/40 text-[9px] uppercase">MEM</span>
          <Bar pct={memPct} color="#bf00ff" />
        </div>

        <div className="h-4 w-px bg-white/10 hidden md:block" />

        {/* PROCS — always show */}
        <div className="flex items-center gap-1">
          <span className="text-[#ff2d78]/40 text-[9px] hidden sm:block">PROCS</span>
          <span className="text-[#ff2d78] font-black">{procs}</span>
        </div>

        {/* Uptime — hide on small */}
        <div className="hidden sm:flex items-center gap-1">
          <span className="text-[#00ff9f]/40 text-[9px]">UP</span>
          <span className="text-[#00ff9f] font-black">{uptime}s</span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Clock — always show */}
        <div className="bg-[#00f5ff] text-[#03000f] px-2 py-0.5 font-black text-[10px] shrink-0"
          style={{ boxShadow: '0 0 8px rgba(0,245,255,0.5)' }}>
          {time}
        </div>
      </div>
    </div>
  );
}
