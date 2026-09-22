import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      'node:buffer': 'buffer',
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      external: [],
    },
  },
  optimizeDeps: {
    include: ['@reown/appkit', '@reown/appkit-adapter-wagmi', 'wagmi', 'viem'],
  },
})
