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

## Prerequisites

- Node.js v18.0.0 or higher
- pnpm (recommended) or npm

## Getting Started

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/betsalel-williamson/interview-timer.git
   cd Interview Timer
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start the development server:**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to see the application.

### Building for Production

```bash
pnpm build
# or
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

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

### Project Structure

```
Interview Timer/
├── src/
│   ├── main.js          # Main application logic
│   ├── audio.js         # Audio management and metronome
│   └── style.css        # Application styles
├── tests/               # Test files
├── docs/                # Documentation
└── dist/                # Built application
```

### Testing

The project includes comprehensive testing with Vitest for unit tests and Playwright for end-to-end tests.

**Run all tests:**

```bash
pnpm test
```

**Run unit tests only:**

```bash
pnpm test:unit
```

**Run end-to-end tests:**

```bash
pnpm test:e2e
```

**Run tests with coverage:**

```bash
pnpm test:unit:coverage
```

### Code Quality

**Lint code:**

```bash
pnpm lint
```

**Fix linting issues:**

```bash
pnpm lint:fix
```

## Architecture

Interview Timer is built with a simple, maintainable architecture:

- **Alpine.js**: Reactive frontend framework for state management
- **Vite**: Fast build tool and development server
- **Web Audio API**: For audio alerts and metronome functionality
- **CSS Grid/Flexbox**: Responsive layout system
- **Test-Driven Development**: Comprehensive test coverage

### Key Components

- **Timer Factory**: Creates timer objects with state management
- **Audio Manager**: Handles all audio functionality including metronome
- **Alpine.js Component**: Main application state and UI logic

## Browser Support

Interview Timer works in all modern browsers that support:

- ES6 modules
- Web Audio API
- CSS Grid and Flexbox

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`pnpm test`)
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is licensed under the [MIT License](./LICENSE).

## Acknowledgments

- Built with [Alpine.js](https://alpinejs.dev/) for reactive UI
- Powered by [Vite](https://vitejs.dev/) for fast development
- Tested with [Vitest](https://vitest.dev/) and [Playwright](https://playwright.dev/)
