import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for deployment (empty for root)
  base: '',

  // Development server configuration
  server: {
    host: true, // Allow external connections
    port: 3000, // Default port
    open: true, // Auto-open browser
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          alpine: ['alpinejs'],
        },
      },
    },
  },

  // Preview server configuration
  preview: {
    host: true,
    port: 4173,
  },

  // CSS configuration
  css: {
    devSourcemap: true,
  },

  // Test configuration (Vitest)
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'], // Only include unit test files, exclude e2e tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      exclude: ['node_modules/', 'tests/', '**/*.config.js', 'dist/'],
      reportsDirectory: './coverage',
    },
    reporters: [
      'default',
      ['junit', { outputFile: 'unit-test-results/junit.xml' }],
    ],
  },
});
