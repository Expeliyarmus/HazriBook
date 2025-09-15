#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting comprehensive debug check...\n');

const checks = [
  {
    name: 'TypeScript Type Checking',
    command: 'npx tsc --noEmit',
    critical: true,
  },
  {
    name: 'ESLint Code Quality',
    command: 'npx eslint src --ext .ts,.tsx --format compact',
    critical: false,
  },
  {
    name: 'Build Test',
    command: 'npm run build',
    critical: true,
  },
  {
    name: 'Check for Unused Dependencies',
    command: 'npx depcheck',
    critical: false,
  },
];

let hasErrors = false;
const results = [];

checks.forEach(({ name, command, critical }) => {
  console.log(`\n📋 Running: ${name}`);
  console.log(`   Command: ${command}`);
  
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`   ✅ PASSED`);
    results.push({ name, status: 'PASSED', output: output.trim() });
  } catch (error) {
    console.log(`   ❌ ${critical ? 'FAILED (Critical)' : 'WARNINGS'}`);
    if (error.stdout) {
      console.log(`   Output: ${error.stdout.toString().substring(0, 200)}...`);
    }
    results.push({ 
      name, 
      status: critical ? 'FAILED' : 'WARNING',
      error: error.message || error.toString()
    });
    if (critical) hasErrors = true;
  }
});

// Generate report
console.log('\n' + '='.repeat(60));
console.log('📊 DEBUG REPORT SUMMARY');
console.log('='.repeat(60));

results.forEach(({ name, status }) => {
  const icon = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⚠️';
  console.log(`${icon} ${name}: ${status}`);
});

// Check for common issues
console.log('\n' + '='.repeat(60));
console.log('🔧 CHECKING COMMON ISSUES');
console.log('='.repeat(60));

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('❌ node_modules not found. Run: npm install');
  hasErrors = true;
} else {
  console.log('✅ node_modules exists');
}

// Check if .env file exists (if needed)
if (!fs.existsSync('.env') && !fs.existsSync('.env.local')) {
  console.log('⚠️  No .env file found (may not be needed)');
}

// Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  console.log(`✅ package.json valid - ${packageJson.name} v${packageJson.version}`);
} catch (error) {
  console.log('❌ package.json is invalid');
  hasErrors = true;
}

// Final status
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ DEBUGGING COMPLETE: ERRORS FOUND');
  console.log('Please fix the critical errors above before deploying.');
  process.exit(1);
} else {
  console.log('✅ DEBUGGING COMPLETE: NO CRITICAL ERRORS');
  console.log('Your app is ready for production!');
  
  // Provide deployment instructions
  console.log('\n📦 READY TO DEPLOY:');
  console.log('1. Build: npm run build');
  console.log('2. Test locally: npx serve -s build');
  console.log('3. Deploy to Vercel: npx vercel --prod');
  console.log('4. Or deploy to GitHub Pages: npm run deploy');
}