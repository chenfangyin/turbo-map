# 🔑 GitHub Token 设置指南

## 📋 概述

为了使用 CI/CD 功能，您需要配置以下 tokens：

1. **NPM_TOKEN** - 用于发布到 npm
2. **GITHUB_TOKEN** - 通常自动提供，用于 GitHub Actions

## 🔧 NPM Token 设置

### 1. 获取 NPM Token

#### 方法一：通过 npmjs.com 网站

1. **登录 npmjs.com**
   - 访问 [https://npmjs.com](https://npmjs.com)
   - 使用您的 npm 账户登录

2. **进入 Token 设置**
   - 点击右上角头像
   - 选择 "Access Tokens"
   - 或直接访问：https://www.npmjs.com/settings/tokens

3. **创建新的 Token**
   - 点击 "Generate New Token"
   - 选择 "Automation" 类型
   - 设置 Token 名称（如：`turbo-map-ci`）
   - 选择权限：
     - ✅ `Publish packages`
     - ✅ `Read packages`
   - 点击 "Generate Token"

4. **复制 Token**
   - 立即复制生成的 token（格式：`npm_xxxxxxxxxxxxxxxx`）
   - ⚠️ **重要**：token 只显示一次，请妥善保存

#### 方法二：通过命令行

```bash
# 登录 npm
npm login

# 创建自动化 token
npm token create --read-only
```

### 2. 配置 GitHub Secrets

1. **进入 GitHub 仓库设置**
   - 访问您的 GitHub 仓库
   - 点击 "Settings" 标签

2. **找到 Secrets 设置**
   - 在左侧菜单中找到 "Secrets and variables"
   - 点击 "Actions"

3. **添加 NPM_TOKEN**
   - 点击 "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: 粘贴您刚才复制的 npm token
   - 点击 "Add secret"

## 🔧 GitHub Token 设置

### 自动 Token（推荐）

GitHub Actions 通常会自动提供 `GITHUB_TOKEN`，无需手动设置。

### 手动设置（如果需要）

1. **生成 Personal Access Token**
   - 访问 [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
   - 点击 "Generate new token (classic)"
   - 选择权限：
     - ✅ `repo` (完整的仓库访问权限)
     - ✅ `workflow` (工作流权限)
     - ✅ `write:packages` (如果需要发布包)
   - 点击 "Generate token"

2. **添加到 Secrets**
   - 在仓库设置中添加 `GITHUB_TOKEN`
   - 或使用自动提供的 token

## 🔍 验证设置

### 1. 检查 Secrets

在 GitHub 仓库设置中确认：

```
✅ NPM_TOKEN = npm_xxxxxxxxxxxxxxxx
✅ GITHUB_TOKEN = ghs_xxxxxxxxxxxxxxxx (自动)
```

### 2. 测试发布

```bash
# 创建测试版本
npm run release:patch

# 或手动触发
git tag v1.0.1
git push origin v1.0.1
```

### 3. 检查工作流

1. 进入 GitHub Actions 页面
2. 查看 "Release" 工作流是否成功运行
3. 检查 npm 包是否发布成功

## 🛠️ 故障排除

### 常见问题

#### 1. NPM 发布失败

**错误信息**：`npm ERR! 401 Unauthorized`

**解决方案**：
- 检查 NPM_TOKEN 是否正确设置
- 确认 token 有发布权限
- 验证包名称是否可用

```bash
# 测试 npm 登录
npm whoami

# 检查 token 权限
npm token list
```

#### 2. GitHub Actions 权限错误

**错误信息**：`Resource not accessible by integration`

**解决方案**：
- 检查仓库权限设置
- 确认 GITHUB_TOKEN 权限
- 验证工作流文件语法

#### 3. Token 过期

**解决方案**：
- 重新生成 npm token
- 更新 GitHub secrets
- 检查 token 有效期

### 安全最佳实践

1. **定期轮换 Token**
   - 每 90 天更新一次 npm token
   - 及时删除不需要的 token

2. **最小权限原则**
   - 只授予必要的权限
   - 使用自动化 token 而非个人 token

3. **安全存储**
   - 不要在代码中硬编码 token
   - 使用 GitHub secrets 存储

4. **监控使用**
   - 定期检查 token 使用情况
   - 监控异常活动

## 📚 相关文档

- [npm Access Tokens 文档](https://docs.npmjs.com/about-access-tokens)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

## 🆘 获取帮助

如果遇到问题：

1. **检查错误日志**
   - 查看 GitHub Actions 详细日志
   - 检查 npm 错误信息

2. **验证配置**
   - 确认所有 secrets 已正确设置
   - 验证权限配置

3. **联系支持**
   - npm 支持：https://docs.npmjs.com/getting-help
   - GitHub 支持：https://support.github.com

---

**✅ 完成这些设置后，您的 CI/CD 流水线就可以正常工作了！** 
