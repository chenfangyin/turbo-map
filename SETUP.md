# 快速设置指南 - GitHub 发布和 CI/CD

## 🚀 快速开始

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 secrets：

1. 进入仓库设置 → Secrets and variables → Actions
2. 添加以下 secrets：

```bash
NPM_TOKEN=your_npm_token_here
```

**获取 NPM_TOKEN：**
1. 登录 npmjs.com
2. 进入 Account Settings → Access Tokens
3. 创建新的 "Automation" token
4. 复制 token 并添加到 GitHub secrets

### 2. 启用 GitHub Pages

1. 进入仓库设置 → Pages
2. Source 选择 "GitHub Actions"
3. 保存设置

### 3. 测试 CI/CD 流程

推送代码到 main 分支：

```bash
git add .
git commit -m "feat: add CI/CD configuration"
git push origin main
```

检查 GitHub Actions 是否正常运行。

## 📦 发布流程

### 自动发布（推荐）

使用发布脚本：

```bash
# 补丁版本 (1.0.0 → 1.0.1)
npm run release:patch

# 次要版本 (1.0.0 → 1.1.0)
npm run release:minor

# 主要版本 (1.0.0 → 2.0.0)
npm run release:major
```

### 手动发布

1. 创建版本标签：
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

2. 手动触发发布：
   - 进入 GitHub Actions
   - 选择 "Version Management"
   - 点击 "Run workflow"
   - 选择版本类型

## 🔧 工作流说明

### CI/CD 流水线
- **触发条件**：推送到 main/develop 分支
- **功能**：测试、构建、安全检查
- **文件**：`.github/workflows/ci.yml`

### 自动发布
- **触发条件**：推送版本标签
- **功能**：发布到 npm + GitHub Releases
- **文件**：`.github/workflows/release.yml`

### 版本管理
- **触发条件**：推送到 main 分支或手动触发
- **功能**：自动版本更新和发布
- **文件**：`.github/workflows/version.yml`

### 文档部署
- **触发条件**：推送到 main 分支
- **功能**：部署文档到 GitHub Pages
- **文件**：`.github/workflows/deploy-docs.yml`

## 📋 检查清单

### 发布前检查

- [ ] 所有测试通过
- [ ] 代码质量检查通过
- [ ] 类型检查通过
- [ ] 构建成功
- [ ] 更新 CHANGELOG.md
- [ ] 版本号正确

### 发布后检查

- [ ] npm 包发布成功
- [ ] GitHub Release 创建成功
- [ ] 文档部署成功
- [ ] 标签推送成功

## 🐛 常见问题

### 发布失败

1. **NPM_TOKEN 错误**：
   - 检查 token 是否正确
   - 确认 token 有发布权限

2. **版本冲突**：
   - 检查版本号是否已存在
   - 使用更高的版本号

3. **构建失败**：
   - 检查 TypeScript 错误
   - 验证依赖安装

### 工作流失败

1. **权限问题**：
   - 检查 GitHub token 权限
   - 确认仓库设置正确

2. **环境问题**：
   - 检查 Node.js 版本兼容性
   - 验证依赖版本

## 📚 更多资源

- [详细文档](./docs/zh-CN/CI-CD.md)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [npm 发布指南](https://docs.npmjs.com/cli/v8/commands/npm-publish)

## 🆘 获取帮助

如果遇到问题：

1. 查看 GitHub Actions 日志
2. 检查 [Issues](../../issues)
3. 提交详细的错误报告

---

**注意**：首次设置后，建议先进行测试发布，确保所有配置正确。 
