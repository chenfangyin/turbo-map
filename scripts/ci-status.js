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
    return { exists: false, valid: false, error: 'File not found' };
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
    'NPM_TOKEN',
    'GITHUB_TOKEN'
  ];
  
  const optionalSecrets = [
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
  log('\n🔧 CI/CD Configuration Status Report', 'bright');
  log('=====================================\n', 'bright');
  
  // Check workflow files
  log('📋 Workflow Files:', 'cyan');
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
      log(`     Jobs: ${result.jobs.join(', ')}`, 'blue');
    } else if (result.exists) {
      log(`  ❌ ${workflow} - Invalid YAML`, 'red');
      log(`     Error: ${result.error}`, 'red');
    } else {
      log(`  ❌ ${workflow} - Not found`, 'red');
    }
  });
  
  // Check package.json scripts
  log('\n📦 Package.json Scripts:', 'cyan');
  const scriptsResult = checkPackageScripts();
  if (scriptsResult.valid) {
    log('  ✅ All required scripts present', 'green');
    log(`     Found: ${scriptsResult.present.join(', ')}`, 'blue');
  } else {
    log('  ❌ Missing required scripts', 'red');
    log(`     Missing: ${scriptsResult.missing.join(', ')}`, 'red');
  }
  
  // Check secrets configuration
  log('\n🔐 Required Secrets:', 'cyan');
  const secrets = checkSecrets();
  log(`  Required: ${secrets.required.join(', ')}`, 'yellow');
  log(`  Optional: ${secrets.optional.join(', ')}`, 'blue');
  
  // Check additional files
  log('\n📁 Additional Files:', 'cyan');
  const additionalFiles = [
    '.github/dependabot.yml',
    'config/ci-config.json',
    'env.example'
  ];
  
  additionalFiles.forEach(file => {
    if (checkFileExists(file)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ ${file} - Not found`, 'red');
    }
  });
  
  // Summary
  log('\n📊 Summary:', 'bright');
  const workflowResults = workflows.map(w => validateWorkflowFile(w));
  const validWorkflows = workflowResults.filter(r => r.exists && r.valid).length;
  const totalWorkflows = workflows.length;
  
  log(`  Workflows: ${validWorkflows}/${totalWorkflows} valid`, 
      validWorkflows === totalWorkflows ? 'green' : 'yellow');
  log(`  Scripts: ${scriptsResult.valid ? 'All present' : 'Missing some'}`, 
      scriptsResult.valid ? 'green' : 'red');
  
  if (validWorkflows === totalWorkflows && scriptsResult.valid) {
    log('\n🎉 CI/CD configuration is ready!', 'green');
  } else {
    log('\n⚠️  Some issues need to be addressed', 'yellow');
  }
  
  log('\n📝 Next Steps:', 'bright');
  log('  1. Set up required GitHub Secrets', 'blue');
  log('  2. Configure notification webhooks (optional)', 'blue');
  log('  3. Test workflows with a test commit', 'blue');
  log('  4. Monitor workflow execution', 'blue');
}

// Run the check
try {
  generateReport();
} catch (error) {
  log(`\n❌ Error running CI/CD status check: ${error.message}`, 'red');
  process.exit(1);
}

export {
  checkFileExists,
  validateWorkflowFile,
  checkPackageScripts,
  checkSecrets,
  generateReport
}; 