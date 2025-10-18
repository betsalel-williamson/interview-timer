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
});
