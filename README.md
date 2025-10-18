# Multi-Timer Web App

A simple static web application that allows users to create and manage multiple timers simultaneously for interview practice. Perfect for practicing structured coding interviews with timed phases.

## Features

- **Multiple Timers**: Create and manage multiple timers with different durations
- **Synchronized Start**: Start all timers simultaneously with one click
- **Real-time Countdown**: See remaining time count down for each timer
- **Audio Alerts**: 2-second alert sound when timers complete
- **Visual Alerts**: Webpage flashes when timers complete
- **Easy Setup**: Simple minutes/seconds input for each timer
- **Modern Build**: Vite for fast development and optimized production builds
- **Alpine.js Reactivity**: Clean state management without framework complexity

## Quick Start

### Prerequisites

- Node.js (version 18 or higher)
- npm or pnpm package manager

### Installation

1. Clone or download this repository
2. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. Open your browser to `https://localhost:3000`

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Start development server (alias for dev)
npm start
```

## Usage

### Adding Timers

1. Enter minutes and seconds in the input fields
2. Click "Add Timer" to add it to your timer list
3. Repeat for multiple timers

### Running Timers

1. Click "Start All" to begin all timers simultaneously
2. Watch the countdown for each timer
3. When a timer reaches zero:
   - You'll hear a 2-second alert sound
   - The webpage will flash to get your attention

### Resetting

- Click "Reset All" to clear all timers and start over

## Example Use Case

Set up these specific timers for interview practice:

- 30 seconds (Problem Understanding)
- 6 minutes (Initial Coding)
- 19 minutes (Testing & Debugging)
- 20 minutes (Optimization & Edge Cases)

All timers will start together and alert you as each phase completes, helping you practice realistic interview timing.

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

**Note**: HTTPS is required for Web Audio API functionality. The development server automatically provides HTTPS support.

## Development

### Project Structure

```
multi-timer/
├── package.json        # npm/pnpm configuration with Vite
├── vite.config.js      # Vite configuration
├── vitest.config.js    # Vitest unit testing configuration
├── playwright.config.js # Playwright E2E testing configuration
├── vercel.json         # Vercel deployment configuration
├── index.html          # Main application file with Alpine.js
├── src/                # Source files
│   ├── main.js         # Application entry point
│   ├── style.css       # Styling and animations
│   └── audio.js        # Audio manager utilities
├── tests/              # Test files
│   ├── *.test.js       # Unit tests (Vitest)
│   └── *.spec.js       # E2E tests (Playwright)
├── dist/               # Production build output
├── .github/            # GitHub Actions workflows
│   └── workflows/      # CI/CD pipeline configuration
├── README.md           # This file
└── docs/               # Documentation
    └── architecture/   # Architecture documents
```

### Development Commands

- `npm run dev` - Start Vite development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally

### Testing

- `npm run test:unit` - Run unit tests with Vitest
- `npm run test:unit:coverage` - Run unit tests with coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run test` - Run all tests (unit + E2E)

### Code Quality

- `npm run lint` - Check code formatting with Prettier
- `npm run lint:fix` - Fix code formatting issues

## CI/CD Pipeline

This project includes automated CI/CD pipelines using GitHub Actions:

### Automated Testing

- **Unit Tests**: Vitest with coverage reporting
- **E2E Tests**: Playwright across multiple browsers and devices
- **Linting**: Prettier code formatting checks
- **Security**: Dependency vulnerability scanning

### Automated Deployment

- **Pull Requests**: Validation only (no deployment)
- **Main Branch**: Full CI/CD pipeline with automatic deployment to Vercel

### Pipeline Features

- Intelligent caching for faster builds
- Parallel job execution
- Comprehensive test reporting
- Security vulnerability scanning
- Automated Vercel deployment

For detailed information about the CI/CD setup, see [`.github/README.md`](.github/README.md).

## Deployment

This is a static web application that can be deployed to any static hosting service:

- **Vercel** (automated via CI/CD)
- GitHub Pages
- Netlify
- AWS S3 + CloudFront
- Any web server serving static files

### Production Build

1. Build the application:

   ```bash
   npm run build
   ```

2. Upload the contents of the `dist/` folder to your hosting service.

The Vite build process optimizes and bundles all assets for production deployment.

### Vercel Deployment

The project is configured for automatic deployment to Vercel:

1. **Automatic**: Pushes to `main` branch trigger automatic deployment
2. **Manual**: Use the Vercel CLI or dashboard for manual deployments
3. **Configuration**: See `vercel.json` for deployment settings

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions, please open an issue on the GitHub repository.
