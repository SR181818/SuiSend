#!/usr/bin/env node

// Simple backend starter script
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting NFC Crypto Wallet Backend...');

// Start the backend server
const backend = spawn('node', ['backend/index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

backend.on('error', (error) => {
  console.error('❌ Backend startup error:', error);
});

backend.on('close', (code) => {
  console.log(`🔄 Backend process exited with code ${code}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down backend...');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Shutting down backend...');
  backend.kill('SIGTERM');
  process.exit(0);
});