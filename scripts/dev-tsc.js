#!/usr/bin/env node

const { spawn } = require('child_process');

// Spawn tsc with watch mode
const tsc = spawn('tsc', ['--watch'], {
  stdio: ['inherit', 'pipe', 'pipe']
});

// Filter and output without additional prefix (TSC already adds its own prefix)
tsc.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.trim()) { // Only output non-empty lines
      console.log(line);
    }
  });
});

tsc.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.trim()) { // Only output non-empty lines
      console.error(line);
    }
  });
});

tsc.on('close', (code) => {
  process.exit(code);
});
