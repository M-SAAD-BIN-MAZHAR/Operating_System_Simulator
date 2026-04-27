import { useState, useEffect } from 'react';

interface BootLine { text: string; delay: number; color?: string; }

const BOOT_LOG: BootLine[] = [
  { text: "KNIGHTKERNEL BIOS v2.0 — Cyberpunk Edition", delay: 300, color: '#00f5ff' },
  { text: "Checking RAM .................. 256MB     [OK]", delay: 400 },
  { text: "Detecting CPU cores ........... 4 cores   [OK]", delay: 300 },
  { text: "Loading kernel image .......... loaded    [OK]", delay: 500 },
  { text: "Mounting virtual filesystem ... /proc /sys [OK]", delay: 300 },
  { text: "Starting scheduler ............ MLFQ      [OK]", delay: 400 },
  { text: "Starting memory manager ....... Paging LRU [OK]", delay: 300 },
  { text: "Starting sync daemon .......... ready     [OK]", delay: 400 },
  { text: "Initializing neon subsystem ... active    [OK]", delay: 300, color: '#bf00ff' },
  { text: "", delay: 400 },
  { text: "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%", delay: 300, color: '#00ff9f' },
  { text: "", delay: 500 },
  { text: "knightkernel login: root", delay: 400, color: '#ffe600' },
  { text: "Password: ████████", delay: 800 },
  { text: "", delay: 300 },
  { text: "Welcome to KnightKernel 2.0 — Cyberpunk Edition", delay: 400, color: '#ff2d78' },
  { text: "Kernel: C++17 | Bridge: Node.js | UI: React/TypeScript", delay: 300 },
  { text: "Type 'help' for available commands.", delay: 500, color: '#00f5ff' },
  { text: "", delay: 300 },
];

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines < BOOT_LOG.length) {
      const t = setTimeout(() => setVisibleLines(v => v + 1), BOOT_LOG[visibleLines].delay);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onComplete, 800);
      return () => clearTimeout(t);
    }
  }, [visibleLines]);

  return (
    <div className="flex flex-col h-screen p-8 font-mono overflow-hidden cyber-grid"
      style={{ background: 'var(--bg-deep)' }}>

      {/* Top accent line */}
      <div className="w-full h-px mb-6" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, #bf00ff, transparent)' }} />

      {/* ASCII logo */}
      <div className="mb-6 text-[10px] leading-tight neon-text-cyan" style={{ color: '#00f5ff' }}>
        {`██╗  ██╗███╗   ██╗██╗ ██████╗ ██╗  ██╗████████╗`}<br/>
        {`██║ ██╔╝████╗  ██║██║██╔════╝ ██║  ██║╚══██╔══╝`}<br/>
        {`█████╔╝ ██╔██╗ ██║██║██║  ███╗███████║   ██║   `}<br/>
        {`██╔═██╗ ██║╚██╗██║██║██║   ██║██╔══██║   ██║   `}<br/>
        {`██║  ██╗██║ ╚████║██║╚██████╔╝██║  ██║   ██║   `}<br/>
        {`╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝  `}
      </div>

      <div className="flex-1 space-y-0.5">
        {BOOT_LOG.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="text-sm leading-relaxed float-in"
            style={{ color: line.color || 'rgba(224,208,255,0.7)' }}>
            {line.text.includes('[OK]') ? (
              <span>
                {line.text.split('[OK]')[0]}
                <span style={{ color: '#00ff9f', textShadow: '0 0 8px #00ff9f' }}>[OK]</span>
              </span>
            ) : line.text}
          </div>
        ))}

        {visibleLines < BOOT_LOG.length && (
          <span className="inline-block w-2 h-4 align-middle ml-1 pulse-glow"
            style={{ background: '#00f5ff', boxShadow: '0 0 8px #00f5ff' }} />
        )}
      </div>

      {/* Bottom accent */}
      <div className="w-full h-px mt-6" style={{ background: 'linear-gradient(90deg, transparent, #bf00ff, #ff2d78, transparent)' }} />

      {/* CRT overlay */}
      <div className="pointer-events-none fixed inset-0 z-[9999]"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)' }} />
    </div>
  );
}
