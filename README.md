# Interview Timer

<p align="center">
  A modern web application for managing multiple timers simultaneously, designed specifically for interview practice and time management.
</p>

<p align="center">
    <a href="https://github.com/betsalel-williamson/interview-timer/blob/main/LICENSE">
        <img alt="License" src="https://img.shields.io/github/license/betsalel-williamson/interview-timer?style=flat-square&color=blue">
    </a>
    <a href="https://github.com/betsalel-williamson/interview-timer/actions/workflows/ci-cd.yml">
        <img alt="CI Status" src="https://github.com/betsalel-williamson/interview-timer/actions/workflows/ci-cd.yml/badge.svg">
    </a>
    <img alt="Language" src="https://img.shields.io/github/languages/count/betsalel-williamson/interview-timer?style=flat-square">
    <img alt="Language" src="https://img.shields.io/github/languages/top/betsalel-williamson/interview-timer?style=flat-square">
</p>

## Overview

Interview Timer is a lightweight, responsive web application built with Alpine.js and Vite that allows you to run multiple timers simultaneously. Perfect for interview practice, time management, and any scenario where you need to track multiple time intervals.

### Key Features

- **Multiple Simultaneous Timers**: Run unlimited timers at the same time
- **Interview Practice Ready**: Quick setup buttons for common interview timing scenarios
- **Real-time Editing**: Click on any timer to edit its duration while running
- **Audio & Visual Alerts**: Configurable audio alerts and screen flash notifications
- **Metronome**: Optional metronome for timing practice
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **No Dependencies**: Pure vanilla JavaScript with Alpine.js - no heavy frameworks

## Quick Start

For development setup and detailed technical information, see [DEVELOPMENT.md](./DEVELOPMENT.md).

**Quick installation:**

```bash
git clone https://github.com/betsalel-williamson/interview-timer.git
cd Interview Timer
pnpm install
pnpm dev
```

Navigate to `http://localhost:5173` to see the application.

## Usage

### Basic Timer Operations

1. **Add a Timer**: Use the form at the bottom to set minutes and seconds, then click "Add Timer"
2. **Start/Stop**: Click the toggle switch on any timer to start, pause, or resume it
3. **Edit Duration**: Click on the time display of any timer to edit its duration
4. **Remove Timer**: Click the "Remove" button on any timer

### Quick Setup for Interview Practice

The app includes quick setup buttons for common interview scenarios:

- **30s, 6m, 19m, 20m**: Common interview timing structure
- **1m, 5m, 10m, 15m**: Progressive timing practice
- **2m, 3m, 4m, 5m**: Short interval practice

### Global Controls

- **Start All/Stop All**: The main toggle at the top controls all timers simultaneously
- **Reset All**: Resets all timers to their original duration
- **Auto-start**: Enable to automatically start new timers when added

### Settings

Configure the following options in the footer:

- **Audio Alerts**: Play sound when timers complete
- **Visual Flash**: Flash the screen when timers complete
- **Audio Testing**: Test audio functionality with periodic clicks
- **Metronome**: Enable subtle metronome clicks for timing practice

## Development

For detailed development information including project structure, testing, architecture, and contributing guidelines, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## License

This project is licensed under the [MIT License](./LICENSE).
