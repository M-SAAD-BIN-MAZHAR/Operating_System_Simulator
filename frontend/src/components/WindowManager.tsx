import { useWindowStore } from '../store/windowStore';
import BaseWindow from './BaseWindow';
import TerminalApp from './TerminalApp';
import { ProcessManager } from './ProcessManager';
import { SchedulerView } from './SchedulerView';
import { MemoryViewer } from './MemoryViewer';
import { SyncVisualizer } from './SyncVisualizer';

/**
 * WindowManager Component
 * Renders the active windows and handles application routing.
 */
export default function WindowManager() {
    const { windows } = useWindowStore();

    if (windows.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center pointer-events-none">
                <div className="text-center flex flex-col items-center gap-4">
                  <div className="w-24 h-24 border border-[#00f5ff]/20 rounded-full flex items-center justify-center"
                    style={{ boxShadow: '0 0 40px rgba(0,245,255,0.05)' }}>
                    <span className="text-4xl font-black neon-text-cyan" style={{ color: '#00f5ff' }}>K</span>
                  </div>
                  <div>
                    <div className="text-[#00f5ff]/20 text-xs font-black tracking-[0.5em] uppercase">KnightKernel OS</div>
                    <div className="text-[#bf00ff]/15 text-[10px] mt-1 tracking-widest">Click an app in the dock to begin</div>
                  </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 pointer-events-none">
            {windows.map((window) => (
                <div key={window.id} className="pointer-events-auto">
                    <BaseWindow window={window}>
                        {renderAppContent(window.id, window.type)}
                    </BaseWindow>
                </div>
            ))}
        </div>
    );
}

/**
 * Helper to render the appropriate component based on app type
 */
function renderAppContent(id: string, type: string) {
    switch (type) {
        case 'terminal':
            return <TerminalApp id={id} />;
        case 'process_mgr':
            return <ProcessManager />;
        case 'scheduler':
            return <SchedulerView />;
        case 'memory':
            return <MemoryViewer />;
        case 'sync':
            return <SyncVisualizer />;
        default:
            return <div className="p-4">Unknown App Type: {type}</div>;
    }
}
