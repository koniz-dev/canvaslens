#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Starting CanvasLens development server...\n');

// Start TypeScript compiler in watch mode
const tsc = spawn('tsc', ['--watch'], {
  stdio: ['inherit', 'pipe', 'pipe']
});

// Start development server
const server = spawn('node', ['dev/server.js'], {
  stdio: ['inherit', 'pipe', 'pipe']
});

// Handle TypeScript output
tsc.stdout.on('data', (data) => {
  console.log(`[TSC] ${data.toString().trim()}`);
});

tsc.stderr.on('data', (data) => {
  console.error(`[TSC ERROR] ${data.toString().trim()}`);
});

// Handle server output
server.stdout.on('data', (data) => {
  console.log(`[SERVER] ${data.toString().trim()}`);
});

server.stderr.on('data', (data) => {
  console.error(`[SERVER ERROR] ${data.toString().trim()}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  tsc.kill();
  server.kill();
  process.exit(0);
});

// Handle process errors
tsc.on('error', (err) => {
  console.error('❌ TypeScript compiler error:', err);
  process.exit(1);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

console.log('✅ Development server started!');
console.log('📝 TypeScript: Watching for changes...');
console.log('🌐 Server: http://localhost:3000');
console.log('⏹️  Press Ctrl+C to stop\n');
