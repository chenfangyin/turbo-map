#!/usr/bin/env node

console.log('🔧 测试 NPM Token 配置...\n');

// 检查环境变量
const npmToken = process.env.NPM_TOKEN;
console.log('📋 环境变量检查:');
console.log(`   NPM_TOKEN: ${npmToken ? '✅ 已设置' : '❌ 未设置'}`);

if (npmToken) {
  console.log(`   Token 格式: ${npmToken.startsWith('npm_') ? '✅ 正确' : '❌ 格式错误'}`);
  console.log(`   Token 长度: ${npmToken.length} 字符`);
}

// 测试 npm 登录状态
console.log('\n📋 NPM 登录状态:');
try {
  const { execSync } = await import('child_process');
  const whoami = execSync('npm whoami', { encoding: 'utf8' }).trim();
  console.log(`   ✅ 已登录为: ${whoami}`);
} catch (error) {
  console.log('   ❌ 未登录 npm');
}

// 测试包发布权限
console.log('\n📋 包发布权限测试:');
try {
  const { execSync } = await import('child_process');
  const packageJson = JSON.parse(await import('fs').then(fs => fs.readFileSync('package.json', 'utf8')));
  console.log(`   📦 包名称: ${packageJson.name}`);
  console.log(`   📦 当前版本: ${packageJson.version}`);
  
  // 检查包是否已发布
  try {
    const info = execSync(`npm view ${packageJson.name} version`, { encoding: 'utf8' }).trim();
    console.log(`   📦 已发布版本: ${info}`);
  } catch (error) {
    console.log('   📦 包尚未发布到 npm');
  }
} catch (error) {
  console.log('   ❌ 无法读取 package.json');
}

console.log('\n🎉 测试完成！');
console.log('\n📋 下一步:');
console.log('1. 将 NPM_TOKEN 添加到 GitHub Secrets');
console.log('2. 测试发布流程: npm run release:patch');
console.log('3. 检查 GitHub Actions 工作流'); 
