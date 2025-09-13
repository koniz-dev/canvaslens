#!/usr/bin/env node

const { spawn } = require('child_process');

// Spawn tsc with watch mode
const tsc = spawn('tsc', ['--watch', '--pretty', 'false'], {
  stdio: ['inherit', 'pipe', 'pipe']
});

// Filter and prefix output
tsc.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.trim()) { // Only output non-empty lines
      console.log(`[TSC] ${line}`);
    }
  });
});

tsc.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.trim()) { // Only output non-empty lines
      console.error(`[TSC] ${line}`);
    }
  });
});

tsc.on('close', (code) => {
  process.exit(code);
});
