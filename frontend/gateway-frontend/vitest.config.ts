import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'coverage/',
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './components'),
      '@/lib': resolve(__dirname, './lib'),
      '@/pages': resolve(__dirname, './pages'),
      '@/contexts': resolve(__dirname, './contexts'),
      '@/hooks': resolve(__dirname, './hooks'),
    }
  }
})
