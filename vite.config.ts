import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  server: {
    port: 3000, // or any other port you prefer
  },
  preview: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
  base: '/', // This ensures assets are loaded correctly
})