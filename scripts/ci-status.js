#!/usr/bin/env node

/**
 * CI/CD Status Checker
 * 
 * This script validates the CI/CD configuration and provides
 * a comprehensive status report for all workflows.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function validateWorkflowFile(filePath) {
  if (!checkFileExists(filePath)) {
    return { exists: false, valid: false, error: '文件未找到' };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const workflow = yaml.load(content);
    
    return {
      exists: true,
      valid: true,
      name: workflow.name,
      triggers: workflow.on,
      jobs: Object.keys(workflow.jobs || {})
    };
  } catch (error) {
    return {
      exists: true,
      valid: false,
      error: error.message
    };
  }
}

function checkPackageScripts() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const requiredScripts = [
      'build',
      'test',
      'test:ci',
      'lint',
      'type-check',
      'benchmark'
    ];
    
    const missingScripts = requiredScripts.filter(script => !scripts[script]);
    const presentScripts = requiredScripts.filter(script => scripts[script]);
    
    return {
      valid: missingScripts.length === 0,
      present: presentScripts,
      missing: missingScripts
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

function checkSecrets() {
  const requiredSecrets = [
    'NPM_TOKEN'
  ];
  
  const optionalSecrets = [
    'GITHUB_TOKEN',
    'SLACK_WEBHOOK_URL',
    'DISCORD_WEBHOOK_URL',
    'NPM_REGISTRY',
    'NPM_SCOPE'
  ];
  
  return {
    required: requiredSecrets,
    optional: optionalSecrets
  };
}

function generateReport() {
  log('\n🔧 CI/CD 配置状态报告', 'bright');
  log('=====================================\n', 'bright');
  
  // Check workflow files
  log('📋 工作流文件:', 'cyan');
  const workflows = [
    '.github/workflows/ci.yml',
    '.github/workflows/release.yml',
    '.github/workflows/deploy-docs.yml',
    '.github/workflows/version.yml',
    '.github/workflows/dependabot.yml'
  ];
  
  workflows.forEach(workflow => {
    const result = validateWorkflowFile(workflow);
    if (result.exists && result.valid) {
      log(`  ✅ ${workflow} - ${result.name}`, 'green');
      log(`     任务: ${result.jobs.join(', ')}`, 'blue');
    } else if (result.exists) {
      log(`  ❌ ${workflow} - YAML 格式无效`, 'red');
      log(`     错误: ${result.error}`, 'red');
    } else {
      log(`  ❌ ${workflow} - 未找到`, 'red');
    }
  });
  
  // Check package.json scripts
  log('\n📦 Package.json 脚本:', 'cyan');
  const scriptsResult = checkPackageScripts();
  if (scriptsResult.valid) {
    log('  ✅ 所有必需脚本已存在', 'green');
    log(`     找到: ${scriptsResult.present.join(', ')}`, 'blue');
  } else {
    log('  ❌ 缺少必需脚本', 'red');
    log(`     缺少: ${scriptsResult.missing.join(', ')}`, 'red');
  }
  
  // Check secrets configuration
  log('\n🔐 必需密钥:', 'cyan');
  const secrets = checkSecrets();
  log(`  必需: ${secrets.required.join(', ')}`, 'yellow');
  log(`  可选: ${secrets.optional.join(', ')}`, 'blue');
  
  // Check additional files
  log('\n📁 附加文件:', 'cyan');
  const additionalFiles = [
    '.github/dependabot.yml',
    'config/ci-config.json',
    'env.example'
  ];
  
  additionalFiles.forEach(file => {
    if (checkFileExists(file)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ ${file} - 未找到`, 'red');
    }
  });
  
  // Summary
  log('\n📊 总结:', 'bright');
  const workflowResults = workflows.map(w => validateWorkflowFile(w));
  const validWorkflows = workflowResults.filter(r => r.exists && r.valid).length;
  const totalWorkflows = workflows.length;
  
  log(`  工作流: ${validWorkflows}/${totalWorkflows} 有效`, 
      validWorkflows === totalWorkflows ? 'green' : 'yellow');
  log(`  脚本: ${scriptsResult.valid ? '全部存在' : '缺少部分'}`, 
      scriptsResult.valid ? 'green' : 'red');
  
  if (validWorkflows === totalWorkflows && scriptsResult.valid) {
    log('\n🎉 CI/CD 配置已就绪！', 'green');
  } else {
    log('\n⚠️  需要解决一些问题', 'yellow');
  }
  
  log('\n📝 下一步操作:', 'bright');
  log('  1. 设置必需的 GitHub Secrets', 'blue');
  log('  2. 配置通知 webhook（可选）', 'blue');
  log('  3. 通过测试提交测试工作流', 'blue');
  log('  4. 监控工作流执行', 'blue');
}

// Run the check
try {
  generateReport();
} catch (error) {
  log(`\n❌ 运行 CI/CD 状态检查时出错: ${error.message}`, 'red');
  process.exit(1);
}

export {
  checkFileExists,
  validateWorkflowFile,
  checkPackageScripts,
  checkSecrets,
  generateReport
}; 
