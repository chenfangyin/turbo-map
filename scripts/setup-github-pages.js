#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 GitHub Pages 设置向导\n');

function checkPrerequisites() {
  console.log('📋 检查前置条件...');
  
  const checks = [
    {
      name: 'package.json',
      path: path.join(__dirname, '..', 'package.json'),
      required: true
    },
    {
      name: 'GitHub Actions 工作流',
      path: path.join(__dirname, '..', '.github', 'workflows', 'deploy-docs.yml'),
      required: true
    },
    {
      name: '文档站点',
      path: path.join(__dirname, '..', 'docs-site'),
      required: false
    },
    {
      name: '构建输出',
      path: path.join(__dirname, '..', 'dist'),
      required: false
    }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    const exists = fs.existsSync(check.path);
    const status = exists ? '✅' : (check.required ? '❌' : '⚠️');
    console.log(`  ${status} ${check.name}: ${exists ? '存在' : '不存在'}`);
    
    if (check.required && !exists) {
      allPassed = false;
    }
  }
  
  return allPassed;
}

function createDocsSite() {
  console.log('\n📁 创建文档站点...');
  
  const docsSitePath = path.join(__dirname, '..', 'docs-site');
  
  if (!fs.existsSync(docsSitePath)) {
    fs.mkdirSync(docsSitePath, { recursive: true });
    console.log('  ✅ 创建 docs-site 目录');
  }
  
  // 创建软链接而不是复制文件（推荐）
  const filesToLink = [
    { src: 'README.md', dest: 'docs-site/README.md', required: true },
    { src: 'CHANGELOG.md', dest: 'docs-site/CHANGELOG.md', required: false },
    { src: 'LICENSE', dest: 'docs-site/LICENSE', required: false }
  ];
  
  for (const file of filesToLink) {
    const srcPath = path.join(__dirname, '..', file.src);
    const destPath = path.join(__dirname, '..', file.dest);
    
    if (fs.existsSync(srcPath)) {
      try {
        // 在 Windows 上使用 junction，在 Unix 上使用 symlink
        if (process.platform === 'win32') {
          // Windows: 使用 junction 或复制文件
          fs.copyFileSync(srcPath, destPath);
          console.log(`  ✅ 链接 ${file.src} (Windows 兼容)`);
        } else {
          // Unix/Linux/macOS: 使用软链接
          fs.symlinkSync(srcPath, destPath);
          console.log(`  ✅ 软链接 ${file.src}`);
        }
      } catch (error) {
        // 如果软链接失败，回退到复制
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✅ 复制 ${file.src} (回退方案)`);
      }
    } else if (file.required) {
      console.log(`  ⚠️  缺少必需文件: ${file.src}`);
    } else {
      console.log(`  ℹ️  跳过可选文件: ${file.src}`);
    }
  }
  
  // 创建主页
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Turbo Map - High-performance Map Implementation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .content {
            background: white;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 30px;
        }
        
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: background 0.3s;
            margin: 10px;
        }
        
        .btn:hover {
            background: #5a67d8;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .feature {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .feature h3 {
            color: #667eea;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Turbo Map</h1>
            <p>High-performance, type-safe Map implementation supporting complex nested objects as keys</p>
        </div>
        
        <div class="content">
            <h2>Features</h2>
            <div class="features">
                <div class="feature">
                    <h3>⚡ High Performance</h3>
                    <p>Optimized for speed and memory efficiency</p>
                </div>
                <div class="feature">
                    <h3>🔒 Type Safe</h3>
                    <p>Full TypeScript support with comprehensive type definitions</p>
                </div>
                <div class="feature">
                    <h3>🔄 ES Map Compatible</h3>
                    <p>Fully compatible with native ES Map API</p>
                </div>
            </div>
            
            <h2>Quick Start</h2>
            <div class="code-block">
                <pre><code>npm install turbo-map

import { TurboMap } from 'turbo-map';

const map = new TurboMap();
map.set({ id: 1, name: 'test' }, 'value');
console.log(map.get({ id: 1, name: 'test' })); // 'value'</code></pre>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://github.com/chenfangyin/turbo-map" class="btn">View on GitHub</a>
                <a href="https://www.npmjs.com/package/turbo-map" class="btn">View on npm</a>
            </div>
        </div>
    </div>
</body>
</html>`;
  
  const indexPath = path.join(__dirname, '..', 'docs-site', 'index.html');
  fs.writeFileSync(indexPath, indexHtml);
  console.log('  ✅ 创建主页 index.html');
}

function showNextSteps() {
  // 获取真实的仓库信息
  let repositoryUrl = '';
  let pagesUrl = '';
  
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.repository && packageJson.repository.url) {
      // 从 package.json 的 repository.url 获取信息
      const repoUrl = packageJson.repository.url;
      const match = repoUrl.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
      
      if (match) {
        const [, username, repoName] = match;
        repositoryUrl = `https://github.com/${username}/${repoName}`;
        pagesUrl = `https://${username}.github.io/${repoName}`;
      }
    }
  } catch (error) {
    // 如果无法获取，使用默认值
    console.log('  ⚠️  无法从 package.json 获取仓库信息，使用默认值');
  }
  
  // 如果没有获取到，使用环境变量或默认值
  if (!repositoryUrl) {
    const githubRepo = process.env.GITHUB_REPOSITORY || 'chenfangyin/turbo-map';
    const [username, repoName] = githubRepo.split('/');
    repositoryUrl = `https://github.com/${username}/${repoName}`;
    pagesUrl = `https://${username}.github.io/${repoName}`;
  }
  
  console.log('\n📝 下一步操作:');
  console.log('');
  console.log('1. 🔧 在 GitHub 仓库中启用 Pages:');
  console.log('   - 打开仓库 Settings > Pages');
  console.log('   - Source 选择 "GitHub Actions"');
  console.log('');
  console.log('2. 🔐 配置环境变量:');
  console.log('   - 在 Settings > Secrets and variables > Actions');
  console.log('   - 添加 NPM_TOKEN (如果需要发布)');
  console.log('');
  console.log('3. 🚀 触发部署:');
  console.log('   - 推送代码到 main 分支');
  console.log('   - 或在 Actions 中手动运行 "Deploy Documentation"');
  console.log('');
  console.log('4. 🌐 访问你的站点:');
  console.log(`   - 仓库地址: ${repositoryUrl}`);
  console.log(`   - 文档站点: ${pagesUrl}`);
  console.log('   - 无需自定义域名，完全免费');
  console.log('');
  console.log('📚 详细说明请查看: GITHUB-PAGES-SETUP.md');
}

function main() {
  try {
    // 检查前置条件
    const prerequisitesMet = checkPrerequisites();
    
    if (!prerequisitesMet) {
      console.log('\n❌ 前置条件检查失败，请先完成基本设置');
      process.exit(1);
    }
    
    // 创建文档站点
    createDocsSite();
    
    // 显示下一步操作
    showNextSteps();
    
    console.log('\n🎉 GitHub Pages 设置向导完成！');
    
  } catch (error) {
    console.error('\n❌ 设置过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行设置向导
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('setup-github-pages.js')) {
  main();
} 
