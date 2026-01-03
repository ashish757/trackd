import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      tailwindcss(),
      // Bundle analyzer - run 'npm run analyze' to generate stats.html
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }) as Plugin,
  ],
  server: {
    host: '0.0.0.0', // Required for Docker
    port: 5173,
    watch: {
      usePolling: true, // Required for Docker on some systems
    },
    hmr: {
      clientPort: 5173, // Hot Module Replacement
    }
  },
  build: {
    // Enable code splitting and chunk optimization
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // Vendor chunks - separate large libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'socket-vendor': ['socket.io-client'],
          'ui-vendor': ['lucide-react', 'clsx'],
        },
      },
    },
    // Increase chunk size warning limit (we're intentionally splitting)
    chunkSizeWarningLimit: 1000,
  },
})
