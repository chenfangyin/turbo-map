#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 改进的配置验证
function validateConfig() {
  let npmToken = process.env.NPM_TOKEN;
  
  // 检查命令行参数中是否有 NPM_TOKEN
  const args = process.argv.slice(2);
  const tokenIndex = args.findIndex(arg => arg.startsWith('NPM_TOKEN='));
  if (tokenIndex !== -1) {
    npmToken = args[tokenIndex].split('=')[1];
    console.log('📋 从命令行参数获取 NPM_TOKEN');
  }
  
  if (!npmToken || npmToken.trim() === '') {
    console.error('❌ NPM_TOKEN 环境变量未设置');
    console.error('');
    console.error('🔧 解决方案:');
    console.error('  1. 设置环境变量:');
    console.error('     export NPM_TOKEN=your_token');
    console.error('     set NPM_TOKEN=your_token (Windows)');
    console.error('');
    console.error('  2. 在运行时传参:');
    console.error('     NPM_TOKEN=your_token npm run release');
    console.error('     npm run release -- NPM_TOKEN=your_token');
    console.error('');
    console.error('  3. 在 .env 文件中设置:');
    console.error('     cp env.example .env');
    console.error('     # 编辑 .env 文件，设置真实的 NPM_TOKEN');
    console.error('');
    console.error('  4. 在 CI/CD 中通过 secrets 设置');
    console.error('');
    console.error('📝 获取 NPM_TOKEN:');
    console.error('  - 登录 npm: npm login');
    console.error('  - 查看 token: npm token list');
    console.error('  - 创建 token: npm token create');
    return false;
  }
  
  // 验证 token 格式
  if (!npmToken.trim().startsWith('npm_')) {
    console.error('❌ NPM_TOKEN 格式不正确，应以 npm_ 开头');
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
    console.error('无效的版本类型。请使用: patch, minor, 或 major');
    process.exit(1);
  }

  // 验证配置
  if (!validateConfig()) {
    console.error('❌ 配置验证失败，请检查环境变量设置');
    process.exit(1);
  }

  console.log(`🚀 开始 ${versionType} 版本发布流程...`);
  
  // 显示发布配置
  console.log('📋 发布配置: NPM_TOKEN 已设置');
  
  // 记录开始状态用于回滚
  const startState = {
    currentVersion: packageJson.version,
    currentBranch: execSync('git branch --show-current', { encoding: 'utf8' }).trim(),
    hasUncommittedChanges: false
  };
  
  try {
    execSync('git diff-index --quiet HEAD --', { stdio: 'pipe' });
  } catch (error) {
    startState.hasUncommittedChanges = true;
  }

  // Check if working directory is clean
  try {
    execSync('git diff-index --quiet HEAD --', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ 工作目录不干净。请提交或暂存您的更改。');
    process.exit(1);
  }

  try {
  // Run tests
  console.log('🧪 运行测试...');
  runCommand('npm run test:ci');

  // Run security check
  console.log('🔒 运行安全检查...');
  runCommand('npm run security:check');

  // Run linting
  console.log('🔍 运行代码检查...');
  runCommand('npm run lint');

  // Run type checking
  console.log('📝 运行类型检查...');
  runCommand('npm run type-check');

  // Build project
  console.log('🔨 构建项目...');
  runCommand('npm run build');

  // Bump version
  console.log(`📦 更新 ${versionType} 版本...`);
  runCommand(`npm version ${versionType} --no-git-tag-version`);

  // Read new version
  const newPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const newVersion = newPackageJson.version;

  // Update changelog
  console.log('📝 更新变更日志...');
  updateChangelog(newVersion);

  // Commit changes
  console.log('💾 提交更改...');
  runCommand('git add .');
  runCommand(`git commit -m "chore: release v${newVersion}"`);

  // Create and push tag
  console.log('🏷️  创建标签...');
  runCommand(`git tag -a v${newVersion} -m "Release v${newVersion}"`);
  runCommand('git push origin main');
  runCommand(`git push origin v${newVersion}`);

  console.log(`✅ 成功发布 v${newVersion}！`);
  console.log('📦 发布工作流将自动发布到 npm 并创建 GitHub 发布。');
  console.log('');
  console.log('🔗 相关链接:');
  console.log(`  - npm: https://www.npmjs.com/package/turbo-map`);
  console.log(`  - GitHub: https://github.com/chenfangyin/turbo-map/releases/tag/v${newVersion}`);
  console.log(`  - 文档: https://github.com/chenfangyin/turbo-map#readme`);
} catch (error) {
  console.error('❌ 发布流程失败:', error.message);
  console.error('');
  console.error('🔧 开始回滚...');
  rollback(startState);
  process.exit(1);
}
}

// 回滚函数
function rollback(startState) {
  console.log('🔄 开始回滚...');
  
  try {
    // 重置版本号
    execSync(`npm version ${startState.currentVersion} --no-git-tag-version`, { stdio: 'inherit' });
    
    // 删除可能创建的标签
    try {
      const newPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      execSync(`git tag -d v${newPackageJson.version}`, { stdio: 'pipe' });
    } catch (error) {
      // 标签可能不存在，忽略错误
    }
    
    // 重置 git 状态
    if (!startState.hasUncommittedChanges) {
      execSync('git reset --hard HEAD', { stdio: 'inherit' });
    } else {
      console.log('⚠️  检测到未提交的更改，请手动处理');
    }
    
    console.log('✅ 回滚完成');
  } catch (error) {
    console.error('❌ 回滚失败:', error.message);
    console.error('请手动检查项目状态');
  }
}

// 检查是否作为主模块运行
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('release.js')) {
  main();
}
