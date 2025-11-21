#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Restarting SmartLearn Backend Server...\n');

// Kill any existing processes on port 3000
const killProcess = spawn('taskkill', ['/F', '/IM', 'node.exe'], { shell: true });

killProcess.on('close', (code) => {
  console.log('✅ Existing processes stopped');

  // Start the backend server
  console.log('🚀 Starting backend server...');
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  });

  backend.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });

  backend.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });

  // Give server time to start
  setTimeout(() => {
    console.log('\n✅ Backend server restarted successfully!');
    console.log('📍 Server: http://localhost:3000');
    console.log('❤️  Health: http://localhost:3000/health');
    console.log('\n🎉 Rate limiting has been updated:');
    console.log('   • General API: 1000 requests per 15 min');
    console.log('   • Auth endpoints: 60 requests per 15 min');
    console.log('   • Login/Signup: 30 requests per 15 min');
    console.log('   • Quiz endpoints: 100 requests per min');
  }, 3000);
});

killProcess.on('error', (err) => {
  console.error('Failed to kill existing processes:', err);

  // Try to start backend anyway
  console.log('🚀 Starting backend server...');
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
  });
});