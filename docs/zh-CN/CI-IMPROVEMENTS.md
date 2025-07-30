# CI/CD 改進指南

本文檔介紹了對 Turbo Map 項目 CI/CD 系統的最新改進。

## 🚀 新增功能

### 1. 增強的錯誤處理

#### Dependabot 自動合併改進
- 添加了更好的錯誤處理機制
- 自動合併失敗時不會中斷工作流
- 提供詳細的狀態日誌

```yaml
- name: Enable auto-merge for Dependabot PRs
  if: steps.metadata.outputs.update-type == 'version-update:semver-patch'
  run: |
    if gh pr merge --auto --merge "$PR_URL"; then
      echo "✅ Auto-merge successful for patch update"
    else
      echo "⚠️ Auto-merge failed, manual review required"
      echo "This is normal for some PRs that require manual approval"
      exit 0  # Don't fail the workflow
    fi
```

#### NPM 發布錯誤處理
- 添加了發布失敗的詳細錯誤信息
- 提供常見問題的解決方案提示

```yaml
- name: Publish to npm
  run: |
    if npm publish; then
      echo "✅ Successfully published to npm"
    else
      echo "❌ Failed to publish to npm"
      echo "This might be due to:"
      echo "- Invalid NPM_TOKEN"
      echo "- Version already exists"
      echo "- Insufficient permissions"
      exit 1
    fi
```

### 2. 通知系統

#### Slack 通知
- 工作流失敗時自動發送 Slack 通知
- 可選的通知配置

```yaml
- name: Notify on failure (Slack)
  if: failure() && secrets.SLACK_WEBHOOK_URL
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
    channel: '#ci-cd'
    username: 'CI/CD Bot'
    icon_emoji: ':warning:'
```

#### Discord 通知
- 支持 Discord Webhook 通知
- 失敗和成功狀態通知
- 豐富的嵌入消息格式

```yaml
- name: Notify on failure (Discord)
  if: failure() && secrets.DISCORD_WEBHOOK_URL
  run: |
    curl -H "Content-Type: application/json" \
         -d '{
           "embeds": [{
             "title": "❌ CI/CD Pipeline Failed",
             "description": "The CI/CD pipeline for turbo-map has failed.",
             "color": 15158332,
             "fields": [
               {
                 "name": "Repository",
                 "value": "${{ github.repository }}",
                 "inline": true
               },
               {
                 "name": "Branch",
                 "value": "${{ github.ref_name }}",
                 "inline": true
               },
               {
                 "name": "Commit",
                 "value": "${{ github.sha }}",
                 "inline": true
               }
             ],
             "timestamp": "${{ github.event.head_commit.timestamp }}"
           }]
         }' \
         ${{ secrets.DISCORD_WEBHOOK_URL }}
```

### 3. 改進的版本管理

#### Pull Request 流程
- 版本更新現在使用 Pull Request 流程
- 提供更好的審核和審查機制
- 自動生成詳細的 PR 描述

```yaml
- name: Create Release Pull Request
  run: |
    # Create a new branch for the release
    git checkout -b "release/v${{ steps.bump.outputs.new_version }}"
    
    # Push the branch and create PR
    git push origin "release/v${{ steps.bump.outputs.new_version }}"
    
    # Create Pull Request using GitHub CLI
    gh pr create \
      --title "Release v${{ steps.bump.outputs.new_version }}" \
      --body "## Release v${{ steps.bump.outputs.new_version }}"
```

### 4. CI/CD 狀態檢查工具

#### 新增腳本
- `npm run ci:status` - 檢查 CI/CD 配置狀態
- `npm run ci:check` - 同義命令

#### 功能特性
- 驗證所有工作流文件
- 檢查 package.json 腳本
- 驗證必需的 secrets 配置
- 生成詳細的狀態報告

```bash
npm run ci:status
```

輸出示例：
```
🔧 CI/CD Configuration Status Report
=====================================

📋 Workflow Files:
  ✅ .github/workflows/ci.yml - CI/CD
     Jobs: test, security, bundle-size, performance
  ✅ .github/workflows/release.yml - Release
     Jobs: release
  ✅ .github/workflows/deploy-docs.yml - Deploy Documentation
     Jobs: deploy

📦 Package.json Scripts:
  ✅ All required scripts present
     Found: build, test, test:ci, lint, type-check, benchmark

🔐 Required Secrets:
  Required: NPM_TOKEN, GITHUB_TOKEN
  Optional: SLACK_WEBHOOK_URL, DISCORD_WEBHOOK_URL, NPM_REGISTRY, NPM_SCOPE

📁 Additional Files:
  ✅ .github/dependabot.yml
  ✅ config/ci-config.json
  ✅ env.example

📊 Summary:
  Workflows: 5/5 valid
  Scripts: All present

🎉 CI/CD configuration is ready!
```

### 5. 增強的 README 徽章

#### 新增徽章
- Deploy Docs 工作流狀態
- TypeScript 版本
- Node.js 版本要求

```markdown
[![CI/CD](https://github.com/chenfangyin/turbo-map/workflows/CI%2FCD/badge.svg)](https://github.com/chenfangyin/turbo-map/actions)
[![Release](https://github.com/chenfangyin/turbo-map/workflows/Release/badge.svg)](https://github.com/chenfangyin/turbo-map/actions)
[![Deploy Docs](https://github.com/chenfangyin/turbo-map/workflows/Deploy%20Documentation/badge.svg)](https://github.com/chenfangyin/turbo-map/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
```

## 🔧 設置指南

### 1. 配置通知

#### Slack 設置
1. 創建 Slack App
2. 獲取 Webhook URL
3. 添加到 GitHub Secrets: `SLACK_WEBHOOK_URL`

#### Discord 設置
1. 創建 Discord Webhook
2. 獲取 Webhook URL
3. 添加到 GitHub Secrets: `DISCORD_WEBHOOK_URL`

### 2. 運行狀態檢查

```bash
# 檢查 CI/CD 配置狀態
npm run ci:status

# 驗證環境變量配置
npm run config:validate

# 檢查 secrets 狀態
npm run config:secrets
```

### 3. 測試工作流

```bash
# 本地測試構建
npm run build

# 本地測試
npm run test:ci

# 本地類型檢查
npm run type-check

# 本地代碼檢查
npm run lint
```

## 📊 監控和調試

### 1. 工作流監控
- 使用 GitHub Actions 頁面監控工作流執行
- 查看詳細的執行日誌
- 監控通知發送狀態

### 2. 常見問題

#### 通知未發送
- 檢查 Webhook URL 是否正確
- 確認 secrets 已正確設置
- 查看工作流日誌中的錯誤信息

#### 自動合併失敗
- 檢查分支保護規則
- 確認 GitHub Token 權限
- 查看 PR 狀態

#### 發布失敗
- 檢查 NPM_TOKEN 是否有效
- 確認版本號不重複
- 驗證包名稱和權限

## 🎯 最佳實踐

### 1. 通知配置
- 使用不同的通知渠道作為備選
- 設置適當的通知頻率
- 配置有針對性的通知內容

### 2. 錯誤處理
- 提供詳細的錯誤信息
- 使用 `continue-on-error: true` 避免工作流中斷
- 記錄關鍵操作狀態

### 3. 版本管理
- 使用語義化版本控制
- 為每個版本添加清晰的發布說明
- 定期檢查和更新依賴

## 📚 相關文檔

- [CI/CD 配置文檔](./CI-CD.md)
- [環境變量配置](./ENV-CONFIG.md)
- [GitHub Token 設置指南](../../GITHUB-TOKEN-SETUP.md)
- [快速設置指南](../../SETUP.md)

---

**🎉 這些改進讓您的 CI/CD 系統更加健壯和用戶友好！** 
