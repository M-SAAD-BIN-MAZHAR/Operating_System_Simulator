import { create } from 'zustand';

export type AppType = 'terminal' | 'process_mgr' | 'scheduler' | 'memory' | 'sync';

export interface WindowInstance {
    id: string;
    type: AppType;
    title: string;
    x: number;
    y: number;
    width: number;
    height: number;
    isFocused: boolean;
    isMaximized: boolean;
    zIndex: number;
}

interface WindowState {
    windows: WindowInstance[];
    nextZIndex: number;
    
    // Actions
    openWindow: (type: AppType, title: string) => void;
    closeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    moveWindow: (id: string, x: number, y: number) => void;
    resizeWindow: (id: string, width: number, height: number) => void;
    maximizeWindow: (id: string) => void;
}

/**
 * windowStore
 * Managing the state of floating windows in the KnightKernel Desktop Environment.
 */
export const useWindowStore = create<WindowState>((set, get) => ({
    windows: [],
    nextZIndex: 10,

    openWindow: (type, title) => {
        const id = `${type}-${Math.random().toString(36).substring(2, 9)}`;
        const zIndex = get().nextZIndex;

        // Responsive default sizes based on viewport
        const vw = globalThis.window?.innerWidth  ?? 1280;
        const vh = globalThis.window?.innerHeight ?? 800;

        const STATUSBAR = 32;
        const DOCK      = 64;
        const usableH   = vh - STATUSBAR - DOCK;
        const usableW   = vw;

        // Default sizes — never exceed 95% of usable area
        const defaultW = Math.min(type === 'terminal' ? 700 : 820, Math.floor(usableW * 0.92));
        const defaultH = Math.min(type === 'terminal' ? 460 : 520, Math.floor(usableH * 0.90));

        // Cascade offset, but clamp so window stays fully on screen
        const offset   = (get().windows.length % 6) * 24;
        const maxX     = Math.max(0, usableW - defaultW);
        const maxY     = Math.max(0, usableH - defaultH);
        const spawnX   = Math.min(offset + 40, maxX);
        const spawnY   = Math.min(offset + 40, maxY);

        const newWindow: WindowInstance = {
            id,
            type,
            title,
            x: spawnX,
            y: STATUSBAR + spawnY,
            width:  defaultW,
            height: defaultH,
            isFocused: true,
            isMaximized: false,
            zIndex
        };

        set((state) => ({
            windows: [...state.windows.map(w => ({ ...w, isFocused: false })), newWindow],
            nextZIndex: state.nextZIndex + 1
        }));
    },

    closeWindow: (id) => {
        set((state) => ({
            windows: state.windows.filter(w => w.id !== id)
        }));
    },

    focusWindow: (id) => {
        const { windows } = get();
        const target = windows.find(w => w.id === id);
        if (!target || target.isFocused) return;

        set((state) => ({
            windows: state.windows.map(w => ({
                ...w,
                isFocused: w.id === id,
                zIndex: w.id === id ? state.nextZIndex : w.zIndex
            })),
            nextZIndex: state.nextZIndex + 1
        }));
    },

    moveWindow: (id, x, y) => {
        set((state) => ({
            windows: state.windows.map(w => 
                w.id === id ? { ...w, x, y } : w
            )
        }));
    },

    resizeWindow: (id, width, height) => {
        set((state) => ({
            windows: state.windows.map(w => 
                w.id === id ? { ...w, width, height } : w
            )
        }));
    },

    maximizeWindow: (id) => {
        set((state) => ({
            windows: state.windows.map(w => 
                w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
            )
        }));
    }
}));
