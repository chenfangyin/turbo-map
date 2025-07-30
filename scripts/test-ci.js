#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing CI/CD Configuration...\n');

function runTest(name, command) {
  try {
    console.log(`📋 Running: ${name}`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${name} passed\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${name} failed\n`);
    return false;
  }
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    console.error(`❌ ${description}: ${filePath} not found`);
    return false;
  }
}

// Check required files
console.log('📁 Checking required files...');
const requiredFiles = [
  ['.github/workflows/ci.yml', 'CI/CD Workflow'],
  ['.github/workflows/release.yml', 'Release Workflow'],
  ['.github/workflows/version.yml', 'Version Management Workflow'],
  ['.github/workflows/deploy-docs.yml', 'Documentation Deployment Workflow'],
  ['.github/dependabot.yml', 'Dependabot Configuration'],
  ['scripts/release.js', 'Release Script'],
  ['package.json', 'Package Configuration']
];

let allFilesExist = true;
for (const [filePath, description] of requiredFiles) {
  if (!checkFileExists(filePath, description)) {
    allFilesExist = false;
  }
}

console.log('');

if (!allFilesExist) {
  console.error('❌ Some required files are missing. Please check the configuration.');
  process.exit(1);
}

// Run tests
console.log('🔧 Running tests...');
const tests = [
  ['Linting', 'npm run lint'],
  ['Type Checking', 'npm run type-check'],
  ['Tests', 'npm run test:ci'],
  ['Build', 'npm run build']
];

let allTestsPassed = true;
for (const [name, command] of tests) {
  if (!runTest(name, command)) {
    allTestsPassed = false;
  }
}

// Check build output
console.log('📦 Checking build output...');
const buildFiles = [
  'dist/index.js',
  'dist/index.esm.js',
  'dist/index.umd.js',
  'dist/index.umd.min.js',
  'dist/index.d.ts'
];

let allBuildFilesExist = true;
for (const file of buildFiles) {
  if (!checkFileExists(file, `Build file: ${file}`)) {
    allBuildFilesExist = false;
  }
}

console.log('');

// Summary
console.log('📊 Test Summary:');
console.log(`Files: ${allFilesExist ? '✅ All present' : '❌ Missing files'}`);
console.log(`Tests: ${allTestsPassed ? '✅ All passed' : '❌ Some failed'}`);
console.log(`Build: ${allBuildFilesExist ? '✅ All files generated' : '❌ Missing build files'}`);

if (allFilesExist && allTestsPassed && allBuildFilesExist) {
  console.log('\n🎉 CI/CD configuration is ready!');
  console.log('\nNext steps:');
  console.log('1. Configure NPM_TOKEN in GitHub secrets');
  console.log('2. Enable GitHub Pages');
  console.log('3. Push to main branch to test workflows');
} else {
  console.log('\n❌ Configuration needs attention before deployment.');
  process.exit(1);
} 
