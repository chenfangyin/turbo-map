<div align="center">
  <img src="assets/logo.svg" alt="TurboMap Logo" width="128" height="128">
</div>

# 🚀 TurboMap - Turbocharged Mapping Tool

> High-performance, type-safe Map implementation that supports complex nested objects as keys, fully compatible with ES Map API

[![CI/CD](https://github.com/chenfangyin/turbo-map/workflows/CI%2FCD/badge.svg)](https://github.com/chenfangyin/turbo-map/actions)
[![Release](https://github.com/chenfangyin/turbo-map/workflows/Release/badge.svg)](https://github.com/chenfangyin/turbo-map/actions)
[![Deploy Docs](https://github.com/chenfangyin/turbo-map/workflows/Deploy%20Documentation/badge.svg)](https://github.com/chenfangyin/turbo-map/actions)
[![npm version](https://badge.fury.io/js/turbo-map.svg)](https://badge.fury.io/js/turbo-map)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Test Coverage](https://img.shields.io/badge/Test%20Coverage-62.29%25-brightgreen.svg)](https://github.com/chenfangyin/turbo-map)
[![Code Quality](https://img.shields.io/badge/Code%20Quality-A%2B-brightgreen.svg)](https://github.com/chenfangyin/turbo-map)

## 📊 Project Status

- ✅ **Test Coverage**: 62.29% (197 tests all passing)
- ✅ **Code Quality**: ESLint and TypeScript checks passed
- ✅ **Build System**: Supports CommonJS, ESM, UMD formats
- ✅ **CI/CD**: Complete automation pipeline
- ✅ **Script Optimization**: All scripts functional and non-redundant
- ✅ **Security Audit**: Security checks passed
- ✅ **Performance Testing**: Benchmark tests running normally

## Documentation

- [Developer Documentation](https://chenfangyin.github.io/turbo-map/) *(Recommended)*
- [English Documentation](./docs/en/README.md)
- [简体中文文档](./docs/zh-CN/README.md)
- [繁體中文文檔](./docs/zh-TW/README.md)
- [日本語ドキュメント](./docs/ja/README.md)

## Installation

### System Requirements
- Node.js >= 18.0.0
- TypeScript >= 4.0.0 (recommended)

### Package Managers

```bash
# npm
npm install turbo-map

# yarn
yarn add turbo-map

# pnpm
pnpm add turbo-map

# bun
bun add turbo-map

# deno
import { createTurboMap } from "npm:turbo-map"

# Direct from GitHub
npm install github:chenfangyin/turbo-map
yarn add github:chenfangyin/turbo-map
pnpm add github:chenfangyin/turbo-map
bun add github:chenfangyin/turbo-map
```

### Browser Usage (CDN)

```html
<!-- ES modules -->
<script type="module">
  import { createTurboMap } from 'https://unpkg.com/turbo-map@latest/dist/index.esm.js'
  
  const userMap = createTurboMap()
  userMap.set({ id: 1, name: 'Alice' }, 'User details')
</script>

<!-- UMD module -->
<script src="https://unpkg.com/turbo-map@latest/dist/index.umd.js"></script>
<script>
  const userMap = TurboMap.createTurboMap()
  userMap.set({ id: 1, name: 'Alice' }, 'User details')
</script>
```

## Quick Start

```typescript
// Named import (recommended)
import { createTurboMap } from 'turbo-map'

const userMap = createTurboMap<{ id: number; name: string }, string>()

userMap.set({ id: 1, name: "Alice" }, "User 1 details")
console.log(userMap.get({ id: 1, name: "Alice" })) // "User 1 details"

// Fully compatible with ES Map API
for (const [key, value] of userMap) {
  console.log(`${key.name}: ${value}`)
}
```

## ✨ Core Features

### 🚀 Turbo Performance
- **3-5x Performance Boost**: LRU cache, fast hash paths, object pool optimization
- **Smart Memory Management**: Automatic cache cleanup, memory leak prevention
- **Performance Monitoring**: Built-in performance metrics and debugging tools

### 🔐 Complete Type Safety
- **TypeScript-First**: All operations maintain original key types
- **Smart Type Inference**: Automatic key-value type inference
- **Compile-Time Checking**: Catch type errors early

### 🔄 Deep Object Comparison
- **Arbitrary Nesting Levels**: Support complex nested objects as keys
- **Circular Reference Handling**: Safely handle circular references between objects
- **Special Type Support**: Date, RegExp, Array, Function, etc.

### 🎯 ES Map Full Compatibility
- **Symbol.iterator**: Support `for...of` loops
- **Symbol.toStringTag**: Correct `toString()` behavior
- **Constructor Overloading**: Support `new Map(entries)` syntax
- **All Standard Methods**: `set`, `get`, `has`, `delete`, `clear`, etc.

### 🔌 Plugin Architecture
- **Hook System**: Support `beforeSet`, `afterGet`, etc. hooks
- **Custom Behavior**: Extensible and customizable operations
- **Plugin Management**: Dynamic plugin addition and removal

### 🚀 Advanced Features
- **Async Operations**: Non-blocking batch operations and streaming
- **Error Recovery**: Robust error handling with fallback mechanisms
- **Diagnostics**: Performance profiling and memory analysis
- **Tiered Caching**: Multi-level cache system for optimal performance

## 📦 Release Process

### ⚠️ Important Notice
**Only tag pushes trigger npm releases!**
- ✅ **Will trigger**: `git push origin v1.0.1` (version tag)
- ❌ **Won't trigger**: `git push origin main` (regular push)
- ❌ **Won't trigger**: `git push origin feature-branch` (feature branch)

### Release Methods
1. **Automatic Release**: Push version tag to trigger GitHub Actions
2. **Manual Release**: Use `npm run release:patch/minor/major`
3. **Direct Publish**: Use `npm publish` (not recommended)

### Security Mechanisms
- **Pre-publish Checks**: Tests, builds, security audits
- **Rollback Support**: Automatic error recovery and rollback
- **Version Validation**: Semantic versioning enforcement
- **Quality Gates**: Multiple validation layers

### Release Checklist
- [ ] All tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] Type checking passed (`npm run type-check`)
- [ ] Security check passed (`npm run security:check`)
- [ ] CI/CD configuration validated (`npm run ci:test`)
- [ ] Version number correctly updated
- [ ] CHANGELOG.md updated
- [ ] Commit messages follow conventions

## 📄 License

MIT License

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

### Related Links
- 📖 [Full Documentation](https://github.com/chenfangyin/turbo-map)
- 🐛 [Issue Reports](https://github.com/chenfangyin/turbo-map/issues)
- 💡 [Feature Suggestions](https://github.com/chenfangyin/turbo-map/discussions)
- 📦 [npm Package](https://www.npmjs.com/package/turbo-map)
- 📊 [Performance Benchmarks](https://github.com/chenfangyin/turbo-map#performance)

### Related Projects
- 🔗 [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- 🔗 [Rollup](https://rollupjs.org/) - Module bundler
- 🔗 [Jest](https://jestjs.io/) - Testing framework

---

**🚀 TurboMap - Making object key mapping simple and efficient!**

**Ivan Chen** - [GitHub](https://github.com/chenfangyin) - [Email](mailto:fangyin.chen@gmail.com)

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

- [Report Issues](https://github.com/chenfangyin/turbo-map/issues)
- [Submit Pull Requests](https://github.com/chenfangyin/turbo-map/pulls)

---

**🚀 TurboMap - Making object key mapping simple and efficient!**
