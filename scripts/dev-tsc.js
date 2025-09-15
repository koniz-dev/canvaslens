#!/usr/bin/env node

const { spawn } = require('child_process');
const { exec } = require('child_process');

// Spawn tsc with watch mode
const tsc = spawn('tsc', ['--watch'], {
  stdio: ['inherit', 'pipe', 'pipe']
});

let isFirstCompilation = true;

// Filter and output without additional prefix (TSC already adds its own prefix)
tsc.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach(line => {
    if (line.trim()) { // Only output non-empty lines
      // Run fix-imports after successful compilation
      if (line.includes('Found 0 errors') && !isFirstCompilation) {
        exec('node scripts/fix-imports.js', (error, stdout, stderr) => {
          if (error) {
            console.error('[TSC] Fix-imports error:', error);
            return;
          }
        });
      }
      
      if (line.includes('Starting compilation')) {
        isFirstCompilation = false;
      }
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
