import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './components'),
      '@pages': resolve(__dirname, './pages'),
      '@lib': resolve(__dirname, './lib'),
      '@contexts': resolve(__dirname, './contexts'),
      '@hooks': resolve(__dirname, './hooks'),
    },
  },
  build: {
    // Generate sourcemaps for production debugging
    sourcemap: false,
    // Optimize bundle size
    minify: 'esbuild',
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large dependencies
          vendor: ['react', 'react-dom'],
          // Router chunk
          router: ['react-router-dom'],
          // Utils chunk for utility libraries
          utils: ['lucide-react', '@tanstack/react-query'],
        },
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^/.]+$/, '')
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
      },
    },
    // Increase chunk size warning limit for large bundles
    chunkSizeWarningLimit: 600,
    // Optimize asset handling
    assetsInlineLimit: 4096,
    // Target modern browsers for better optimization
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
  },
  server: {
    // Development server configuration
    host: true,
    port: 3000,
    open: false,
    cors: true,
    // Enable HMR
    hmr: {
      overlay: true,
    },
  },
  preview: {
    // Preview server configuration
    host: true,
    port: 3000,
    cors: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      '@tanstack/react-query',
    ],
    exclude: [
      // Exclude any problematic dependencies
    ],
  },
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // CSS configuration
  css: {
    // Enable CSS modules if needed
    modules: {
      localsConvention: 'camelCase',
    },
    // PostCSS configuration
    postcss: './postcss.config.js',
    // Optimize CSS in production
    devSourcemap: true,
  },
  // JSON configuration
  json: {
    namedExports: true,
    stringify: false,
  },
  // Worker configuration
  worker: {
    format: 'es',
  },
  // Environment variables
  envPrefix: ['VITE_', 'REACT_APP_'],
  // Enable esbuild optimizations
  esbuild: {
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Enable legal comments removal
    legalComments: 'none',
  },
});
