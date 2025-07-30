# TurboMap

> High-performance, type-safe Map implementation that supports complex nested objects as keys, fully compatible with ES Map API

[![CI/CD](https://github.com/chenfangyin/turbo-map/workflows/ci/badge.svg)](https://github.com/chenfangyin/turbo-map/actions)
[![Release](https://github.com/chenfangyin/turbo-map/workflows/release/badge.svg)](https://github.com/chenfangyin/turbo-map/actions)
[![npm version](https://badge.fury.io/js/turbo-map.svg)](https://badge.fury.io/js/turbo-map)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Documentation

- [English Documentation](./docs/en/README.md) *(Recommended)*
- [简体中文文档](./docs/zh-CN/README.md)
- [繁體中文文檔](./docs/zh-TW/README.md)
- [日本語ドキュメント](./docs/ja/README.md)

## Installation

### System Requirements
- Node.js >= 14.0.0
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

## Features

- 🚀 **3-5x Performance Boost**: LRU cache, fast hash paths, object pool optimization
- 🔐 **Complete Type Safety**: TypeScript-first, compile-time checking
- 🔄 **Deep Object Comparison**: Support arbitrary nesting levels, circular reference handling
- 🎯 **ES Map Full Compatibility**: Symbol.iterator, Symbol.toStringTag, constructor overloading
- 🔌 **Plugin Architecture**: Hook system, custom behavior, plugin management

## License

MIT License

## Author

**Ivan Chen** - [GitHub](https://github.com/chenfangyin) - [Email](mailto:fangyin.chen@gmail.com)

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

- [Report Issues](https://github.com/chenfangyin/turbo-map/issues)
- [Submit Pull Requests](https://github.com/chenfangyin/turbo-map/pulls)

---

**🚀 TurboMap - Making object key mapping simple and efficient!**
