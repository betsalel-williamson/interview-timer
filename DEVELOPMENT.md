# Development Guide

This document contains all development-related information for the Interview Timer project.

## Prerequisites

- Node.js v22.0.0 or higher (specified in `.nvmrc`)
- pnpm (recommended) or npm
- NVM (Node Version Manager) for Node.js version management

## Getting Started

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/betsalel-williamson/interview-timer.git
   cd Interview Timer
   ```

2. **Set up Node.js version:**

   If using NVM (recommended):

   ```bash
   nvm use
   ```

   This will automatically use the Node.js version specified in `.nvmrc` (v22).

3. **Install dependencies:**

   ```bash
   pnpm install
   # or
   npm install
   ```

4. **Start the development server:**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173` to see the application.

### Building for Production

```bash
pnpm build
# or
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Project Structure

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

## Testing

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

## Code Quality

**Lint code:**

```bash
pnpm lint
```

**Fix linting issues:**

```bash
pnpm lint:fix
```

## Analytics Integration

The application includes [Vercel Analytics](https://vercel.com/analytics) for web analytics tracking:

- **Automatic Integration**: Analytics are automatically enabled when deployed to Vercel
- **No Configuration Required**: The `@vercel/analytics` package is imported and initialized in `src/main.js`
- **Privacy-Focused**: Vercel Analytics provides privacy-focused analytics without cookies
- **Development**: Analytics are disabled in development mode automatically

### Implementation Details

The analytics integration is handled in `src/main.js`:

```javascript
import { inject } from '@vercel/analytics';

// ... application code ...

// Initialize analytics (disabled in development)
inject();
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

## Acknowledgments

- Built with [Alpine.js](https://alpinejs.dev/) for reactive UI
- Powered by [Vite](https://vitejs.dev/) for fast development
- Tested with [Vitest](https://vitest.dev/) and [Playwright](https://playwright.dev/)
