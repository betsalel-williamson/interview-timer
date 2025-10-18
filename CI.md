# GitHub Actions CI/CD Pipeline

This directory contains GitHub Actions workflows for automated testing, building, and deployment of the Interview Timer application.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Unit Tests

- Runs Vitest unit tests
- Generates coverage reports
- Uploads coverage to Codecov

#### E2E Tests

- Runs Playwright end-to-end tests
- Tests across multiple browsers (Chrome, Firefox, Safari)
- Tests mobile viewports
- Uploads test reports and artifacts

#### Lint

- Runs Prettier code formatting checks
- Ensures code style consistency

#### Build

- Builds the application using Vite
- Uploads build artifacts
- Only runs after all tests pass

#### Deploy to Vercel

- Deploys to Vercel production environment
- Only runs on pushes to `main` branch
- Requires Vercel secrets to be configured

#### Security Scan

- Runs `pnpm audit` for dependency vulnerabilities
- Checks for moderate and high severity issues

### 2. Pull Request Validation (`pr-validation.yml`)

**Triggers:**

- Pull requests to `main` or `develop` branches

**Features:**

- Quick validation for PRs (linting, unit tests, build)
- Comments on PR with validation results
- Faster feedback loop for contributors

## Required Secrets

To enable Vercel deployment, configure these secrets in your GitHub repository:

### Vercel Secrets

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following repository secrets:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### How to Get Vercel Credentials

1. **VERCEL_TOKEN:**
   - Go to [Vercel Dashboard](https://vercel.com/account/tokens)
   - Create a new token with appropriate permissions

2. **VERCEL_ORG_ID:**
   - Go to your Vercel team settings
   - Copy the Organization ID from the URL or settings

3. **VERCEL_PROJECT_ID:**
   - Go to your project settings in Vercel
   - Copy the Project ID from the settings page

## Environment Variables

The workflows use the following environment variables:

- `NODE_VERSION`: '18' (Node.js version)
- `PNPM_VERSION`: '8' (pnpm version)

## pnpm Configuration

The project includes a `.pnpmrc` file to configure pnpm for CI environments:

- **Build Scripts**: Enabled to allow esbuild and other build tools to run
- **Pre/Post Scripts**: Enabled for proper dependency installation
- **Security**: Only allows specific script types (build, postinstall, preinstall, install)

This configuration ensures that:

- Vite can use esbuild for building
- Playwright can install browser binaries
- All necessary build scripts run in CI environments

## Caching

The workflows implement intelligent caching for:

- pnpm store directory
- Node.js dependencies
- Build artifacts

This significantly reduces build times and improves CI/CD performance.

## Test Coverage

- Unit tests generate coverage reports using Vitest
- Coverage reports are uploaded to Codecov
- E2E tests provide comprehensive browser testing

## Deployment Strategy

- **Pull Requests**: Only validation (no deployment)
- **Develop Branch**: Full CI/CD pipeline (no production deployment)
- **Main Branch**: Full CI/CD pipeline + production deployment to Vercel

## Monitoring and Debugging

### Failed Tests

- Playwright reports are uploaded as artifacts
- Test results include screenshots and videos for failed tests
- Coverage reports help identify untested code

### Build Failures

- Build artifacts are uploaded for debugging
- Detailed logs are available in GitHub Actions

### Deployment Issues

- Vercel deployment logs are available in the workflow
- Check Vercel dashboard for deployment status

## Local Development

To run the same checks locally:

```bash
# Install dependencies
pnpm install

# Run linting
pnpm run lint

# Run unit tests
pnpm run test:unit

# Run unit tests with coverage
pnpm run test:unit:coverage

# Run E2E tests
pnpm run test:e2e

# Build application
pnpm run build
```

## Troubleshooting

### Common Issues

1. **Vercel Deployment Fails**
   - Verify all required secrets are set
   - Check Vercel project configuration
   - Ensure build command works locally

2. **Tests Fail in CI but Pass Locally**
   - Check for environment-specific issues
   - Verify all dependencies are properly installed
   - Review test setup and configuration

3. **Build Fails**
   - Ensure all dependencies are in package.json
   - Check for TypeScript or linting errors
   - Verify build configuration

### Getting Help

- Check GitHub Actions logs for detailed error messages
- Review the workflow files for configuration issues
- Ensure all required secrets and environment variables are set
