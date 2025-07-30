#!/usr/bin/env node

console.log('🔧 测试配置管理器...');

try {
  // 测试基本功能
  console.log('✅ Node.js 环境正常');
  console.log('✅ 脚本执行正常');
  
  // 测试文件存在性
  const fs = await import('fs');
  const path = await import('path');
  
  const configPath = path.join(process.cwd(), 'config', 'ci-config.json');
  const envPath = path.join(process.cwd(), 'env.example');
  
  console.log('📁 检查文件存在性:');
  console.log(`   config/ci-config.json: ${fs.existsSync(configPath) ? '✅' : '❌'}`);
  console.log(`   env.example: ${fs.existsSync(envPath) ? '✅' : '❌'}`);
  
  // 测试 dotenv
  try {
    const dotenv = await import('dotenv');
    console.log('✅ dotenv 模块加载成功');
  } catch (error) {
    console.log('❌ dotenv 模块加载失败:', error.message);
  }
  
  console.log('🎉 测试完成');
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
} 