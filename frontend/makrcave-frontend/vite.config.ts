import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@makrx/ui": path.resolve(__dirname, "../../packages/ui"),
      "@makrx/types": path.resolve(__dirname, "../../packages/types"),
      "@makrx/utils": path.resolve(__dirname, "../../packages/utils"),
    },
  },
  server: {
    port: 3001,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
