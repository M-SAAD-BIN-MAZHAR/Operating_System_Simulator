import React, { useState } from 'react';
import { useKernelStore } from '../store/kernelStore';
import ProcessStateDiagram from './ProcessStateDiagram';

const STATE_COLORS: Record<string, string> = {
  RUNNING:    '#00ff9f',
  READY:      '#00f5ff',
  WAITING:    '#bf00ff',
  NEW:        '#ffe600',
  TERMINATED: '#ff2d78',
};

export const ProcessManager: React.FC = () => {
  const { processes, sendCommand, isConnected } = useKernelStore();
  const [tab, setTab] = useState<'table' | 'diagram'>('diagram');
  const [showSpawn, setShowSpawn] = useState(false);
  const [name, setName] = useState('');
  const [burst, setBurst] = useState('5');
  const [priority, setPriority] = useState('5');

  const handleSpawn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await sendCommand({ cmd: 'spawn', name, burst: parseInt(burst), priority: parseInt(priority), arrival: 0 });
    setShowSpawn(false); setName(''); setBurst('5'); setPriority('5');
    await sendCommand({ cmd: 'ps' });
  };

  const handleKill = async (pid: number) => {
    await sendCommand({ cmd: 'kill', pid });
    await sendCommand({ cmd: 'ps' });
  };

  const handleWorkload = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    if (!type) return;
    await sendCommand({ cmd: 'workload', type });
    await sendCommand({ cmd: 'ps' });
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full font-mono text-sm overflow-hidden"
      style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b shrink-0"
        style={{ borderColor: 'rgba(0,245,255,0.15)', background: 'rgba(0,0,0,0.4)' }}>

        {/* Tabs */}
        <div className="flex gap-1 mr-2">
          {(['diagram', 'table'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1 text-[10px] font-black uppercase transition-all"
              style={{
                background: tab === t ? '#00f5ff' : 'transparent',
                color: tab === t ? '#03000f' : 'rgba(0,245,255,0.4)',
                border: `1px solid ${tab === t ? '#00f5ff' : 'rgba(0,245,255,0.2)'}`,
              }}>
              {t}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-white/10" />

        <button onClick={() => setShowSpawn(!showSpawn)} disabled={!isConnected}
          className="px-3 py-1 text-[10px] font-black uppercase transition-all btn-neon-cyan disabled:opacity-30">
          + SPAWN
        </button>

        <select onChange={handleWorkload} disabled={!isConnected}
          className="px-3 py-1 text-[10px] font-black uppercase bg-transparent border border-[#bf00ff]/40
            text-[#bf00ff] outline-none cursor-pointer disabled:opacity-30 hover:border-[#bf00ff]">
          <option value="">WORKLOAD ▼</option>
          <option value="cpu_bound">cpu_bound</option>
          <option value="io_bound">io_bound</option>
          <option value="mixed">mixed</option>
        </select>

        <button onClick={() => sendCommand({ cmd: 'ps' })} disabled={!isConnected}
          className="ml-auto px-3 py-1 text-[10px] font-black uppercase transition-all
            border border-white/10 text-white/30 hover:border-white/30 hover:text-white/60 disabled:opacity-30">
          ↻ REFRESH
        </button>

        <span className="text-[10px] text-white/30">{processes.length} procs</span>
      </div>

      {/* Spawn form */}
      {showSpawn && (
        <form onSubmit={handleSpawn} className="flex items-end gap-3 px-4 py-3 border-b shrink-0"
          style={{ borderColor: 'rgba(0,245,255,0.1)', background: 'rgba(0,245,255,0.03)' }}>
          {[
            { label: 'Name', val: name, set: setName, type: 'text', ph: 'proc_name', w: 'w-32' },
            { label: 'Burst', val: burst, set: setBurst, type: 'number', ph: '5', w: 'w-20' },
            { label: 'Priority', val: priority, set: setPriority, type: 'number', ph: '5', w: 'w-20' },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-1">
              <label className="text-[9px] text-[#00f5ff]/40 uppercase">{f.label}</label>
              <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                placeholder={f.ph} required={f.label === 'Name'}
                className={`${f.w} neon-input px-2 py-1 text-xs`} />
            </div>
          ))}
          <button type="submit"
            className="px-4 py-1 font-black text-[10px] uppercase bg-[#00f5ff] text-[#03000f]
              hover:shadow-[0_0_12px_rgba(0,245,255,0.5)] transition-all">
            SPAWN
          </button>
          <button type="button" onClick={() => setShowSpawn(false)}
            className="px-3 py-1 text-[10px] border border-white/10 text-white/30 hover:text-white/60">
            CANCEL
          </button>
        </form>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'diagram' ? (
          <ProcessStateDiagram />
        ) : (
          <div className="h-full overflow-auto">
            {processes.length === 0 ? (
              <div className="h-full flex items-center justify-center text-white/20 text-xs uppercase tracking-widest">
                No processes — spawn or load a workload
              </div>
            ) : (
              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-left border-collapse text-[11px] min-w-[600px]">
                <thead className="sticky top-0" style={{ background: 'var(--bg-dark)' }}>
                  <tr className="border-b" style={{ borderColor: 'rgba(0,245,255,0.2)' }}>
                    {['PID','Name','State','Pri','Burst','Rem','Wait','TAT',''].map(h => (
                      <th key={h} className="px-3 py-2 font-black uppercase text-[9px] tracking-widest"
                        style={{ color: 'rgba(0,245,255,0.5)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processes.map(p => {
                    const color = STATE_COLORS[p.state] || '#ffffff';
                    return (
                      <tr key={p.pid} className="border-b transition-colors"
                        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,245,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td className="px-3 py-2 text-white/30">{String(p.pid).padStart(3,'0')}</td>
                        <td className="px-3 py-2 text-white/70">{p.name}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full"
                              style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                            <span className="font-bold" style={{ color }}>{p.state}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-white/50">{p.priority}</td>
                        <td className="px-3 py-2 text-white/50">{p.burst_time}</td>
                        <td className="px-3 py-2 text-white/50">{p.remaining_time}</td>
                        <td className="px-3 py-2 text-white/50">{p.waiting_time}</td>
                        <td className="px-3 py-2 text-white/50">{p.turnaround_time}</td>
                        <td className="px-3 py-2">
                          <button onClick={() => handleKill(p.pid)}
                            disabled={!isConnected || p.state === 'TERMINATED'}
                            className="text-[10px] font-black uppercase transition-all disabled:opacity-20"
                            style={{ color: '#ff2d78' }}
                            onMouseEnter={e => (e.currentTarget.style.textShadow = '0 0 8px #ff2d78')}
                            onMouseLeave={e => (e.currentTarget.style.textShadow = 'none')}>
                            KILL
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
