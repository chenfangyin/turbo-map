#!/usr/bin/env node

import https from 'https';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', 'package.json');
const { version } = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

console.log(`🔍 检查动态版本徽章 - 当前本地版本: ${version}`);

// 检查npm版本徽章URL
const badges = [
  {
    name: 'Shields.io npm version',
    url: 'https://img.shields.io/npm/v/turbo-map.svg?style=flat'
  },
  {
    name: 'Shields.io npm downloads',
    url: 'https://img.shields.io/npm/dm/turbo-map.svg?style=flat'
  },
  {
    name: 'Badge Fury npm version',
    url: 'https://badge.fury.io/js/turbo-map.svg'
  }
];

async function checkBadge(badge) {
  return new Promise((resolve, reject) => {
    const req = https.get(badge.url, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`✅ ${badge.name}: HTTP ${res.statusCode} - 可访问`);
        resolve(true);
      } else {
        console.log(`❌ ${badge.name}: HTTP ${res.statusCode} - 错误`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log(`❌ ${badge.name}: 网络错误 - ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.abort();
      console.log(`⏰ ${badge.name}: 请求超时`);
      resolve(false);
    });
  });
}

async function checkNpmVersion() {
  return new Promise((resolve, reject) => {
    const req = https.get('https://registry.npmjs.org/turbo-map/latest', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const packageData = JSON.parse(data);
          const npmVersion = packageData.version;
          console.log(`📦 npm registry 版本: ${npmVersion}`);
          
          if (npmVersion === version) {
            console.log(`✅ 版本同步: 本地版本与npm版本一致`);
          } else {
            console.log(`⚠️  版本差异: 本地(${version}) vs npm(${npmVersion})`);
          }
          resolve(npmVersion);
        } catch (err) {
          console.log(`❌ 解析npm数据失败: ${err.message}`);
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ npm registry 查询失败: ${err.message}`);
      resolve(null);
    });
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 TurboMap 动态徽章检查工具');
  console.log('='.repeat(60));

  // 检查npm版本
  await checkNpmVersion();
  console.log('');

  // 检查所有徽章
  console.log('📊 检查徽章可访问性:');
  let successCount = 0;
  for (const badge of badges) {
    const success = await checkBadge(badge);
    if (success) successCount++;
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`📈 结果: ${successCount}/${badges.length} 个徽章可正常访问`);
  
  if (successCount === badges.length) {
    console.log('🎉 所有动态徽章工作正常！');
  } else {
    console.log('⚠️  部分徽章可能存在问题，请检查网络连接或稍后重试');
  }
  
  console.log('');
  console.log('📚 使用的动态徽章URL:');
  console.log('- npm版本: https://img.shields.io/npm/v/turbo-map.svg');
  console.log('- npm下载: https://img.shields.io/npm/dm/turbo-map.svg');
  console.log('- 备用版本: https://badge.fury.io/js/turbo-map.svg');
  console.log('');
  console.log('💡 这些徽章会自动从npm registry获取最新版本信息');
  console.log('💡 通常在npm包发布后5-15分钟内更新');
  console.log('='.repeat(60));
}

main().catch(console.error);