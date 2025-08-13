import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting MakrCave development environment...');

// Start mock API server
console.log('📡 Starting mock API server on port 8000...');
const apiServer = spawn('node', ['mock-api-server.js'], {
  cwd: __dirname,
  stdio: ['inherit', 'pipe', 'pipe']
});

apiServer.stdout.on('data', (data) => {
  console.log(`[API] ${data}`);
});

apiServer.stderr.on('data', (data) => {
  console.error(`[API ERROR] ${data}`);
});

// Wait a moment for API server to start
setTimeout(() => {
  console.log('⚛️  Starting Vite dev server on port 3001...');
  
  // Start Vite dev server
  const viteServer = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  viteServer.stdout.on('data', (data) => {
    console.log(`[VITE] ${data}`);
  });

  viteServer.stderr.on('data', (data) => {
    console.error(`[VITE ERROR] ${data}`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    apiServer.kill();
    viteServer.kill();
    process.exit(0);
  });

}, 2000);

apiServer.on('error', (err) => {
  console.error('Failed to start API server:', err);
});
