#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 测试 CI/CD 配置...\n');

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
console.log('📁 检查必需文件...');
const requiredFiles = [
  ['.github/workflows/ci.yml', 'CI/CD 工作流'],
  ['.github/workflows/release.yml', '发布工作流'],
  ['.github/workflows/version.yml', '版本管理工作流'],
  ['.github/workflows/deploy-docs.yml', '文档部署工作流'],
  ['.github/dependabot.yml', 'Dependabot 配置'],
  ['scripts/release.js', '发布脚本'],
  ['package.json', '包配置']
];

let allFilesExist = true;
for (const [filePath, description] of requiredFiles) {
  if (!checkFileExists(filePath, description)) {
    allFilesExist = false;
  }
}

console.log('');

if (!allFilesExist) {
  console.error('❌ 缺少一些必需文件。请检查配置。');
  process.exit(1);
}

// Run tests
console.log('🔧 运行测试...');
const tests = [
  ['代码检查', 'npm run lint'],
  ['类型检查', 'npm run type-check'],
  ['单元测试', 'npm run test:ci'],
  ['构建测试', 'npm run build']
];

let allTestsPassed = true;
for (const [name, command] of tests) {
  if (!runTest(name, command)) {
    allTestsPassed = false;
  }
}

// Check build output
console.log('📦 检查构建输出...');
const buildFiles = [
  'dist/index.js',
  'dist/index.esm.js',
  'dist/index.umd.js',
  'dist/index.umd.min.js',
  'dist/index.d.ts'
];

let allBuildFilesExist = true;
for (const file of buildFiles) {
  if (!checkFileExists(file, `构建文件: ${file}`)) {
    allBuildFilesExist = false;
  }
}

console.log('');

// Summary
console.log('📊 测试总结:');
console.log(`文件: ${allFilesExist ? '✅ 全部存在' : '❌ 缺少文件'}`);
console.log(`测试: ${allTestsPassed ? '✅ 全部通过' : '❌ 部分失败'}`);
console.log(`构建: ${allBuildFilesExist ? '✅ 所有文件已生成' : '❌ 缺少构建文件'}`);

if (allFilesExist && allTestsPassed && allBuildFilesExist) {
  console.log('\n🎉 CI/CD 配置已就绪！');
  console.log('\n下一步操作:');
  console.log('1. 在 GitHub secrets 中配置 NPM_TOKEN');
  console.log('2. 启用 GitHub Pages');
  console.log('3. 推送到 main 分支以测试工作流');
} else {
  console.log('\n❌ 部署前需要关注配置。');
  process.exit(1);
} 
