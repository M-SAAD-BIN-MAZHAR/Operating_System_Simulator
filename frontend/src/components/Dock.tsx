import { useWindowStore } from '../store/windowStore';
import type { AppType } from '../store/windowStore';

interface AppIcon { type: AppType; label: string; icon: string; color: string; }

const APPS: AppIcon[] = [
  { type: 'terminal',    label: 'Terminal',   icon: '>_', color: '#00f5ff' },
  { type: 'process_mgr', label: 'Processes',  icon: '◈',  color: '#bf00ff' },
  { type: 'scheduler',   label: 'Scheduler',  icon: '⧖',  color: '#ff2d78' },
  { type: 'memory',      label: 'Memory',     icon: '▦',  color: '#00ff9f' },
  { type: 'sync',        label: 'Sync',       icon: '⇅',  color: '#ffe600' },
];

export default function Dock() {
  const { openWindow, windows } = useWindowStore();

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-1.5 px-2 py-1.5
      bg-[#07010f]/90 backdrop-blur-xl border border-[#00f5ff]/15 rounded-xl"
      style={{ boxShadow: '0 0 30px rgba(0,245,255,0.08), 0 8px 32px rgba(0,0,0,0.6)',
               maxWidth: 'calc(100vw - 16px)' }}>

      {APPS.map((app) => {
        const isOpen = windows.some(w => w.type === app.type);
        return (
          <div key={app.type} className="relative group">
            <button
              onClick={() => openWindow(app.type, app.label)}
              className="w-10 h-10 sm:w-12 sm:h-12 flex flex-col items-center justify-center rounded-lg border transition-all duration-300"
              style={{
                borderColor: isOpen ? app.color : `${app.color}25`,
                background: isOpen ? `${app.color}15` : 'transparent',
                boxShadow: isOpen ? `0 0 14px ${app.color}40` : 'none',
                color: isOpen ? app.color : `${app.color}60`,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = app.color;
                (e.currentTarget as HTMLElement).style.color = app.color;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 14px ${app.color}50`;
              }}
              onMouseLeave={e => {
                if (!isOpen) {
                  (e.currentTarget as HTMLElement).style.borderColor = `${app.color}25`;
                  (e.currentTarget as HTMLElement).style.color = `${app.color}60`;
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }
              }}
            >
              <span className="text-base sm:text-lg leading-none mb-0.5">{app.icon}</span>
              <span className="text-[6px] sm:text-[7px] uppercase font-black tracking-tighter hidden sm:block">{app.label}</span>
            </button>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[9px] font-black uppercase rounded
              opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
              style={{ background: app.color, color: '#03000f', boxShadow: `0 0 10px ${app.color}` }}>
              {app.label}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4"
                style={{ borderTopColor: app.color }} />
            </div>

            {/* Active dot */}
            {isOpen && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ background: app.color, boxShadow: `0 0 6px ${app.color}` }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
