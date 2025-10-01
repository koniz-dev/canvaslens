#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🚀 Starting CanvasLens development server...\n');

let tsc = null;
let server = null;

// Start development server first
function startServer() {
  return new Promise((resolve, reject) => {
    server = spawn('node', ['dev/server.js'], {
      stdio: ['inherit', 'pipe', 'pipe']
    });

    // Handle server output
    server.stdout.on('data', (data) => {
      const output = data.toString().trim();
      console.log(`[SERVER] ${output}`);
      
      // Check if server started successfully
      if (output.includes('Server running at http://localhost:3000')) {
        resolve();
      }
    });

    server.stderr.on('data', (data) => {
      const errorOutput = data.toString().trim();
      console.error(`[SERVER ERROR] ${errorOutput}`);
      
      // Check for port conflict error
      if (errorOutput.includes('EADDRINUSE') || errorOutput.includes('address already in use')) {
        console.log('\n🔧 Port 3000 is already in use. Here are some helpful commands:');
        console.log('📋 Find processes using port 3000:');
        console.log('   lsof -i :3000');
        console.log('   netstat -tulpn | grep :3000');
        console.log('\n💀 Kill all processes using port 3000:');
        console.log('   lsof -ti :3000 | xargs kill -9');
        console.log('   fuser -k 3000/tcp');
        console.log('\n🔍 Find and kill Node.js processes:');
        console.log('   pkill -f "node.*server.js"');
        console.log('   ps aux | grep node | grep -v grep');
        console.log('\n');
      }
    });

    server.on('error', (err) => {
      console.error('❌ Server error:', err);
      reject(err);
    });

    server.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Server exited with code ${code}`);
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Timeout after 10 seconds if server doesn't start
    setTimeout(() => {
      reject(new Error('Server startup timeout'));
    }, 10000);
  });
}

// Start TypeScript compiler in watch mode
function startTSC() {
  console.log('📝 Starting TypeScript compiler in watch mode...');
  
  tsc = spawn('tsc', ['--watch'], {
    stdio: ['inherit', 'pipe', 'pipe']
  });

  // Handle TypeScript output
  tsc.stdout.on('data', (data) => {
    console.log(`[TSC] ${data.toString().trim()}`);
  });

  tsc.stderr.on('data', (data) => {
    console.error(`[TSC ERROR] ${data.toString().trim()}`);
  });

  tsc.on('error', (err) => {
    console.error('❌ TypeScript compiler error:', err);
    process.exit(1);
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  if (tsc) tsc.kill();
  if (server) server.kill();
  process.exit(0);
});

// Start server first, then TSC
startServer()
  .then(() => {
    console.log('✅ Development server started successfully!');
    startTSC();
    console.log('🌐 Server: http://localhost:3000');
    console.log('⏹️  Press Ctrl+C to stop\n');
  })
  .catch((err) => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  });
