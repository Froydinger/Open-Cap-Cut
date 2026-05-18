import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Open-Cap-Cut/',
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
})
