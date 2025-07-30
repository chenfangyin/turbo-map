# 🔧 环境变量和配置管理

## 📋 概述

Turbo Map 项目使用统一的环境变量和配置文件管理系统，确保所有 tokens 和配置的安全性和一致性。

## 🗂️ 文件结构

```
turbo-map/
├── env.example              # 环境变量示例文件
├── .env                     # 本地环境变量文件 (不提交到Git)
├── config/
│   └── ci-config.json      # CI/CD 配置文件
└── scripts/
    └── config-manager.js    # 配置管理器
```

## 🔧 配置系统

### 1. 环境变量文件

#### env.example
包含所有可配置的环境变量示例：

```bash
# NPM 配置
NPM_TOKEN=npm_xxxxxxxxxxxxxxxx
NPM_REGISTRY=https://registry.npmjs.org/
NPM_SCOPE=@your-scope

# GitHub 配置
GITHUB_TOKEN=ghs_xxxxxxxxxxxxxxxx
GITHUB_REPOSITORY=chenfangyin/turbo-map
GITHUB_ACTOR=chenfangyin

# 发布配置
RELEASE_CHANNEL=stable
AUTO_PUBLISH=true
DRY_RUN=false
```

#### .env (本地开发)
从 `env.example` 复制并填入实际值：

```bash
# 复制示例文件
cp env.example .env

# 编辑 .env 文件，填入实际值
NPM_TOKEN=npm_your_actual_token_here
GITHUB_TOKEN=ghs_your_actual_token_here
```

### 2. 配置文件

#### config/ci-config.json
统一的 CI/CD 配置文件，支持环境变量插值：

```json
{
  "npm": {
    "token": "${NPM_TOKEN}",
    "registry": "${NPM_REGISTRY}",
    "scope": "${NPM_SCOPE}"
  },
  "github": {
    "token": "${GITHUB_TOKEN}",
    "repository": "${GITHUB_REPOSITORY}"
  },
  "release": {
    "channel": "${RELEASE_CHANNEL}",
    "autoPublish": "${AUTO_PUBLISH}"
  }
}
```

## 🛠️ 配置管理器

### 安装依赖

```bash
npm install
```

### 使用配置管理器

#### 1. 生成环境变量文件

```bash
npm run config:generate-env
```

这会从 `env.example` 创建 `.env` 文件。

#### 2. 验证配置

```bash
npm run config:validate
```

检查所有必需的环境变量是否已设置。

#### 3. 查看配置状态

```bash
npm run config:secrets
```

显示所有环境变量的状态：
```
✅ NPM_TOKEN (必需)
✅ GITHUB_TOKEN (必需)
⚠️  SLACK_WEBHOOK_URL (可选)
```

#### 4. 显示当前配置

```bash
npm run config:show
```

显示解析后的完整配置。

#### 5. 获取特定配置值

```bash
npm run config:get npm.token
npm run config:get release.channel
```

## 🔐 安全最佳实践

### 1. 环境变量管理

#### 本地开发
- 使用 `.env` 文件存储本地环境变量
- 确保 `.env` 文件已添加到 `.gitignore`
- 定期更新 `env.example` 以反映新的配置选项

#### 生产环境
- 使用 GitHub Secrets 存储敏感信息
- 不要在代码中硬编码任何 tokens
- 定期轮换 tokens

### 2. 配置验证

#### 必需的环境变量
```json
{
  "secrets": {
    "required": ["NPM_TOKEN", "GITHUB_TOKEN"],
    "optional": ["SLACK_WEBHOOK_URL", "DISCORD_WEBHOOK_URL"]
  }
}
```

#### 验证流程
1. 检查必需的环境变量是否存在
2. 验证配置文件的完整性
3. 确保所有配置节都存在

### 3. 错误处理

配置管理器包含完整的错误处理：

```javascript
// 验证配置
if (!configManager.validateConfig()) {
  console.error('❌ 配置验证失败');
  process.exit(1);
}

// 获取配置值（带默认值）
const token = configManager.get('npm.token', 'default-token');
```

## 🔄 工作流集成

### GitHub Actions 中的使用

```yaml
- name: Publish to npm
  run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
    NPM_REGISTRY: ${{ secrets.NPM_REGISTRY || 'https://registry.npmjs.org/' }}
    NPM_SCOPE: ${{ secrets.NPM_SCOPE || '' }}
```

### 发布脚本中的使用

```javascript
// 在发布脚本中验证配置
if (!configManager.validateConfig()) {
  console.error('❌ 配置验证失败，请检查环境变量设置');
  process.exit(1);
}

// 获取发布配置
const releaseConfig = configManager.get('release');
console.log('📋 发布配置:', JSON.stringify(releaseConfig, null, 2));
```

## 📊 配置监控

### 1. 配置状态检查

```bash
# 检查所有配置
npm run config:validate

# 查看环境变量状态
npm run config:secrets
```

### 2. 配置变更通知

当配置发生变更时，系统会：

1. 验证新配置的有效性
2. 检查必需的环境变量
3. 通知相关人员（如果配置了通知）

### 3. 配置备份

建议定期备份重要的配置：

```bash
# 备份当前配置
cp .env .env.backup.$(date +%Y%m%d)

# 恢复配置
cp .env.backup.20241201 .env
```

## 🆘 故障排除

### 常见问题

#### 1. 环境变量未设置

**错误**：`❌ 缺少必需的环境变量: NPM_TOKEN`

**解决方案**：
```bash
# 生成 .env 文件
npm run config:generate-env

# 编辑 .env 文件，填入实际值
nano .env
```

#### 2. 配置文件损坏

**错误**：`❌ 加载配置文件失败: Unexpected token`

**解决方案**：
```bash
# 检查 JSON 语法
node -e "JSON.parse(require('fs').readFileSync('config/ci-config.json', 'utf8'))"

# 重新生成配置文件
# 从备份恢复或重新创建
```

#### 3. 权限问题

**错误**：`npm ERR! 401 Unauthorized`

**解决方案**：
1. 检查 NPM_TOKEN 是否正确
2. 确认 token 有发布权限
3. 验证包名称是否可用

### 调试技巧

#### 1. 启用调试模式

```bash
DEBUG=true npm run config:show
```

#### 2. 详细日志

```bash
VERBOSE_LOGGING=true npm run config:validate
```

#### 3. 检查特定配置

```bash
npm run config:get npm.token
npm run config:get github.repository
```

## 📚 相关文档

- [环境变量设置指南](../GITHUB-TOKEN-SETUP.md)
- [CI/CD 配置文档](./CI-CD.md)
- [快速设置指南](../SETUP.md)

## 🔗 外部资源

- [dotenv 文档](https://github.com/motdotla/dotenv)
- [GitHub Secrets 文档](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [npm Access Tokens](https://docs.npmjs.com/about-access-tokens)

---

**✅ 使用统一的配置管理系统，确保您的项目配置安全、一致且易于维护！** 
