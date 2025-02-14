import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Set chunk size warning limit (in KB)
    chunkSizeWarningLimit: 1000, // This will suppress warnings for chunks > 1MB

    // Configure manual chunks for better chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Example of splitting libraries into separate chunks
          vendor: ['react', 'react-dom', 'react-router-dom', 'react-bootstrap'],
        },
      },
    },
  },
})
