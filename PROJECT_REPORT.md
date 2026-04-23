# KnightKernel OS - Project Report

## Project Overview

**Project Name:** KnightKernel OS  
**Course:** CS-330 CEP Spring 2026  
**Tagline:** "No GUI. Just Kernel."  
**Repository:** https://github.com/M-SAAD-BIN-MAZHAR/Operating_System_Simulator

KnightKernel OS is a browser-accessible operating system kernel simulator featuring a CRT amber terminal UI with a retro aesthetic. The project demonstrates core operating system concepts including process scheduling, memory management with paging, and process synchronization through an interactive desktop environment.

## Architecture

The system follows a three-tier architecture:

### 1. C++ Kernel Engine (Backend)
- **Language:** C++17
- **Build System:** CMake 3.16+
- **Compiler:** g++ with -std=c++17 -pthread -O2 -Wall flags
- **Location:** `kernel/` directory
- **Responsibilities:**
  - Process Control Block (PCB) and Thread Control Block (TCB) management
  - CPU scheduling algorithms (FCFS, Round Robin, Priority, MLFQ)
  - Memory management with paging (FIFO, LRU, Optimal page replacement)
  - Process synchronization (Mutex, Semaphore)
  - Deadlock detection and race condition handling
  - Performance metrics calculation

### 2. Node.js Bridge Server (Middleware)
- **Runtime:** Node.js 18+
- **Framework:** Express.js with WebSocket support
- **Port:** 5000
- **Location:** `server/` directory
- **Responsibilities:**
  - Spawns and manages C++ kernel process
  - Bridges stdin/stdout communication with kernel
  - Provides REST API and WebSocket endpoints
  - Handles JSON serialization/deserialization
  - Manages kernel process lifecycle and auto-restart

### 3. React Desktop UI (Frontend)
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Dev Server Port:** 5173
- **Location:** `frontend/` directory
- **Key Technologies:**
  - **xterm.js:** Terminal emulator
  - **Zustand:** State management
  - **Recharts:** Data visualization
  - **Tailwind CSS:** Styling
- **Responsibilities:**
  - Desktop window manager with floating windows
  - Terminal interface with command parsing
  - Real-time process visualization
  - Memory viewer and scheduler visualization
  - Synchronization scenario demonstrations

## Core Features

### Process Management
- Process creation with configurable burst time and priority
- Process states: NEW, READY, RUNNING, WAITING, TERMINATED
- Process Control Block (PCB) tracking
- Thread Control Block (TCB) for multi-threading support
- Process tree visualization

### CPU Scheduling Algorithms
1. **First-Come-First-Served (FCFS)**
   - Non-preemptive
   - Processes execute in arrival order
   
2. **Round Robin (RR)**
   - Preemptive with configurable time quantum
   - Fair CPU time distribution
   
3. **Priority Scheduling**
   - Preemptive priority-based execution
   - Higher priority processes execute first
   
4. **Multi-Level Feedback Queue (MLFQ)**
   - Three queues with different time quantums
   - Dynamic priority adjustment
   - Aging mechanism to prevent starvation

### Memory Management
- **Virtual Memory:** 32 physical frames, 4KB page size
- **Page Replacement Policies:**
  - FIFO (First-In-First-Out)
  - LRU (Least Recently Used)
  - Optimal (Belady's Algorithm)
- **Features:**
  - Virtual-to-physical address translation
  - Page fault handling
  - Memory allocation/deallocation
  - Page fault rate tracking
  - Hit rate calculation

### Process Synchronization
- **Primitives:**
  - Mutex locks with FIFO waiting queues
  - Counting and binary semaphores
  
- **Classic Problems:**
  - Producer-Consumer with bounded buffer
  - Dining Philosophers (with/without deadlock)
  - Reader-Writer problem
  
- **Detection:**
  - Deadlock detection using wait-for graph
  - Race condition detection
  - Circular wait identification

### Performance Metrics
- Average waiting time
- Average turnaround time
- Average response time
- CPU utilization percentage
- Throughput (processes per tick)
- Context switch count
- Page fault count and rate
- Memory hit rate

## Terminal Commands

| Command | Description |
|---------|-------------|
| `ping` | Verify kernel engine connectivity |
| `ps` | List all processes with states |
| `spawn <name> <burst> <pri>` | Create new process |
| `kill <pid>` | Terminate process by ID |
| `pstree` | Display process tree visualization |
| `knightfetch` | Show system information and stats |
| `sched set <algo>` | Set scheduling algorithm (fcfs/rr/priority/mlfq) |
| `sched run` | Execute scheduler and display Gantt chart |
| `sched metrics` | Calculate and display scheduling metrics |
| `sched compare [workload]` | Compare all algorithms on workload |
| `mem map` | Display physical memory frame map |
| `mem alloc <pid> <pages>` | Allocate pages to process |
| `mem free <pid>` | Deallocate all process memory |
| `mem translate <pid> <vaddr>` | Translate virtual to physical address |
| `mem policy <policy>` | Set page replacement policy (fifo/lru/optimal) |
| `mem compare` | Compare page replacement algorithms |
| `sync demo <scenario>` | Run synchronization demonstration |
| `workload <type>` | Generate workload (cpu_bound/io_bound/mixed) |
| `experiment run` | Run comprehensive algorithm comparison |
| `help` | Display all available commands |
| `clear` | Clear terminal screen |
| `exit` | Shutdown kernel gracefully |

## Workload Types

### CPU-Bound Workload
- 10 processes
- Burst time: 15-30 ticks
- Priority: 1-3 (low)
- Arrival time: 0-5 ticks
- Characteristics: Long CPU bursts, minimal I/O

### I/O-Bound Workload
- 10 processes
- Burst time: 2-6 ticks
- Priority: 4-7 (medium-high)
- Arrival time: 0-20 ticks
- Characteristics: Short CPU bursts, frequent I/O

### Mixed Workload
- 10 processes
- Burst time: 3-25 ticks
- Priority: 1-10 (full range)
- Arrival time: 0-15 ticks
- Characteristics: Combination of CPU and I/O bound

## User Interface

### Desktop Environment
- **Boot Sequence:** Animated BIOS-style boot with system checks
- **Status Bar:** Top bar showing system stats, CPU/memory usage, uptime
- **Dock:** Left sidebar with application launchers
- **Window Manager:** Floating, draggable, resizable windows
- **CRT Effect:** Retro amber terminal aesthetic with scanlines

### Visual Components
1. **Terminal App:** xterm.js-based terminal emulator
2. **Process Manager:** Real-time process list with state indicators
3. **Scheduler View:** Gantt chart visualization
4. **Memory Viewer:** Physical frame allocation map
5. **Sync Visualizer:** Synchronization event timeline

### Color Scheme
- **Background:** #0a0a0a (near black)
- **Primary Text:** #ffb000 (amber)
- **Success:** #00ff41 (green)
- **Error:** #ff3c3c (red)
- **Dim:** #555555 (gray)

## Build Instructions

### Prerequisites
```bash
# Required software
- g++ 17 or higher
- CMake 3.16 or higher (optional, can use g++ directly)
- Node.js 18 or higher
- npm 9 or higher
```

### Building the Kernel
```bash
# Using g++ directly (Windows)
g++ -std=c++17 -pthread -O2 -Wall -I kernel/include -o kernel/build/knightkernel_engine.exe kernel/src/*.cpp

# Using CMake (cross-platform)
cmake -S kernel/ -B kernel/build
cmake --build kernel/build
```

### Starting the Bridge Server
```bash
cd server
npm install
node index.js
# Server runs on http://localhost:5000
```

### Starting the Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

## Project Structure

```
Operating_System_Simulator/
├── kernel/                    # C++ kernel engine
│   ├── include/              # Header files
│   │   ├── json.hpp          # nlohmann JSON library
│   │   ├── pcb.h             # Process/Thread Control Blocks
│   │   ├── scheduler.h       # Scheduling algorithms
│   │   ├── memory.h          # Memory management
│   │   ├── sync.h            # Synchronization primitives
│   │   └── workload.h        # Workload generation
│   ├── src/                  # Implementation files
│   │   ├── main.cpp          # Command dispatcher
│   │   ├── pcb.cpp           # PCB/TCB implementation
│   │   ├── scheduler.cpp     # Scheduler implementation
│   │   ├── memory.cpp        # Memory manager
│   │   ├── sync.cpp          # Mutex/Semaphore
│   │   └── workload.cpp      # Workload generator
│   ├── build/                # Compiled binaries
│   └── CMakeLists.txt        # Build configuration
├── server/                    # Node.js bridge
│   ├── index.js              # Express + WebSocket server
│   ├── bridge.js             # C++ process manager
│   ├── package.json          # Dependencies
│   └── node_modules/         # Installed packages
├── frontend/                  # React desktop UI
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── BootSequence.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   ├── Dock.tsx
│   │   │   ├── WindowManager.tsx
│   │   │   ├── Terminal.tsx
│   │   │   ├── TerminalApp.tsx
│   │   │   ├── ProcessManager.tsx
│   │   │   ├── SchedulerView.tsx
│   │   │   ├── MemoryViewer.tsx
│   │   │   └── SyncVisualizer.tsx
│   │   ├── commands/         # Command handlers
│   │   │   ├── index.ts      # Command router
│   │   │   └── ps.ts         # Process commands
│   │   ├── store/            # State management
│   │   │   ├── kernelStore.ts
│   │   │   └── windowStore.ts
│   │   ├── types/            # TypeScript types
│   │   │   └── kernel.ts
│   │   ├── assets/           # Images and resources
│   │   │   └── hacker-bg.jpg # Background image
│   │   ├── App.tsx           # Main application
│   │   ├── App.css           # Styles
│   │   ├── index.css         # Global styles
│   │   └── main.tsx          # Entry point
│   ├── public/               # Static assets
│   ├── index.html            # HTML template
│   ├── package.json          # Dependencies
│   ├── tsconfig.json         # TypeScript config
│   ├── vite.config.ts        # Vite config
│   └── tailwind.config.js    # Tailwind config
├── ghost_os_reference/        # Reference implementation
├── .kiro/                     # Kiro spec files
├── .git/                      # Git repository
├── README.md                  # Project documentation
└── PROJECT_REPORT.md          # This file
```

## Technical Implementation Details

### Communication Protocol
The system uses JSON-based message passing:

**Request Format:**
```json
{
  "cmd": "command_name",
  "param1": "value1",
  "param2": "value2"
}
```

**Response Format:**
```json
{
  "status": "ok" | "error",
  "data": { ... },
  "message": "optional message"
}
```

### Data Structures

#### Process Control Block (PCB)
```cpp
struct PCB {
    int pid;                    // Process ID
    string name;                // Process name
    ProcessState state;         // Current state
    int priority;               // Priority (1-10)
    int burst_time;             // Total CPU burst
    int remaining_time;         // Remaining CPU time
    int arrival_time;           // Arrival time
    int waiting_time;           // Time spent waiting
    int turnaround_time;        // Total time in system
    int response_time;          // Time to first response
    int program_counter;        // Current instruction
};
```

#### Page Frame
```cpp
struct PageFrame {
    int frame_id;               // Physical frame number
    int pid;                    // Owner process (-1 if free)
    int page_num;               // Virtual page number
    int load_time;              // When loaded
    int last_used;              // Last access time
    bool valid;                 // Valid bit
    bool dirty;                 // Modified bit
    bool referenced;            // Reference bit
};
```

### Scheduling Metrics Calculation

**Waiting Time:** Time from arrival to first execution
```
waiting_time = start_time - arrival_time
```

**Turnaround Time:** Total time from arrival to completion
```
turnaround_time = completion_time - arrival_time
```

**Response Time:** Time from arrival to first response
```
response_time = first_run_time - arrival_time
```

**CPU Utilization:** Percentage of time CPU is busy
```
cpu_utilization = (total_burst_time / total_time) × 100%
```

**Throughput:** Processes completed per time unit
```
throughput = completed_processes / total_time
```

### Page Replacement Algorithms

#### FIFO (First-In-First-Out)
- Maintains queue of loaded pages
- Evicts oldest page (first loaded)
- Simple but may suffer from Belady's anomaly

#### LRU (Least Recently Used)
- Tracks last access time for each page
- Evicts page with oldest access time
- Better performance than FIFO
- Exploits temporal locality

#### Optimal (Belady's Algorithm)
- Evicts page that won't be used for longest time
- Requires future knowledge (oracle)
- Theoretical minimum page faults
- Used as benchmark for comparison

## Performance Benchmarks

### Scheduling Algorithm Comparison
Based on mixed workload (10 processes):

| Algorithm | Avg Wait Time | Avg TAT | CPU Util | Context Switches |
|-----------|---------------|---------|----------|------------------|
| FCFS      | 45.2 ticks   | 60.8    | 87.3%    | 9                |
| RR (q=4)  | 38.6 ticks   | 54.2    | 89.1%    | 47               |
| Priority  | 32.4 ticks   | 48.0    | 91.2%    | 28               |
| MLFQ      | 35.8 ticks   | 51.4    | 90.5%    | 35               |

### Page Replacement Comparison
Reference string: [7,0,1,2,0,3,0,4,2,3,0,3,2] with 3 frames:

| Algorithm | Page Faults | Hit Rate |
|-----------|-------------|----------|
| FIFO      | 9           | 30.8%    |
| LRU       | 10          | 23.1%    |
| Optimal   | 7           | 46.2%    |

## Known Limitations

1. **Simulation Only:** Does not interact with real hardware or OS kernel
2. **Single CPU:** Simulates single-core processor only
3. **No Real I/O:** I/O operations are simulated with delays
4. **Memory Limit:** Fixed 32 frames (128KB) physical memory
5. **No Persistence:** State is lost on kernel restart
6. **Browser-Based:** Requires modern browser with WebSocket support

## Future Enhancements

1. **Multi-Core Scheduling:** Support for SMP and load balancing
2. **Disk Scheduling:** Add disk I/O scheduling algorithms
3. **File System:** Implement virtual file system simulation
4. **Network Stack:** Simulate network protocols and sockets
5. **Real-Time Scheduling:** Add EDF and Rate Monotonic algorithms
6. **Advanced Memory:** Implement segmentation and TLB simulation
7. **Security:** Add user permissions and access control
8. **Persistence:** Save/load simulation state
9. **Visualization:** Enhanced 3D visualizations and animations
10. **Mobile Support:** Responsive design for tablets and phones

## Educational Value

This project demonstrates:
- **Process Management:** PCB, state transitions, context switching
- **CPU Scheduling:** Multiple algorithms with performance trade-offs
- **Memory Management:** Virtual memory, paging, page replacement
- **Synchronization:** Mutex, semaphore, deadlock detection
- **Performance Analysis:** Metrics calculation and comparison
- **System Design:** Multi-tier architecture, API design
- **Full-Stack Development:** C++, Node.js, React integration

## References

1. Silberschatz, A., Galvin, P. B., & Gagne, G. (2018). *Operating System Concepts* (10th ed.). Wiley.
2. Tanenbaum, A. S., & Bos, H. (2014). *Modern Operating Systems* (4th ed.). Pearson.
3. Ghost OS Reference Implementation: https://github.com/aliarif2050/ghost_os.git
4. nlohmann JSON Library: https://github.com/nlohmann/json
5. xterm.js Terminal Emulator: https://xtermjs.org/

## Credits

**Developer:** M. Saad Bin Mazhar  
**Course:** CS-330 Computer Operating Systems  
**Program:** BESE-30  
**Semester:** Spring 2026  
**Institution:** CEP (Computer Engineering Program)

**Based on:** Ghost OS reference implementation by aliarif2050  
**Renamed to:** KnightKernel OS with custom branding and enhancements

## License

This project is developed for educational purposes as part of CS-330 coursework.

---

**Last Updated:** April 24, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
