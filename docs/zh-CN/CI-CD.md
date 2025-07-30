# CI/CD 和发布指南

本文档介绍如何设置和使用 Turbo Map 项目的 CI/CD 流程。

## 概述

项目包含以下自动化流程：

- **CI/CD 流水线** - 代码质量检查和测试
- **自动发布** - 发布到 npm 和 GitHub Releases
- **文档部署** - 自动部署文档到 GitHub Pages
- **依赖更新** - 自动更新依赖

## 工作流文件

### 1. CI/CD 流水线 (`.github/workflows/ci.yml`)

这个工作流在每次推送到 `main` 或 `develop` 分支时运行，包含：

- **多版本测试** - 在 Node.js 16, 18, 20 上运行测试
- **代码质量检查** - ESLint 和 TypeScript 类型检查
- **安全审计** - npm 安全漏洞检查
- **构建测试** - 验证构建输出
- **性能测试** - 运行基准测试
- **包大小检查** - 监控包大小

### 2. 发布工作流 (`.github/workflows/release.yml`)

当推送版本标签时自动触发：

- 运行完整的测试套件
- 构建项目
- 发布到 npm
- 创建 GitHub Release
- 上传发布资源

### 3. 版本管理 (`.github/workflows/version.yml`)

自动版本管理：

- 支持手动触发版本更新
- 自动创建标签和发布
- 生成发布说明

### 4. 文档部署 (`.github/workflows/deploy-docs.yml`)

自动部署文档到 GitHub Pages：

- 构建项目
- 创建文档站点
- 部署到 GitHub Pages

### 5. Dependabot 配置 (`.github/dependabot.yml`)

自动依赖更新：

- 每周检查 npm 依赖更新
- 每周检查 GitHub Actions 更新
- 自动创建 PR

## 设置步骤

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 secrets：

```bash
# NPM 发布令牌
NPM_TOKEN=your_npm_token_here

# GitHub 令牌 (通常自动提供)
GITHUB_TOKEN=your_github_token_here
```

### 2. 启用 GitHub Pages

1. 进入仓库设置
2. 找到 "Pages" 选项
3. 选择 "GitHub Actions" 作为源
4. 保存设置

### 3. 配置 Dependabot

Dependabot 配置已包含在 `.github/dependabot.yml` 中，会自动：

- 每周检查依赖更新
- 创建更新 PR
- 自动合并补丁版本更新

## 发布流程

### 自动发布

1. **创建版本标签**：
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

2. **使用发布脚本**：
   ```bash
   npm run release:patch  # 补丁版本
   npm run release:minor  # 次要版本
   npm run release:major  # 主要版本
   ```

3. **手动触发发布**：
   - 进入 GitHub Actions
   - 选择 "Version Management" 工作流
   - 点击 "Run workflow"
   - 选择版本类型

### 手动发布

```bash
# 运行完整发布流程
npm run release

# 或指定版本类型
npm run release:patch
npm run release:minor
npm run release:major
```

## 监控和调试

### 查看工作流状态

1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 查看各个工作流的状态

### 常见问题

1. **发布失败**：
   - 检查 NPM_TOKEN 是否正确设置
   - 确保版本号没有冲突
   - 验证所有测试通过

2. **构建失败**：
   - 检查 TypeScript 类型错误
   - 验证 ESLint 规则
   - 确保所有依赖正确安装

3. **测试失败**：
   - 查看测试日志
   - 检查测试环境配置
   - 验证测试覆盖率

## 最佳实践

1. **提交前检查**：
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

2. **版本管理**：
   - 使用语义化版本控制
   - 及时更新 CHANGELOG.md
   - 为每个版本添加清晰的发布说明

3. **依赖管理**：
   - 定期检查依赖更新
   - 及时处理安全漏洞
   - 测试依赖更新

4. **文档维护**：
   - 保持文档与代码同步
   - 及时更新 API 文档
   - 添加使用示例

## 故障排除

### 工作流失败

1. 检查 GitHub Actions 日志
2. 验证 secrets 配置
3. 确认权限设置

### 发布问题

1. 检查 npm 账户权限
2. 验证包名称唯一性
3. 确认版本号格式

### 文档部署问题

1. 检查 GitHub Pages 设置
2. 验证构建输出
3. 确认文件路径正确

## 联系支持

如果遇到问题，请：

1. 查看 GitHub Issues
2. 检查工作流日志
3. 提交详细的错误报告

---

更多信息请参考 [GitHub Actions 文档](https://docs.github.com/en/actions) 和 [npm 发布指南](https://docs.npmjs.com/cli/v8/commands/npm-publish)。 
