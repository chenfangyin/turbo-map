#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigManager {
  constructor() {
    this.configPath = path.join(__dirname, '..', 'config', 'ci-config.json');
    this.envPath = path.join(__dirname, '..', 'env.example');
    this.loadConfig();
  }

  loadConfig() {
    try {
      // 加载环境变量
      dotenv.config();
      
      // 读取配置文件
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(configContent);
      
      // 解析环境变量
      this.resolvedConfig = this.resolveEnvironmentVariables(this.config);
    } catch (error) {
      console.error('❌ 加载配置文件失败:', error.message);
      console.error('请确保 config/ci-config.json 文件存在');
      // 不立即退出，让用户看到帮助信息
      this.config = { secrets: { required: [], optional: [] } };
      this.resolvedConfig = {};
    }
  }

  resolveEnvironmentVariables(obj) {
    const resolved = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const envVar = value.slice(2, -1);
        resolved[key] = process.env[envVar] || '';
      } else if (typeof value === 'object' && value !== null) {
        resolved[key] = this.resolveEnvironmentVariables(value);
      } else {
        resolved[key] = value;
      }
    }
    
    return resolved;
  }

  get(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this.resolvedConfig;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  validateSecrets() {
    const required = this.config.secrets?.required || [];
    const missing = [];
    
    for (const secret of required) {
      if (!process.env[secret]) {
        missing.push(secret);
      }
    }
    
    if (missing.length > 0) {
      console.error('❌ 缺少必需的环境变量:');
      missing.forEach(secret => {
        console.error(`   - ${secret}`);
      });
      
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
      console.error('');
      console.error('🔒 安全注意事项:');
      console.error('  - 不要将真实的 NPM_TOKEN 提交到版本控制');
      console.error('  - 使用 .env 文件时确保已添加到 .gitignore');
      console.error('  - 在 CI/CD 中使用环境变量或 secrets');
      
      return false;
    }
    
    return true;
  }

  generateEnvFile() {
    try {
      const envContent = fs.readFileSync(this.envPath, 'utf8');
      const envFile = path.join(__dirname, '..', '.env');
      
      if (!fs.existsSync(envFile)) {
        // 使用 UTF-8 编码写入文件，解决中文显示问题
        fs.writeFileSync(envFile, envContent, { encoding: 'utf8' });
        console.log('✅ 已生成 .env 文件');
      } else {
        console.log('ℹ️  .env 文件已存在');
      }
    } catch (error) {
      console.error('❌ 生成 .env 文件失败:', error.message);
    }
  }

  showConfig() {
    console.log('📋 当前配置:');
    console.log(JSON.stringify(this.resolvedConfig, null, 2));
  }

  showSecrets() {
    console.log('🔐 环境变量状态:');
    
    const allSecrets = [
      ...(this.config.secrets?.required || []),
      ...(this.config.secrets?.optional || [])
    ];
    
    for (const secret of allSecrets) {
      const isRequired = this.config.secrets?.required?.includes(secret);
      const hasValue = !!process.env[secret];
      const status = hasValue ? '✅' : (isRequired ? '❌' : '⚠️');
      const required = isRequired ? '(必需)' : '(可选)';
      
      console.log(`${status} ${secret} ${required}`);
    }
  }

  validateConfig() {
    console.log('🔍 验证配置...');
    
    // 验证必需的 secrets
    if (!this.validateSecrets()) {
      return false;
    }
    
    // 验证配置完整性
    const requiredSections = ['npm', 'github', 'release', 'test', 'build'];
    const missingSections = [];
    
    for (const section of requiredSections) {
      if (!this.resolvedConfig[section]) {
        missingSections.push(section);
      }
    }
    
    if (missingSections.length > 0) {
      console.error('❌ 缺少配置节:', missingSections.join(', '));
      return false;
    }
    
    console.log('✅ 配置验证通过');
    return true;
  }
}

// 命令行接口
function main() {
  try {
    const configManager = new ConfigManager();
    const command = process.argv[2];
    
    switch (command) {
      case 'show':
        configManager.showConfig();
        break;
        
      case 'secrets':
        configManager.showSecrets();
        break;
        
      case 'validate':
        if (configManager.validateConfig()) {
          console.log('✅ 配置验证成功');
        } else {
          console.log('❌ 配置验证失败');
          process.exit(1);
        }
        break;
        
      case 'generate-env':
        configManager.generateEnvFile();
        break;
        
      case 'get':
        const key = process.argv[3];
        if (!key) {
          console.error('请指定配置键');
          process.exit(1);
        }
        const value = configManager.get(key);
        console.log(`${key}: ${value}`);
        break;
        
      default:
        console.log('📋 Config Manager 使用说明:');
        console.log('');
        console.log('  show          - 显示当前配置');
        console.log('  secrets       - 显示环境变量状态');
        console.log('  validate      - 验证配置完整性');
        console.log('  generate-env  - 生成 .env 文件');
        console.log('  get <key>     - 获取特定配置值');
        console.log('');
        console.log('示例:');
        console.log('  node scripts/config-manager.js show');
        console.log('  node scripts/config-manager.js get npm.token');
    }
  } catch (error) {
    console.error('❌ 配置管理器错误:', error.message);
    process.exit(1);
  }
}

// 检查是否作为主模块运行
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('config-manager.js')) {
  main();
}

export default ConfigManager; 
