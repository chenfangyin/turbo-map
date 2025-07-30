#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 简单的配置验证
function validateConfig() {
  const npmToken = process.env.NPM_TOKEN;
  if (!npmToken) {
    console.error('❌ NPM_TOKEN 环境变量未设置');
    return false;
  }
  return true;
}

function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
}

function updateChangelog(version) {
  const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
  const date = new Date().toISOString().split('T')[0];
  
  const newEntry = `## [${version}] - ${date}

### Added
- Performance improvements
- Bug fixes and enhancements

### Changed
- Updated dependencies

### Fixed
- Various bug fixes

`;

  let changelog = '';
  if (fs.existsSync(changelogPath)) {
    changelog = fs.readFileSync(changelogPath, 'utf8');
  } else {
    changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
  }

  const lines = changelog.split('\n');
  const insertIndex = lines.findIndex(line => line.startsWith('## [')) + 1;
  lines.splice(insertIndex, 0, newEntry);
  
  fs.writeFileSync(changelogPath, lines.join('\n'));
}

function main() {
  const args = process.argv.slice(2);
  const versionType = args[0] || 'patch';
  
  if (!['patch', 'minor', 'major'].includes(versionType)) {
    console.error('Invalid version type. Use: patch, minor, or major');
    process.exit(1);
  }

  // 验证配置
  if (!validateConfig()) {
    console.error('❌ 配置验证失败，请检查环境变量设置');
    process.exit(1);
  }

  console.log(`🚀 Starting release process for ${versionType} version...`);
  
  // 显示发布配置
  console.log('📋 发布配置: NPM_TOKEN 已设置');

  // Check if working directory is clean
  try {
    execSync('git diff-index --quiet HEAD --', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Working directory is not clean. Please commit or stash your changes.');
    process.exit(1);
  }

  // Run tests
  console.log('🧪 Running tests...');
  runCommand('npm run test:ci');

  // Run linting
  console.log('🔍 Running linting...');
  runCommand('npm run lint');

  // Run type checking
  console.log('📝 Running type checking...');
  runCommand('npm run type-check');

  // Build project
  console.log('🔨 Building project...');
  runCommand('npm run build');

  // Bump version
  console.log(`📦 Bumping ${versionType} version...`);
  runCommand(`npm version ${versionType} --no-git-tag-version`);

  // Read new version
  const newPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const newVersion = newPackageJson.version;

  // Update changelog
  console.log('📝 Updating changelog...');
  updateChangelog(newVersion);

  // Commit changes
  console.log('💾 Committing changes...');
  runCommand('git add .');
  runCommand(`git commit -m "chore: release v${newVersion}"`);

  // Create and push tag
  console.log('🏷️  Creating tag...');
  runCommand(`git tag -a v${newVersion} -m "Release v${newVersion}"`);
  runCommand('git push origin main');
  runCommand(`git push origin v${newVersion}`);

  console.log(`✅ Successfully released v${newVersion}!`);
  console.log('📦 The release workflow will automatically publish to npm and create a GitHub release.');
}

// 检查是否作为主模块运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 
