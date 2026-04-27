import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useKernelStore } from '../store/kernelStore';
import { dispatchCommand } from '../commands';

const PROMPT = '\x1b[38;2;0;245;255mroot@knightkernel\x1b[0m\x1b[38;2;191;0;255m:~$\x1b[0m ';

/**
 * Terminal Component
 * Provides an interactive shell interface to the Kernel Engine via xterm.js.
 */
export default function Terminal() {
    const containerRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const { isConnected, sendCommand } = useKernelStore();
    
    // Command input tracking
    const inputBuffer = useRef<string>("");
    const history = useRef<string[]>([]);
    const historyPos = useRef<number>(-1);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize xterm
        const term = new XTerm({
            theme: {
                background: '#03000f',
                foreground: '#e0d0ff',
                cursor: '#00f5ff',
                selectionBackground: '#bf00ff44',
                black: '#03000f',
                brightBlack: '#3a2060',
                red: '#ff2d78',
                brightRed: '#ff2d78',
                green: '#00ff9f',
                brightGreen: '#00ff9f',
                yellow: '#ffe600',
                brightYellow: '#ffe600',
                blue: '#00f5ff',
                brightBlue: '#00f5ff',
                magenta: '#bf00ff',
                brightMagenta: '#bf00ff',
                cyan: '#00f5ff',
                brightCyan: '#00f5ff',
                white: '#e0d0ff',
                brightWhite: '#ffffff',
            },
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            cursorBlink: true,
            scrollback: 1000,
            rows: 30
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        
        term.open(containerRef.current);
        fitAddon.fit();

        // Print welcome
        term.writeln('\x1b[33mKnightKernel Terminal Interface v1.0.0\x1b[0m');
        if (!isConnected) {
            term.writeln('\x1b[31m[ERROR] Connection to bridge lost. Attempting reconnect...\x1b[0m');
        }
        term.write(PROMPT);

        // Input handling
        term.onData(async (data) => {
            if (!isConnected) return;

            const charCode = data.charCodeAt(0);

            if (charCode === 13) { // Enter
                const cmd = inputBuffer.current.trim();
                term.write('\r\n');
                
                if (cmd.length > 0) {
                    await handleLocalCommand(cmd);
                    history.current.unshift(cmd);
                    historyPos.current = -1;
                } else {
                    term.write(PROMPT);
                }
                
                inputBuffer.current = "";
            } else if (charCode === 127) { // Backspace
                if (inputBuffer.current.length > 0) {
                    inputBuffer.current = inputBuffer.current.slice(0, -1);
                    term.write('\b \b');
                }
            } else if (data === '\x1b[A') { // Arrow Up
                if (history.current.length > 0 && historyPos.current < history.current.length - 1) {
                    historyPos.current++;
                    const histCmd = history.current[historyPos.current];
                    // Clear current line
                    for (let i = 0; i < inputBuffer.current.length; i++) term.write('\b \b');
                    inputBuffer.current = histCmd;
                    term.write(histCmd);
                }
            } else if (data === '\x1b[B') { // Arrow Down
                if (historyPos.current > -1) {
                    historyPos.current--;
                    // Clear current line
                    for (let i = 0; i < inputBuffer.current.length; i++) term.write('\b \b');
                    const histCmd = historyPos.current === -1 ? "" : history.current[historyPos.current];
                    inputBuffer.current = histCmd;
                    term.write(histCmd);
                }
            } else if (charCode >= 32 && charCode <= 126) {
                inputBuffer.current += data;
                term.write(data);
            }
        });

        const handleLocalCommand = async (rawInput: string) => {
            const parts = rawInput.split(/\s+/);
            const cmd = parts[0].toLowerCase();

            if (cmd === 'clear') {
                term.clear();
                term.write(PROMPT);
                return;
            }


            // Route via central dispatcher
            const result = await dispatchCommand(rawInput, sendCommand);
            if (result) {
                result.forEach(line => term.writeln(line));
                term.write(PROMPT);
            }
        };

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // Responsive handling
        const handleResize = () => {
            fitAddon.fit();
        };
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            term.dispose();
        };
    }, [isConnected, sendCommand]);

    return (
        <div className="flex-1 relative overflow-hidden flex flex-col pt-8"
          style={{ background: '#03000f' }}>
            <div ref={containerRef} className="flex-1 p-3"
              style={{ height: 'calc(100vh - 32px)' }} />
            <div className="pointer-events-none fixed inset-0 z-[9999]"
              style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)' }} />
        </div>
    );
}
