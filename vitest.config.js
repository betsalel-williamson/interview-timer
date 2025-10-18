import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'], // Only include unit test files, exclude e2e tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/', 'tests/', '**/*.config.js', 'dist/'],
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'unit-test-results/junit.xml',
    },
  },
});
