import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
      react(),
      tailwindcss()
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
  }
})
