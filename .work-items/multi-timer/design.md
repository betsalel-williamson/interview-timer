# Multi-Timer Technical Design

## Objective

Design and implement a simple static web application that allows users to create multiple timers, start them simultaneously, and receive audio/visual alerts when timers complete.

## Technical Design

This design implements a client-side only application using Alpine.js for reactive state management, HTML, CSS, and JavaScript. Alpine.js provides simple, declarative reactivity without the complexity of larger frameworks, making it perfect for this straightforward timer application.

### Architecture Reference

This design adheres to the system architecture defined in `docs/architecture/system-overview.md`, implementing Alpine.js for state management and component organization.

### Core Components

#### 1. Main App Component (Alpine.js x-data)

- **State Management**: Reactive data for timers array, form inputs, and global state
- **Timer Creation**: Methods to add, validate, and manage timers
- **Global Controls**: Start all, reset all, and timer synchronization
- **Form Handling**: Input validation and error display

#### 2. Timer Components (Alpine.js x-data)

- **Individual Timer Display**: Each timer as a separate Alpine component
- **Countdown Updates**: Reactive time display and status management
- **Status Management**: Visual indicators for ready/running/completed states

#### 3. Audio Manager (JavaScript)

- **Sound Generation**: Creates alert sounds using Web Audio API
- **Alert Playback**: Manages 2-second alert duration
- **Audio Context**: Handles browser audio policy requirements

#### 4. Visual Interface (HTML/CSS with Alpine.js directives)

- **Timer Setup Form**: Input fields with Alpine.js form binding
- **Timer Display Grid**: Responsive layout with Alpine.js loops
- **Control Buttons**: Alpine.js event handlers for user interactions

## Key Changes

### 3.1. API Contracts

No external APIs required. Alpine.js component interfaces:

```javascript
// Main App Component Interface
interface MultiTimerApp {
  timers: Timer[];
  isRunning: boolean;
  nextId: number;
  minutes: string;
  seconds: string;
  errorMessage: string;

  addTimer(): void;
  startAll(): void;
  resetAll(): void;
  removeTimer(id: string): void;
  formatTime(seconds: number): string;
  validateInput(): boolean;
}

// Individual Timer Component Interface
interface TimerComponent {
  id: string;
  duration: number;
  remaining: number;
  status: 'ready' | 'running' | 'completed';

  getStatusClass(): string;
  getDisplayTime(): string;
}
```

### 3.2. Data Models

- **Alpine.js Reactive Data**: Reactive state management for timers and form inputs
- **Timer Model**: Core timer data structure with unique identification
- **Component State**: Individual timer component state management
- **Input Validation**: Alpine.js form validation and error handling

### 3.3. Component Responsibilities

#### HTML Structure with Alpine.js Directives

- **Form Section**: Timer input controls with `x-model` binding and validation
- **Display Section**: Timer grid with `x-for` loops and `x-data` components
- **Control Section**: Global buttons with `x-on:click` event handlers

#### CSS Styling

- **Responsive Grid**: CSS Grid layout for timer display
- **Animation Classes**: Flash animations triggered by Alpine.js state changes
- **Visual States**: Different styles for ready/running/completed timers
- **Alpine.js Classes**: Dynamic class binding with `x-bind:class`

#### JavaScript Modules

- **AudioManager**: Web Audio API integration for alerts (standalone module)
- **Alpine.js Components**: Main app and timer components with reactive data
- **Utility Functions**: Time formatting and validation helpers

## Alternatives Considered

### Framework vs Vanilla JavaScript

- **Chosen**: Alpine.js for simple reactive state management without framework complexity
- **Alternative**: Vanilla JavaScript - Rejected due to manual DOM manipulation complexity
- **Alternative**: React/Vue.js - Rejected due to added complexity for simple use case

### Audio Implementation

- **Chosen**: Web Audio API for programmatic sound generation
- **Alternative**: HTML5 Audio with pre-recorded files - Rejected due to file size and loading requirements

### State Management

- **Chosen**: Alpine.js reactive data for automatic DOM updates
- **Alternative**: Manual DOM manipulation - Rejected due to complexity and error-prone nature
- **Alternative**: Redux/state management library - Rejected as overkill for simple state

## Out of Scope

- Server-side components or APIs
- Data persistence or user accounts
- Mobile-specific optimizations
- Advanced timer features (pauses, intervals, custom sounds)
- Timer sharing or collaboration
- Progressive Web App features
- Offline functionality beyond basic static file serving
