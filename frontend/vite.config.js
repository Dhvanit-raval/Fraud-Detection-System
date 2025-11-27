import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets'
  },
  server: {
    port: 5173,
    host: true
  },
  // Add this for proper asset paths
  base: './'
})