# Mini Operating System Kernel Simulator - Requirements Document

## Introduction

The Mini Operating System Kernel Simulator is a user-level application that models core operating system abstractions and services. It simulates process and thread management, CPU scheduling, process synchronization, and memory management with paging. The simulator provides a terminal-like interface for configuration, execution, and performance analysis of various OS policies and workloads. This project applies fundamental OS concepts (PCB, TCB, page tables) to demonstrate scheduling algorithms, synchronization mechanisms, and memory management strategies in a controlled, measurable environment.

## Glossary

- **Kernel**: The core simulator engine that manages processes, threads, scheduling, and memory
- **Process**: An independent execution context with its own memory space and resources
- **Thread**: A lightweight execution unit within a process that shares memory with other threads in the same process
- **PCB (Process Control Block)**: Data structure containing process state, registers, memory information, and scheduling data
- **TCB (Thread Control Block)**: Data structure containing thread state, registers, and synchronization information
- **CPU Scheduler**: Component that selects which process/thread runs next based on scheduling algorithms
- **Scheduling Algorithm**: Policy determining process/thread execution order (FCFS, Round Robin, Priority, etc.)
- **Context Switch**: Operation of saving one process/thread state and loading another
- **Synchronization Primitive**: Mechanism for coordinating access to shared resources (mutex, semaphore)
- **Critical Section**: Code segment accessing shared resources that must execute atomically
- **Memory Manager**: Component managing virtual memory, paging, and page replacement
- **Page**: Fixed-size unit of virtual memory (typically 4KB)
- **Page Table**: Data structure mapping virtual addresses to physical addresses
- **Page Replacement Policy**: Algorithm determining which page to evict when memory is full (FIFO, LRU, etc.)
- **Workload**: Set of processes with defined characteristics (CPU-bound, I/O-bound, mixed)
- **Performance Metric**: Quantitative measure of system behavior (waiting time, turnaround time, CPU utilization)
- **Terminal Interface**: User-facing component providing command-line interaction with the simulator
- **Configuration**: Set of policies and parameters defining simulator behavior

## Requirements

### Requirement 1: Process Management

**User Story:** As a simulator user, I want to create and manage processes with realistic lifecycle states, so that I can simulate multi-process execution environments.

#### Acceptance Criteria

1. THE Kernel SHALL maintain a Process_Control_Block (PCB) for each process containing: process ID, state, priority, memory allocation, file descriptors, and scheduling information
2. WHEN a process is created, THE Kernel SHALL initialize its PCB with default values and assign a unique process ID
3. THE Kernel SHALL support process states: New, Ready, Running, Waiting, and Terminated
4. WHEN a process transitions between states, THE Kernel SHALL update the PCB state field and move the process to the appropriate queue (Ready_Queue, Waiting_Queue, or Terminated_List)
5. WHEN a process terminates, THE Kernel SHALL deallocate its resources and mark it as Terminated
6. THE Kernel SHALL maintain separate queues for Ready, Waiting, and Terminated processes
7. WHEN a process is in the Waiting state, THE Kernel SHALL track the reason for waiting (I/O, synchronization, timer)

### Requirement 2: Thread Management

**User Story:** As a simulator user, I want to create and manage threads within processes, so that I can simulate multi-threaded execution and shared memory scenarios.

#### Acceptance Criteria

1. THE Kernel SHALL maintain a Thread_Control_Block (TCB) for each thread containing: thread ID, state, process ID, registers, and synchronization information
2. WHEN a thread is created within a process, THE Kernel SHALL initialize its TCB and associate it with the parent process
3. THE Kernel SHALL support thread states: New, Ready, Running, Waiting, and Terminated
4. WHEN a thread is created, THE Kernel SHALL assign a unique thread ID within its process
5. WHEN a thread terminates, THE Kernel SHALL deallocate its resources and mark it as Terminated
6. THE Kernel SHALL allow multiple threads to exist within a single process and share the process's memory space
7. WHEN a process terminates, THE Kernel SHALL terminate all threads belonging to that process

### Requirement 3: CPU Scheduling - FCFS Algorithm

**User Story:** As a simulator user, I want to simulate First-Come-First-Served scheduling, so that I can analyze the baseline scheduling behavior and measure its performance characteristics.

#### Acceptance Criteria

1. WHEN the FCFS scheduling algorithm is selected, THE CPU_Scheduler SHALL execute processes in the order they arrive in the Ready_Queue
2. WHEN a process is running under FCFS, THE CPU_Scheduler SHALL not preempt it until it voluntarily yields or blocks
3. THE CPU_Scheduler SHALL measure and record waiting time for each process (time from arrival to first execution)
4. THE CPU_Scheduler SHALL measure and record turnaround time for each process (time from arrival to completion)
5. WHEN all processes complete, THE Performance_Analyzer SHALL calculate average waiting time and average turnaround time

### Requirement 4: CPU Scheduling - Round Robin Algorithm

**User Story:** As a simulator user, I want to simulate Round Robin scheduling with configurable time quantum, so that I can analyze preemptive scheduling and fairness.

#### Acceptance Criteria

1. WHEN the Round_Robin scheduling algorithm is selected, THE CPU_Scheduler SHALL allocate a configurable time quantum to each process
2. WHEN a process's time quantum expires, THE CPU_Scheduler SHALL preempt it and move it to the back of the Ready_Queue
3. WHEN a process blocks before its time quantum expires, THE CPU_Scheduler SHALL not penalize it and allow it to use the full quantum on next execution
4. THE CPU_Scheduler SHALL measure context switches and record the count
5. WHEN all processes complete, THE Performance_Analyzer SHALL calculate average waiting time, average turnaround time, and total context switches

### Requirement 5: CPU Scheduling - Priority-Based Algorithm

**User Story:** As a simulator user, I want to simulate priority-based scheduling with optional aging, so that I can analyze priority-driven execution and starvation prevention.

#### Acceptance Criteria

1. WHEN the Priority_Scheduler is selected, THE CPU_Scheduler SHALL execute the highest-priority process in the Ready_Queue
2. WHEN multiple processes have the same priority, THE CPU_Scheduler SHALL use FCFS ordering among them
3. WHERE aging is enabled, THE CPU_Scheduler SHALL increment process priority after a configurable wait time to prevent starvation
4. WHEN a higher-priority process arrives while a lower-priority process is running, THE CPU_Scheduler SHALL preempt the running process
5. THE CPU_Scheduler SHALL measure priority inversions (if applicable) and record them

### Requirement 6: Process Synchronization - Mutex

**User Story:** As a simulator user, I want to simulate mutex-based synchronization, so that I can model mutual exclusion and analyze race condition prevention.

#### Acceptance Criteria

1. THE Synchronization_Manager SHALL provide mutex primitives with lock() and unlock() operations
2. WHEN a thread calls lock() on an available mutex, THE Synchronization_Manager SHALL grant the lock immediately
3. WHEN a thread calls lock() on a held mutex, THE Synchronization_Manager SHALL block the thread and add it to the mutex's waiting queue
4. WHEN a thread calls unlock(), THE Synchronization_Manager SHALL release the mutex and wake the first thread in the waiting queue
5. WHEN a thread holding a mutex is preempted, THE Synchronization_Manager SHALL maintain the lock ownership
6. THE Synchronization_Manager SHALL detect and report deadlock conditions (if applicable)

### Requirement 7: Process Synchronization - Semaphore

**User Story:** As a simulator user, I want to simulate semaphore-based synchronization, so that I can model resource counting and producer-consumer patterns.

#### Acceptance Criteria

1. THE Synchronization_Manager SHALL provide semaphore primitives with wait() and signal() operations
2. WHEN a thread calls wait() on a semaphore with count > 0, THE Synchronization_Manager SHALL decrement the count
3. WHEN a thread calls wait() on a semaphore with count = 0, THE Synchronization_Manager SHALL block the thread and add it to the semaphore's waiting queue
4. WHEN a thread calls signal(), THE Synchronization_Manager SHALL increment the count and wake one blocked thread if any exist
5. THE Synchronization_Manager SHALL support binary semaphores (count 0 or 1) and counting semaphores (count >= 0)
6. WHEN multiple threads are waiting on a semaphore, THE Synchronization_Manager SHALL wake them in FIFO order

### Requirement 8: Memory Management - Virtual Memory and Paging

**User Story:** As a simulator user, I want to simulate virtual memory with paging, so that I can analyze memory management and page replacement policies.

#### Acceptance Criteria

1. THE Memory_Manager SHALL allocate virtual address space to each process
2. THE Memory_Manager SHALL maintain a page table for each process mapping virtual pages to physical frames
3. WHEN a process accesses a virtual address, THE Memory_Manager SHALL translate it to a physical address using the page table
4. WHEN a virtual page is not in physical memory, THE Memory_Manager SHALL generate a page fault
5. WHEN a page fault occurs, THE Memory_Manager SHALL load the page from simulated disk into an available physical frame
6. WHEN no physical frames are available, THE Memory_Manager SHALL invoke the page replacement policy to select a victim page
7. THE Memory_Manager SHALL track page fault count and record it for performance analysis
8. THE Memory_Manager SHALL support configurable physical memory size and page size

### Requirement 9: Memory Management - FIFO Page Replacement

**User Story:** As a simulator user, I want to simulate FIFO page replacement, so that I can analyze simple page replacement behavior.

#### Acceptance Criteria

1. WHEN the FIFO page replacement policy is selected, THE Memory_Manager SHALL maintain a queue of pages in physical memory
2. WHEN a page replacement is needed, THE Memory_Manager SHALL evict the oldest page (first page loaded)
3. WHEN a page is loaded into memory, THE Memory_Manager SHALL add it to the end of the FIFO queue
4. THE Memory_Manager SHALL record which page was evicted and when

### Requirement 10: Memory Management - LRU Page Replacement

**User Story:** As a simulator user, I want to simulate LRU (Least Recently Used) page replacement, so that I can analyze locality-aware page replacement.

#### Acceptance Criteria

1. WHEN the LRU page replacement policy is selected, THE Memory_Manager SHALL track the recency of page accesses
2. WHEN a page replacement is needed, THE Memory_Manager SHALL evict the least recently used page
3. WHEN a page is accessed, THE Memory_Manager SHALL update its recency timestamp
4. THE Memory_Manager SHALL record which page was evicted and when

### Requirement 11: Configurable Policies and Parameters

**User Story:** As a simulator user, I want to configure scheduling algorithms, page replacement policies, and system parameters, so that I can run different experimental scenarios.

#### Acceptance Criteria

1. THE Configuration_Manager SHALL allow users to select scheduling algorithm (FCFS, Round_Robin, Priority)
2. THE Configuration_Manager SHALL allow users to select page replacement policy (FIFO, LRU)
3. THE Configuration_Manager SHALL allow users to configure time quantum for Round_Robin scheduling
4. THE Configuration_Manager SHALL allow users to configure physical memory size and page size
5. THE Configuration_Manager SHALL allow users to configure process priority levels
6. THE Configuration_Manager SHALL allow users to enable/disable aging for priority scheduling
7. THE Configuration_Manager SHALL validate all configuration parameters before simulation starts
8. WHEN configuration is invalid, THE Configuration_Manager SHALL report specific errors to the user

### Requirement 12: Workload Definition and Simulation

**User Story:** As a simulator user, I want to define and simulate realistic workloads, so that I can test the simulator with different process characteristics.

#### Acceptance Criteria

1. THE Workload_Manager SHALL support CPU-bound processes (minimal I/O, long execution)
2. THE Workload_Manager SHALL support I/O-bound processes (frequent I/O, short CPU bursts)
3. THE Workload_Manager SHALL support mixed workloads combining CPU-bound and I/O-bound processes
4. WHEN a workload is defined, THE Workload_Manager SHALL specify arrival time, CPU burst time, I/O burst time, and priority for each process
5. THE Workload_Manager SHALL allow users to load predefined workloads or create custom workloads
6. WHEN a process performs I/O, THE Kernel SHALL move it to the Waiting state and simulate I/O completion after a configurable duration
7. WHEN I/O completes, THE Kernel SHALL move the process back to the Ready state

### Requirement 13: Performance Metrics and Analysis

**User Story:** As a simulator user, I want to measure and analyze performance metrics, so that I can compare different scheduling and memory policies.

#### Acceptance Criteria

1. THE Performance_Analyzer SHALL calculate average waiting time across all processes
2. THE Performance_Analyzer SHALL calculate average turnaround time across all processes
3. THE Performance_Analyzer SHALL calculate CPU utilization (percentage of time CPU is executing processes)
4. THE Performance_Analyzer SHALL calculate context switch count and frequency
5. THE Performance_Analyzer SHALL calculate page fault count and page fault rate
6. THE Performance_Analyzer SHALL calculate average page replacement count
7. WHEN simulation completes, THE Performance_Analyzer SHALL generate a performance report with all metrics
8. THE Performance_Analyzer SHALL support comparison of metrics across multiple simulation runs

### Requirement 14: Terminal-Like User Interface

**User Story:** As a simulator user, I want to interact with the simulator through a terminal-like interface, so that I can configure, execute, and monitor simulations.

#### Acceptance Criteria

1. THE Terminal_Interface SHALL display a command prompt for user input
2. THE Terminal_Interface SHALL support commands for configuration (set scheduling algorithm, set page replacement policy, etc.)
3. THE Terminal_Interface SHALL support commands for workload management (load workload, create process, etc.)
4. THE Terminal_Interface SHALL support commands for simulation control (start, pause, resume, stop)
5. THE Terminal_Interface SHALL display real-time simulation state (running processes, ready queue, waiting queue)
6. THE Terminal_Interface SHALL display performance metrics during and after simulation
7. THE Terminal_Interface SHALL support command history and auto-completion
8. THE Terminal_Interface SHALL provide help documentation for all commands

### Requirement 15: Simulation Execution and State Tracking

**User Story:** As a simulator user, I want to execute simulations with accurate state tracking, so that I can observe process lifecycle and system behavior.

#### Acceptance Criteria

1. WHEN simulation starts, THE Kernel SHALL initialize all components (scheduler, memory manager, synchronization manager)
2. THE Kernel SHALL execute in discrete time steps (clock ticks)
3. WHEN a clock tick occurs, THE CPU_Scheduler SHALL select the next process/thread to run
4. WHEN a process/thread runs, THE Kernel SHALL execute its next instruction (simulated)
5. WHEN a process/thread blocks or yields, THE Kernel SHALL perform a context switch
6. THE Kernel SHALL maintain accurate timestamps for all events (process creation, state transitions, I/O completion)
7. WHEN simulation completes, THE Kernel SHALL record final state of all processes and threads

### Requirement 16: Race Condition and Deadlock Handling

**User Story:** As a simulator user, I want the simulator to handle race conditions and detect deadlocks, so that I can study synchronization issues.

#### Acceptance Criteria

1. WHEN multiple threads access shared memory without synchronization, THE Synchronization_Manager SHALL detect potential race conditions
2. WHEN a race condition is detected, THE Synchronization_Manager SHALL log the event with thread IDs and memory address
3. WHEN circular wait conditions exist among threads waiting for resources, THE Deadlock_Detector SHALL identify potential deadlocks
4. WHEN a deadlock is detected, THE Deadlock_Detector SHALL report the involved threads and resources
5. WHERE deadlock recovery is enabled, THE Kernel SHALL attempt recovery (e.g., abort one thread)

### Requirement 17: Simulation Results Export

**User Story:** As a simulator user, I want to save simulation results to a file, so that I can analyze and compare experiments.

#### Acceptance Criteria

1. THE Simulator SHALL export simulation results to a file (JSON or CSV format)
2. THE Simulator SHALL include all performance metrics in the exported file
3. THE Simulator SHALL include configuration parameters used in the simulation
4. THE Simulator SHALL include timeline of events (process creation, state transitions, page faults)
5. WHEN results are exported, THE Simulator SHALL include timestamp and simulation identifier

### Requirement 18: Backend Architecture (C++)

**User Story:** As a developer, I want the simulator backend to be implemented in C++, so that I can achieve high performance and efficient resource management.

#### Acceptance Criteria

1. THE Backend SHALL be implemented in C++ with standard library components
2. THE Backend SHALL use efficient data structures (queues, priority queues, hash tables) for process and thread management
3. THE Backend SHALL implement the Kernel as a core class managing all subsystems
4. THE Backend SHALL provide a clean API for the frontend to interact with the simulator
5. THE Backend SHALL handle memory allocation and deallocation efficiently
6. THE Backend SHALL compile without warnings on standard C++ compilers

### Requirement 19: Frontend Architecture (TypeScript)

**User Story:** As a user, I want a responsive terminal-like interface, so that I can easily interact with the simulator.

#### Acceptance Criteria

1. THE Frontend SHALL be implemented in TypeScript with a terminal-like UI framework
2. THE Frontend SHALL communicate with the C++ backend via a defined API (REST, IPC, or similar)
3. THE Frontend SHALL display real-time updates of simulator state
4. THE Frontend SHALL provide input validation and user-friendly error messages
5. THE Frontend SHALL support responsive layout for different terminal sizes
6. THE Frontend SHALL render efficiently without lag during simulation

### Requirement 20: User-Level Application Execution

**User Story:** As a simulator user, I want to run the simulator as a normal user-level application, so that I can use it without special privileges.

#### Acceptance Criteria

1. THE Simulator SHALL run as a user-level application without requiring root or administrator privileges
2. THE Simulator SHALL not directly access hardware or kernel resources
3. THE Simulator SHALL simulate all OS abstractions (scheduling, memory management, synchronization) in user space
4. THE Simulator SHALL manage its own virtual time and clock ticks
5. THE Simulator SHALL not interfere with the host operating system

### Requirement 21: In-Terminal Help System

**User Story:** As a simulator user, I want in-terminal help for commands, so that I can understand how to use the simulator effectively.

#### Acceptance Criteria

1. THE Terminal_Interface SHALL provide a help command that displays available commands and their usage
2. THE Terminal_Interface SHALL display command syntax and examples when help is requested for a specific command
3. THE Terminal_Interface SHALL provide brief descriptions of scheduling algorithms and page replacement policies
4. THE Terminal_Interface SHALL show examples of workload configuration syntax
5. THE Help_System SHALL be accessible via help command in the terminal interface

### Requirement 22: Error Handling and Recovery

**User Story:** As a simulator user, I want robust error handling, so that I can recover from errors and continue using the simulator.

#### Acceptance Criteria

1. WHEN an invalid command is entered, THE Terminal_Interface SHALL display an error message and prompt for valid input
2. WHEN a configuration error occurs, THE Configuration_Manager SHALL report the specific error and allow correction
3. WHEN a simulation encounters an error, THE Kernel SHALL log the error and attempt recovery if possible
4. WHEN memory allocation fails, THE Memory_Manager SHALL report the failure and handle gracefully
5. WHEN a fatal error occurs, THE Simulator SHALL save current state and allow user to review the error

### Requirement 23: Performance and Scalability

**User Story:** As a simulator user, I want the simulator to handle large workloads efficiently, so that I can simulate realistic scenarios.

#### Acceptance Criteria

1. THE Kernel SHALL support at least 100 concurrent processes without significant performance degradation
2. THE Kernel SHALL support at least 500 threads across all processes
3. THE Memory_Manager SHALL support at least 1GB of simulated virtual memory
4. WHEN simulating 100 processes, THE Kernel SHALL complete simulation in reasonable time (< 10 seconds for typical workload)
5. THE Simulator SHALL not consume excessive host system resources (memory, CPU)

### Requirement 24: Testing and Validation

**User Story:** As a developer, I want comprehensive testing capabilities, so that I can validate simulator correctness.

#### Acceptance Criteria

1. THE Simulator SHALL include unit tests for core components (scheduler, memory manager, synchronization manager)
2. THE Simulator SHALL include integration tests for complete workflows (process creation to termination)
3. THE Simulator SHALL include performance benchmarks for different scheduling algorithms
4. WHEN tests are run, THE Test_Framework SHALL report pass/fail status and coverage metrics
5. THE Simulator SHALL validate that performance metrics are calculated correctly

### Requirement 25: Project Documentation (README)

**User Story:** As a user or developer, I want a comprehensive README file, so that I can understand the project, build it, and use it effectively.

#### Acceptance Criteria

1. THE Project SHALL include a README.md file at the project root
2. THE README SHALL include project overview and objectives
3. THE README SHALL include build and installation instructions for both backend (C++) and frontend (TypeScript)
4. THE README SHALL include usage instructions with command examples
5. THE README SHALL include architecture overview with component descriptions
6. THE README SHALL include examples of running different scheduling algorithms and workloads
7. THE README SHALL include troubleshooting section for common issues

