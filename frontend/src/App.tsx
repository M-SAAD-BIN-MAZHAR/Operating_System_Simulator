import { useEffect } from 'react';
import { useKernelStore } from './store/kernelStore';
import BootSequence from './components/BootSequence';
import StatusBar from './components/StatusBar';
import WindowManager from './components/WindowManager';
import Dock from './components/Dock';
import wallpaperUrl from './assets/hacker-bg.jpg';

/**
 * App Component
 * The main Desktop Environment Shell for KnightKernel OS.
 */
function App() {
  const connect = useKernelStore(state => state.connect);
  const booted = useKernelStore(state => state.booted);
  const setBooted = useKernelStore(state => state.setBooted);

  useEffect(() => {
    // Initiate connection to the Node.js bridge on startup
    connect();

    // Cleanup connection on unmount to prevent leaks in StrictMode
    return () => {
      const { disconnect } = useKernelStore.getState();
      disconnect();
    };
  }, [connect]);

  // If not booted, show the retro BIOS sequence
  if (!booted) {
    return <BootSequence onComplete={() => setBooted(true)} />;
  }

  // Once booted, show the Desktop Interface
  return (
    <div className="relative w-screen h-screen overflow-hidden select-none cyber-grid"
      style={{ background: 'var(--bg-deep)' }}>

      {/* Cyberpunk background wallpaper with overlay */}
      <div className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${wallpaperUrl})` }} />

      {/* Deep purple/cyan gradient overlay */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(191,0,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,245,255,0.06) 0%, transparent 60%)' }} />

      {/* 1. TOP: Status Bar */}
      <StatusBar />

      {/* 2. CENTER: Desktop Workspace */}
      <main className="absolute inset-0 pt-8 pb-16 overflow-hidden">
        <WindowManager />
      </main>

      {/* 3. BOTTOM: Dock */}
      <Dock />

      {/* 4. CRT scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-[100001]"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)' }} />

      {/* 5. Vignette */}
      <div className="pointer-events-none fixed inset-0 z-[100002]"
        style={{ boxShadow: 'inset 0 0 200px rgba(0,0,0,0.7)' }} />

      {/* 6. Corner accent lines */}
      <div className="pointer-events-none fixed top-8 left-0 w-32 h-px z-[100003]"
        style={{ background: 'linear-gradient(90deg, #00f5ff, transparent)' }} />
      <div className="pointer-events-none fixed top-8 right-0 w-32 h-px z-[100003]"
        style={{ background: 'linear-gradient(270deg, #bf00ff, transparent)' }} />
    </div>
  );
}

export default App;
