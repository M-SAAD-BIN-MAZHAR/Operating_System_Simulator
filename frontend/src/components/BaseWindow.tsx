import React, { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '../store/windowStore';
import type { WindowInstance } from '../store/windowStore';

interface BaseWindowProps {
    window: WindowInstance;
    children: React.ReactNode;
}

/**
 * BaseWindow Component
 * A draggable, resizable, and focusable window frame for the KnightKernel Desktop.
 */
export default function BaseWindow({ window, children }: BaseWindowProps) {
    const { focusWindow, closeWindow, moveWindow, resizeWindow, maximizeWindow } = useWindowStore();
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const resizeStart = useRef({ w: 0, h: 0, x: 0, y: 0 });

    const handleHeaderMouseDown = (e: React.MouseEvent) => {
        if (window.isMaximized) return;
        focusWindow(window.id);
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - window.x,
            y: e.clientY - window.y
        };
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        focusWindow(window.id);
        setIsResizing(true);
        resizeStart.current = {
            w: window.width,
            h: window.height,
            x: e.clientX,
            y: e.clientY
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const vw = globalThis.window?.innerWidth  ?? 1280;
                const vh = globalThis.window?.innerHeight ?? 800;
                const STATUSBAR = 32;
                const DOCK      = 60;
                // Clamp so window title bar stays reachable
                const newX = Math.max(-(window.width - 80), Math.min(vw - 80, e.clientX - dragOffset.current.x));
                const newY = Math.max(STATUSBAR, Math.min(vh - DOCK - 28, e.clientY - dragOffset.current.y));
                moveWindow(window.id, newX, newY);
            }
            if (isResizing) {
                const dw = e.clientX - resizeStart.current.x;
                const dh = e.clientY - resizeStart.current.y;
                resizeWindow(
                    window.id,
                    Math.max(320, resizeStart.current.w + dw),
                    Math.max(220, resizeStart.current.h + dh)
                );
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, window.id, moveWindow, resizeWindow]);

    const style: React.CSSProperties = window.isMaximized ? {
        top: '32px', // Status bar height
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 32px)',
        zIndex: window.zIndex
    } : {
        top: `${window.y}px`,
        left: `${window.x}px`,
        width: `${window.width}px`,
        height: `${window.height}px`,
        zIndex: window.zIndex
    };

    return (
        <div 
            className={`fixed flex flex-col overflow-hidden transition-all duration-200`}
            style={{
              ...style,
              border: `1px solid ${window.isFocused ? 'rgba(0,245,255,0.6)' : 'rgba(0,245,255,0.15)'}`,
              background: 'rgba(7,1,15,0.92)',
              backdropFilter: 'blur(16px)',
              boxShadow: window.isFocused
                ? '0 0 30px rgba(0,245,255,0.15), 0 20px 60px rgba(0,0,0,0.8)'
                : '0 8px 32px rgba(0,0,0,0.6)',
            }}
            onMouseDown={() => focusWindow(window.id)}
        >
            {/* Title Bar */}
            <div 
                onMouseDown={handleHeaderMouseDown}
                className="h-7 min-h-[28px] px-3 flex items-center justify-between cursor-default select-none"
                style={{
                  background: window.isFocused
                    ? 'linear-gradient(90deg, rgba(0,245,255,0.15), rgba(191,0,255,0.1))'
                    : 'rgba(0,0,0,0.5)',
                  borderBottom: `1px solid ${window.isFocused ? 'rgba(0,245,255,0.3)' : 'rgba(0,245,255,0.08)'}`,
                }}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-1.5 h-1.5 rotate-45"
                      style={{ background: window.isFocused ? '#00f5ff' : 'rgba(0,245,255,0.3)',
                               boxShadow: window.isFocused ? '0 0 6px #00f5ff' : 'none' }} />
                    <span className="font-black text-[10px] uppercase truncate tracking-widest"
                      style={{ color: window.isFocused ? '#00f5ff' : 'rgba(0,245,255,0.4)' }}>
                      {window.title}
                    </span>
                </div>

                <div className="flex gap-1">
                    <button onClick={() => maximizeWindow(window.id)}
                        className="w-5 h-5 flex items-center justify-center text-[10px] transition-all"
                        style={{ color: 'rgba(0,245,255,0.4)', border: '1px solid rgba(0,245,255,0.15)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,245,255,0.1)'; (e.currentTarget as HTMLElement).style.color = '#00f5ff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(0,245,255,0.4)'; }}>
                        {window.isMaximized ? '❐' : '□'}
                    </button>
                    <button onClick={() => closeWindow(window.id)}
                        className="w-5 h-5 flex items-center justify-center text-[10px] transition-all"
                        style={{ color: 'rgba(255,45,120,0.5)', border: '1px solid rgba(255,45,120,0.2)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ff2d78'; (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 8px #ff2d78'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,45,120,0.5)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                        ✕
                    </button>
                </div>
            </div>

            {/* Window Content */}
            <div className="flex-1 relative overflow-auto" style={{ background: 'rgba(0,0,0,0.2)' }}>
                {children}
            </div>

            {/* Resize Handle */}
            {!window.isMaximized && (
                <div onMouseDown={handleResizeMouseDown}
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-end justify-end p-0.5 group">
                    <div className="w-2 h-2 border-r border-b transition-all"
                      style={{ borderColor: 'rgba(0,245,255,0.3)' }} />
                </div>
            )}
        </div>
    );
}
