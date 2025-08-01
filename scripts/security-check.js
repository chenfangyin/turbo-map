#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔒 安全检查...\n');

function checkForSecrets() {
  const issues = [];
  
  // 首先检查 .gitignore 是否包含 .env
  const gitignoreFile = path.join(__dirname, '..', '.gitignore');
  let envIsIgnored = false;
  
  if (fs.existsSync(gitignoreFile)) {
    const gitignoreContent = fs.readFileSync(gitignoreFile, 'utf8');
    envIsIgnored = gitignoreContent.includes('.env');
    
    if (!envIsIgnored) {
      issues.push({
        type: 'error',
        message: '.gitignore 文件未包含 .env，这可能导致敏感信息泄露',
        file: '.gitignore'
      });
    }
  } else {
    issues.push({
      type: 'error',
      message: '缺少 .gitignore 文件，这可能导致敏感信息泄露',
      file: '.gitignore'
    });
  }
  
  // 检查 .env 文件是否被提交（只有在 .env 未被忽略时才检查）
  const envFile = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envFile) && !envIsIgnored) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    
    // 检查是否包含真实的 token
    const realTokenPattern = /NPM_TOKEN=npm_[a-zA-Z0-9]{36}/;
    if (realTokenPattern.test(envContent)) {
      issues.push({
        type: 'warning',
        message: '.env 文件包含真实的 NPM_TOKEN，请确保不要提交到版本控制',
        file: '.env'
      });
    }
  }
  
  // 检查 env.example 是否包含真实 token
  const envExampleFile = path.join(__dirname, '..', 'env.example');
  if (fs.existsSync(envExampleFile)) {
    const envExampleContent = fs.readFileSync(envExampleFile, 'utf8');
    const realTokenPattern = /NPM_TOKEN=npm_[a-zA-Z0-9]{36}/;
    if (realTokenPattern.test(envExampleContent)) {
      issues.push({
        type: 'error',
        message: 'env.example 文件包含真实的 NPM_TOKEN，这是不安全的',
        file: 'env.example'
      });
    }
  }
  
  return issues;
}

async function checkGitStatus() {
  const { execSync } = await import('child_process');
  
  try {
    // 检查是否有未提交的 .env 文件
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    const envFiles = gitStatus.split('\n').filter(line => line.includes('.env'));
    
    if (envFiles.length > 0) {
      return [{
        type: 'warning',
        message: '发现未提交的 .env 文件，请检查是否包含敏感信息',
        files: envFiles.map(line => line.split(' ').pop())
      }];
    }
  } catch (error) {
    // 如果不在 git 仓库中，忽略此检查
  }
  
  return [];
}

async function main() {
  const secretIssues = checkForSecrets();
  const gitIssues = await checkGitStatus();
  const allIssues = [...secretIssues, ...gitIssues];
  
  if (allIssues.length === 0) {
    console.log('✅ 安全检查通过，未发现安全问题');
    return;
  }
  
  console.log('⚠️  发现以下安全问题:');
  console.log('');
  
  allIssues.forEach((issue, index) => {
    const icon = issue.type === 'error' ? '❌' : '⚠️';
    console.log(`${index + 1}. ${icon} ${issue.message}`);
    if (issue.file) {
      console.log(`   文件: ${issue.file}`);
    }
    if (issue.files) {
      console.log(`   文件: ${issue.files.join(', ')}`);
    }
    console.log('');
  });
  
  console.log('🔧 建议的解决方案:');
  console.log('  1. 确保 .env 文件已添加到 .gitignore');
  console.log('  2. 不要在 env.example 中包含真实的 token');
  console.log('  3. 使用占位符值，如 npm_xxxxxxxxxxxxxxxx');
  console.log('  4. 在 CI/CD 中通过环境变量设置真实的 token');
  console.log('  5. 定期轮换 token 以提高安全性');
  console.log('');
  
  const hasErrors = allIssues.some(issue => issue.type === 'error');
  if (hasErrors) {
    console.log('❌ 发现严重安全问题，请修复后再继续');
    process.exit(1);
  } else {
    console.log('⚠️  发现警告，建议修复但不影响继续操作');
  }
}

// 运行安全检查
main().catch(console.error); 
