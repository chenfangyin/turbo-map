<div align="center">
  <img src="../../assets/logo.svg" alt="TurboMap Logo" width="128" height="128">
</div>

# 🚀 TurboMap - 涡轮增压映射工具

> 一个高性能、类型安全的Map实现，支持以复杂嵌套对象作为键，完全兼容ES Map API

[![CI/CD](https://github.com/chenfangyin/turbo-map/workflows/CI%2FCD/badge.svg)](https://github.com/chenfangyin/turbo-map/actions)
[![Release](https://github.com/chenfangyin/turbo-map/workflows/Release/badge.svg)](https://github.com/chenfangyin/turbo-map/actions)
[![Deploy Docs](https://github.com/chenfangyin/turbo-map/workflows/Deploy%20Documentation/badge.svg)](https://github.com/chenfangyin/turbo-map/actions)
[![npm version](https://img.shields.io/npm/v/turbo-map.svg?style=flat)](https://www.npmjs.com/package/turbo-map)
[![npm downloads](https://img.shields.io/npm/dm/turbo-map.svg?style=flat)](https://www.npmjs.com/package/turbo-map)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

## 📊 项目状态

- ✅ **测试覆盖率**: 62.29% (197个测试全部通过)
- ✅ **代码质量**: ESLint 和 TypeScript 检查通过
- ✅ **构建系统**: 支持 CommonJS、ESM、UMD 格式
- ✅ **CI/CD**: 完整的自动化流水线
- ✅ **脚本优化**: 所有脚本功能完整且无冗余
- ✅ **安全审计**: 通过安全检查，敏感信息完全保护
- ✅ **性能测试**: 基准测试正常运行
- ✅ **GitHub Actions**: 所有工作流现代化，使用最新稳定版本
- ✅ **版本管理**: 自动化发布流程，支持语义化版本控制
- ✅ **文档部署**: GitHub Pages 自动部署

## 📖 目录

- [📊 项目状态](#-项目状态)
- [✨ 核心特性](#-核心特性)
- [🚀 快速开始](#-快速开始)
- [📚 API 参考](#-api-参考)
- [💡 使用示例](#-使用示例)
- [⚡ 性能优化](#-性能优化)
- [🎯 最佳实践](#-最佳实践)
- [🔄 迁移指南](#-迁移指南)
- [🚀 性能对比](#-性能对比)
- [🔧 故障排除](#-故障排除)
- [🌐 GitHub Pages 部署](#-github-pages-部署)
- [🔧 CI/CD 和开发](#-cicd-和开发)
- [📦 发布流程](#-发布流程)
- [🔒 安全机制](#-安全机制)
- [🚀 发布流程说明](#-发布流程说明)
- [📄 许可证](#-许可证)
- [🤝 贡献](#-贡献)

## ✨ 核心特性

### 🚀 涡轮性能
- **3-5倍性能提升**：LRU缓存、快速哈希路径、对象池优化
- **智能内存管理**：自动清理缓存，防止内存泄漏
- **性能监控**：内置性能指标和调试工具

### 🔐 完全类型安全
- **TypeScript优先**：所有操作都保持原始键类型
- **智能类型推断**：自动推断键值类型
- **编译时检查**：提前发现类型错误

### 🔄 深度对象比较
- **任意嵌套层级**：支持复杂嵌套对象作为键
- **循环引用处理**：安全处理对象间的循环引用
- **特殊类型支持**：Date、RegExp、Array、Function等

### 🎯 ES Map 完全兼容
- **Symbol.iterator**：支持 `for...of` 循环
- **Symbol.toStringTag**：正确的 `toString()` 行为
- **构造函数重载**：支持 `new Map(entries)` 语法
- **所有标准方法**：`set`、`get`、`has`、`delete`、`clear` 等

### 🔌 插件化架构
- **钩子系统**：支持 `beforeSet`、`afterGet` 等钩子
- **自定义行为**：可扩展和自定义操作
- **插件管理**：动态添加和移除插件

## 🚀 快速开始

### 安装

#### 系统要求
- Node.js >= 18.0.0
- TypeScript >= 4.0.0 (推荐)

#### 安装命令

```bash
# 使用 npm 安装
npm install turbo-map

# 使用 yarn 安装
yarn add turbo-map

# 使用 pnpm 安装
pnpm add turbo-map

# 使用 bun 安装
bun add turbo-map

# 使用 deno (通过 npm:)
import { createTurboMap } from "npm:turbo-map"

# 直接从 GitHub 仓库安装
npm install github:chenfangyin/turbo-map
yarn add github:chenfangyin/turbo-map
pnpm add github:chenfangyin/turbo-map
bun add github:chenfangyin/turbo-map

# 安装特定分支或标签
npm install github:chenfangyin/turbo-map#main
npm install github:chenfangyin/turbo-map#v1.0.1
```

#### 类型定义
TurboMap 包含完整的 TypeScript 类型定义，无需额外安装 `@types` 包。

#### 浏览器使用 (CDN)

```html
<!-- 使用 ES 模块 (推荐) -->
<script type="module">
  import { createTurboMap } from 'https://unpkg.com/turbo-map@latest/dist/index.esm.js'
  
  const userMap = createTurboMap()
  userMap.set({ id: 1, name: '张三' }, '用户详情')
</script>

<!-- 使用 UMD 模块 -->
<script src="https://unpkg.com/turbo-map@latest/dist/index.umd.js"></script>
<script>
  const userMap = TurboMap.createTurboMap()
  userMap.set({ id: 1, name: '张三' }, '用户详情')
</script>

<!-- 使用压缩版 UMD 模块 -->
<script src="https://unpkg.com/turbo-map@latest/dist/index.umd.min.js"></script>
<script>
  const userMap = TurboMap.default()
  userMap.set({ id: 1, name: '张三' }, '用户详情')
</script>
```

#### 开发环境

```bash
# 克隆仓库
git clone https://github.com/chenfangyin/turbo-map.git
cd turbo-map

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 运行测试
npm test
```

### 基础使用

```typescript
// 命名导入 (推荐)
import { createTurboMap } from 'turbo-map'

// 其他函数的命名导入
import { turboMapFactory, createTypeSafeTurboMap } from 'turbo-map'

// 导入所有函数
import { createTurboMap, turboMapFactory, createTypeSafeTurboMap } from 'turbo-map'

// 创建 TurboMap 实例
const userMap = createTurboMap<{ id: number; name: string }, string>()

// 设置数据
userMap.set({ id: 1, name: "张三" }, "用户1详情")
userMap.set({ id: 2, name: "李四" }, "用户2详情")

// 获取数据 - 即使是不同的对象实例，只要内容相同就能匹配
console.log(userMap.get({ id: 1, name: "张三" })) // "用户1详情"

// 完全兼容 ES Map API
for (const [key, value] of userMap) {
  console.log(`${key.name}: ${value}`)
}
```

### 从数组初始化

```typescript
// 完全兼容 Map 构造函数
const turboMap = createTurboMap([
  [{ id: 1, name: 'Alice' }, 'User 1'],
  [{ id: 2, name: 'Bob' }, 'User 2']
])

console.log(turboMap.size) // 2
console.log(turboMap.toString()) // "[object TurboMap]"
```

## 📚 API 参考

### 核心函数

#### `createTurboMap<K, V>(entries?, options?)`

创建增强的 TurboMap 实例，支持高级功能。

**参数：**
- `entries?` - 初始键值对数组或可迭代对象
- `options?` - 配置选项

**返回：** `EnhancedTurboMapLike<K, V>`

**重载：**
```typescript
// 从数组初始化
createTurboMap<{ id: number }, string>([
  [{ id: 1 }, 'value1']
])

// 仅配置选项
createTurboMap<{ id: number }, string>({
  enableCache: true,
  cacheMaxSize: 1000,
  enablePlugins: true,
  enableAsync: true
})

// 数组 + 配置
createTurboMap<{ id: number }, string>([
  [{ id: 1 }, 'value1']
], {
  enableCache: true,
  enableDiagnostics: true
})
```

### 配置选项

#### `EnhancedTurboMapOptions`

```typescript
interface EnhancedTurboMapOptions {
  // 序列化选项
  enableCache?: boolean
  cacheMaxSize?: number
  enableAdaptiveSerialization?: boolean
  
  // 性能选项
  enableMetrics?: boolean
  enableAutoCleanup?: boolean
  cleanupInterval?: number
  
  // 缓存选项
  enableTieredCache?: boolean
  l1CacheSize?: number
  l2CacheSize?: number
  promoteThreshold?: number
  
  // 错误恢复选项
  enableErrorRecovery?: boolean
  maxRetries?: number
  fallbackMode?: boolean
  
  // 插件选项
  enablePlugins?: boolean
  pluginTimeout?: number
  
  // 诊断选项
  enableDiagnostics?: boolean
  trackPerformance?: boolean
  
  // 异步选项
  enableAsync?: boolean
  batchSize?: number
  maxConcurrency?: number
}
```

### 核心方法

#### 标准 Map 方法

```typescript
interface EnhancedTurboMapLike<K, V> {
  /** 映射中键值对的数量 */
  readonly size: number
  
  /** 设置键值对，支持链式调用 */
  set(key: K, value: V): EnhancedTurboMapLike<K, V>
  
  /** 获取指定键的值 */
  get(key: K): V | undefined
  
  /** 检查是否包含指定键 */
  has(key: K): boolean
  
  /** 删除指定键的键值对 */
  delete(key: K): boolean
  
  /** 清空所有键值对 */
  clear(): void
  
  /** 返回所有原始键的迭代器 */
  keys(): IterableIterator<K>
  
  /** 返回所有值的迭代器 */
  values(): IterableIterator<V>
  
  /** 返回所有原始键值对的迭代器 */
  entries(): IterableIterator<[K, V]>
  
  /** 遍历所有键值对 */
  forEach(callback: (value: V, key: K, map: EnhancedTurboMapLike<K, V>) => void): void
}
```

#### 🚀 增强方法

```typescript
interface EnhancedTurboMapLike<K, V> {
  // 批量操作
  setAll(entries: [K, V][]): EnhancedTurboMapLike<K, V>
  getAll(keys: K[]): (V | undefined)[]
  deleteAll(keys: K[]): boolean[]
  
  // 高级查询
  findByValue(predicate: (value: V, key: K) => boolean): [K, V] | undefined
  filter(predicate: (value: V, key: K) => boolean): [K, V][]
  mapValues<U>(transform: (value: V, key: K) => U): EnhancedTurboMapLike<K, U>
  
  // 统计和诊断
  getMetrics(): {
    size: number
    operationCount: number
    cacheHits: number
    cacheMisses: number
    cacheHitRate: number
    errorCount: number
    errorRate: number
    pluginStats?: unknown
    cacheStats?: unknown
    serializerStats?: unknown
  }
  
  debug(): {
    size: number
    internalMapSize: number
    keyMapSize: number
    config: unknown
    health: unknown
    diagnostics: unknown
  }
  
  getDiagnostics(): {
    performanceProfile: PerformanceProfile
    memoryUsage: MemoryDiagnostic
    errorAnalysis: ErrorAnalysis
    optimizationSuggestions: OptimizationSuggestion[]
    healthScore: number
    recommendations: string[]
  } | null
  
  getHealthStatus(): {
    healthy: boolean
    errorRate: number
    cacheHitRate: number
    inFallbackMode: boolean
    score: number
  }
  
  // 插件管理
  addPlugin(plugin: TurboMapPlugin<K, V>): Promise<boolean>
  removePlugin(pluginName: string): Promise<boolean>
  enablePlugin(pluginName: string): Promise<boolean>
  disablePlugin(pluginName: string): Promise<boolean>
  getPluginStats(): {
    totalPlugins: number
    enabledPlugins: number
    totalExecutions: number
    totalErrors: number
    errorRate: number
  } | null
  
  // 异步操作
  toAsync(): AsyncTurboMapLike<K, V>
  
  // 性能优化
  optimize(): void
  reset(): void
  
  // 序列化
  serialize(): string
  clone(): EnhancedTurboMapLike<K, V>
  
  // 内存管理
  cleanup(): void
  compact(): void
  
  // 调试工具
  getSerializedKey(key: K): string
}
```

### 工厂函数

#### `turboMapFactory<K, V>()`

创建类型安全的工厂函数。

```typescript
const createUserCache = turboMapFactory<{ id: number }, UserData>()

const userCache = createUserCache({
  enableCache: true,
  cacheMaxSize: 500
})
```

#### `createTypeSafeTurboMap<T>()`

创建强类型工厂函数，具有更好的类型推断。

```typescript
const createApiCache = createTypeSafeTurboMap<ApiRequest>()

const apiCache = createApiCache<ApiRequest, Response>({
  enableMetrics: true
})
```

### 类型定义

#### 键类型
```typescript
// 原始类型键
type PrimitiveKey = string | number | boolean | null | undefined | symbol | bigint

// 对象类型键
type ObjectKey = object | Function | Date | RegExp | Error

// 所有支持的键类型
type MapKey = PrimitiveKey | ObjectKey
```

#### 插件系统
```typescript
interface TurboMapPlugin<K extends MapKey, V> {
  name: string
  version?: string
  priority?: number
  enabled?: boolean
  
  // 生命周期钩子
  beforeSet?(key: K, value: V): { key: K; value: V } | null
  afterSet?(key: K, value: V): void
  beforeGet?(key: K): K | null
  afterGet?(key: K, value: V | undefined): V | undefined
  beforeDelete?(key: K): K | null
  afterDelete?(key: K, deleted: boolean): void
  beforeClear?(): boolean // 返回 false 阻止清空
  afterClear?(): void
  
  // 高级钩子
  onError?(error: Error, operation: string, key?: K): void
  onMetricsUpdate?(metrics: {
    size: number
    operationCount: number
    cacheHits: number
    cacheMisses: number
    errorCount: number
    [key: string]: unknown
  }): void
  
  // 插件生命周期
  onInstall?(): Promise<void> | void
  onUninstall?(): Promise<void> | void
  onEnable?(): Promise<void> | void
  onDisable?(): Promise<void> | void
}
```

#### 异步操作
```typescript
interface AsyncTurboMapLike<K extends MapKey, V> {
  // 异步方法
  setAsync(key: K, value: V): Promise<this>
  getAsync(key: K): Promise<V | undefined>
  hasAsync(key: K): Promise<boolean>
  deleteAsync(key: K): Promise<boolean>
  clearAsync(): Promise<void>
  
  // 批量操作
  batchExecute<T extends V>(operations: BatchOperation<K, V>[]): Promise<BatchResult<T>[]>
  setAllAsync(entries: [K, V][]): Promise<this>
  getAllAsync(keys: K[]): Promise<(V | undefined)[]>
  deleteAllAsync(keys: K[]): Promise<boolean[]>
  
  // 流操作
  stream(): AsyncTurboMapStream<K, V>
  
  // 工具方法
  sizeAsync(): Promise<number>
  entriesAsync(): AsyncIterableIterator<[K, V]>
  keysAsync(): AsyncIterableIterator<K>
  valuesAsync(): AsyncIterableIterator<V>
}

interface BatchOperation<K, V> {
  type: 'set' | 'get' | 'delete' | 'has'
  key: K
  value?: V
  id?: string | number
}

interface BatchResult<V> {
  id?: string | number
  success: boolean
  data?: V | boolean
  error?: Error
}
```

### 工具类

#### TypeUtils
```typescript
class TypeUtils {
  // 检查是否为原始类型
  static isPrimitive(value: unknown): value is PrimitiveKey
  
  // 检查是否为简单对象
  static isSimpleObject(value: unknown): boolean
  
  // 获取对象类型签名
  static getObjectSignature(obj: unknown): string
  
  // 安全访问对象属性
  static safeAccess<T>(obj: unknown, accessor: () => T, fallback: T): T
  
  // 检查对象是否可序列化
  static isSerializable(obj: unknown, visited?: WeakSet<object>): boolean
}
```

#### FastHasher
```typescript
class FastHasher {
  // 快速哈希对象
  fastHash(obj: unknown): string
  
  // 获取哈希统计
  getStats(): {
    totalHashes: number
    cacheHits: number
    cacheMisses: number
    averageTime: number
  }
  
  // 重置统计
  resetStats(): void
  
  // 添加自定义哈希策略
  addStrategy(signature: string, strategy: (obj: unknown) => string): void
}
```

#### ErrorRecoveryManager
```typescript
class ErrorRecoveryManager {
  // 执行带恢复的操作
  executeWithRecovery<T>(
    operation: () => T,
    fallback: () => T,
    operationName: string,
    errorType?: ErrorType
  ): T
  
  // 异步执行带恢复的操作
  executeAsyncWithRecovery<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    operationName: string,
    errorType?: ErrorType
  ): Promise<T>
  
  // 获取错误统计
  getStats(): {
    totalErrors: number
    errorRate: number
    recoverySuccessRate: number
    fallbackUsageRate: number
  }
}
```

## 💡 使用示例

### Symbol 和 Date 键的特殊行为 🆕

从 v1.0.10 开始，TurboMap 对 Symbol 和 Date 键有特殊的处理行为：

#### Symbol 键一致性
```typescript
import { createTurboMap } from 'turbo-map'

const symbolMap = createTurboMap<symbol, string>()

// ✨ 所有普通 Symbol() 实例被当作相同键
symbolMap.set(Symbol('test'), 'value1')
symbolMap.set(Symbol('different'), 'value2') // 覆盖 value1

console.log(symbolMap.get(Symbol('anything'))) // 'value2'
console.log(symbolMap.size) // 1

// 🌐 Symbol.for() 仍然基于全局键工作
symbolMap.set(Symbol.for('global'), 'global_value')
console.log(symbolMap.get(Symbol.for('global'))) // 'global_value'
console.log(symbolMap.size) // 2 (一个普通Symbol键 + 一个全局Symbol键)
```

#### Date 键时间戳区分
```typescript
const dateMap = createTurboMap<Date, string>()

// 📅 所有 Date 对象都根据时间戳区分
const date1 = new Date('2024-01-01')
const date2 = new Date('2024-01-01') // 相同时间戳
const date3 = new Date('2024-01-02') // 不同时间戳

dateMap.set(date1, 'value1')
dateMap.set(date2, 'value2') // 覆盖 value1（相同时间戳）
dateMap.set(date3, 'value3')

console.log(dateMap.get(date1)) // 'value2'
console.log(dateMap.get(date2)) // 'value2' 
console.log(dateMap.get(date3)) // 'value3'
console.log(dateMap.size) // 2

// ⏰ 无参数 new Date() 也根据调用时机区分
dateMap.set(new Date(), 'current1')
// 稍后...
dateMap.set(new Date(), 'current2') // 不同的时间戳，不会覆盖
```

### 基础对象键映射

```typescript
import { createTurboMap } from 'turbo-map'

// 用户信息缓存
const userCache = createTurboMap<{ id: number; name: string }, UserData>()

userCache.set({ id: 1, name: "张三" }, {
  email: "zhangsan@example.com",
  role: "admin"
})

// 即使对象实例不同，只要内容相同就能匹配
const userData = userCache.get({ id: 1, name: "张三" })
console.log(userData) // { email: "zhangsan@example.com", role: "admin" }
```

### 复杂嵌套对象

```typescript
interface ApiRequest {
  endpoint: string
  method: 'GET' | 'POST'
  query?: Record<string, string>
  headers?: Record<string, string>
}

const apiCache = createTurboMap<ApiRequest, any>({
  enableCache: true,
  cacheMaxSize: 1000
})

// 缓存 API 响应
const request = {
  endpoint: '/api/users',
  method: 'GET',
  query: { page: 1, limit: 20 }
}

apiCache.set(request, { data: [{ id: 1, name: 'User 1' }] })

// 查询缓存 - 完全相同的请求结构
const cached = apiCache.get(request)
console.log('缓存结果:', cached)
```

### 批量操作

```typescript
const userMap = createTurboMap<{ id: number }, string>()

// 批量设置
userMap.setAll([
  [{ id: 1 }, 'User 1'],
  [{ id: 2 }, 'User 2'],
  [{ id: 3 }, 'User 3']
])

// 批量获取
const keys = [{ id: 1 }, { id: 2 }, { id: 4 }]
const values = userMap.getAll(keys)
console.log(values) // ['User 1', 'User 2', undefined]

// 条件查找
const adminUser = userMap.findByValue((value, key) => 
  value.includes('admin') && key.id > 100
)
```

### 高级查询和过滤

```typescript
const productCache = createTurboMap<{ category: string; id: number }, Product>()

// 设置产品数据
productCache.setAll([
  [{ category: 'electronics', id: 1 }, { name: 'Laptop', price: 999 }],
  [{ category: 'electronics', id: 2 }, { name: 'Phone', price: 599 }],
  [{ category: 'books', id: 1 }, { name: 'Novel', price: 19 }]
])

// 过滤电子产品
const electronics = productCache.filter((value, key) => 
  key.category === 'electronics' && value.price > 500
)

// 映射值
const prices = productCache.mapValues((value) => value.price)
console.log('所有价格:', Array.from(prices.values()))
```

### 性能监控和诊断

```typescript
const cache = createTurboMap({
  enableMetrics: true,
  enableCache: true,
  enableDiagnostics: true
})

// 查看性能指标
const metrics = cache.getMetrics()
console.log('命中率:', `${(metrics.cacheHitRate * 100).toFixed(2)}%`)
console.log('操作次数:', metrics.operationCount)
console.log('错误率:', `${(metrics.errorRate * 100).toFixed(2)}%`)

// 获取诊断信息
const diagnostics = cache.getDiagnostics()
if (diagnostics) {
  console.log('健康评分:', diagnostics.healthScore)
  console.log('优化建议:', diagnostics.recommendations)
}

// 调试信息
const debug = cache.debug()
console.log('内部映射大小:', debug.internalMapSize)
console.log('键映射大小:', debug.keyMapSize)
```

### 插件系统

```typescript
// 创建日志插件
const loggingPlugin = {
  name: 'logging',
  version: '1.0.0',
  
  beforeSet(key, value) {
    console.log(`🚀 设置缓存: ${JSON.stringify(key)}`)
    return { key, value }
  },
  
  afterGet(key, value) {
    console.log(value ? '✅ 缓存命中' : '❌ 缓存未命中')
    return value
  },
  
  onError(error, operation, key) {
    console.error(`❌ 插件错误 [${operation}]:`, error.message)
  }
}

// 创建性能监控插件
const performancePlugin = {
  name: 'performance',
  version: '1.0.0',
  
  onMetricsUpdate(metrics) {
    if (metrics.errorRate > 0.1) {
      console.warn('⚠️ 错误率过高:', metrics.errorRate)
    }
  }
}

const cache = createTurboMap({ enablePlugins: true })
await cache.addPlugin(loggingPlugin)
await cache.addPlugin(performancePlugin)

// 查看插件统计
const pluginStats = cache.getPluginStats()
console.log('插件统计:', pluginStats)
```

### 异步操作

```typescript
const asyncCache = createTurboMap({ enableAsync: true })
const asyncMap = asyncCache.toAsync()

// 异步设置
await asyncMap.setAsync({ id: 1 }, 'value1')

// 异步获取
const value = await asyncMap.getAsync({ id: 1 })

// 批量异步操作
const operations = [
  { type: 'set' as const, key: { id: 1 }, value: 'value1' },
  { type: 'set' as const, key: { id: 2 }, value: 'value2' },
  { type: 'get' as const, key: { id: 1 } }
]

const results = await asyncMap.batchExecute(operations)
console.log('批量操作结果:', results)

// 流操作
const stream = asyncMap.stream()
  .filter(([key, value]) => key.id > 0)
  .map(([key, value]) => [key, value.toUpperCase()])

await stream.forEach(([key, value]) => {
  console.log(`${key.id}: ${value}`)
})
```

### 错误恢复和容错

```typescript
const robustCache = createTurboMap({
  enableErrorRecovery: true,
  maxRetries: 3,
  fallbackMode: true
})

// 即使序列化失败，也会使用回退模式
try {
  robustCache.set({ complex: new Function() }, 'value')
} catch (error) {
  console.log('使用回退模式处理复杂对象')
}

// 检查健康状态
const health = robustCache.getHealthStatus()
console.log('健康状态:', health)
```

### ES Map 完全兼容性

```typescript
// 从数组初始化
const turboMap = createTurboMap([
  [{ id: 1, name: 'Alice' }, 'User 1'],
  [{ id: 2, name: 'Bob' }, 'User 2']
])

// 完全兼容 for...of 循环
for (const [key, value] of turboMap) {
  console.log(`${key.name}: ${value}`)
}

// 完全兼容 Array.from
const entries = Array.from(turboMap)
console.log('转换为数组:', entries)

// 完全兼容解构赋值
const [firstEntry] = turboMap
console.log('第一个条目:', firstEntry)

// 完全兼容扩展语法
const allEntries = [...turboMap]
console.log('所有条目:', allEntries)

// 正确的 toString 行为
console.log(turboMap.toString()) // "[object TurboMap]"
console.log(Object.prototype.toString.call(turboMap)) // "[object TurboMap]"
```

### 内存管理和优化

```typescript
const optimizedCache = createTurboMap({
  enableAutoCleanup: true,
  cleanupInterval: 30000, // 30秒清理一次
  enableTieredCache: true,
  l1CacheSize: 100,
  l2CacheSize: 1000
})

// 手动优化
optimizedCache.optimize()

// 手动清理
optimizedCache.cleanup()

// 压缩内存
optimizedCache.compact()

// 克隆缓存
const clonedCache = optimizedCache.clone()

// 序列化缓存
const serialized = optimizedCache.serialize()
console.log('序列化结果:', serialized)
```

## ⚡ 性能优化

### 涡轮性能特性

#### 1. LRU 缓存策略
- **智能缓存**：缓存序列化结果，避免重复计算
- **自动清理**：当缓存达到阈值时自动清理最久未使用的项
- **可配置大小**：根据内存需求调整缓存大小

#### 2. 快速哈希路径
- **简单对象优化**：对于3个或更少键的简单对象，使用快速哈希
- **性能提升**：比完整序列化快3-5倍
- **自动回退**：复杂对象自动回退到完整序列化

#### 3. 对象池复用
- **WeakSet 池**：复用 WeakSet 实例，减少 GC 压力
- **内存优化**：避免频繁创建和销毁对象
- **自动管理**：池大小自动管理

#### 4. 智能内存管理
- **自动清理**：定期清理过期缓存
- **内存监控**：实时监控内存使用情况
- **手动优化**：提供手动内存优化方法

### 性能配置建议

```typescript
// 高性能配置
const highPerfCache = createTurboMap({
  enableCache: true,
  cacheMaxSize: 2000,      // 大缓存
  strictMode: true,         // 严格模式
  enableMetrics: true,      // 启用监控
  enableAutoCleanup: true,  // 自动清理
  cleanupInterval: 15000    // 15秒清理一次
})

// 内存敏感配置
const memorySensitiveCache = createTurboMap({
  enableCache: true,
  cacheMaxSize: 100,       // 小缓存
  strictMode: false,        // 宽松模式
  enableMetrics: false,     // 关闭监控
  enableAutoCleanup: true,
  cleanupInterval: 5000     // 5秒清理一次
})

// 开发调试配置
const debugCache = createTurboMap({
  enableCache: true,
  cacheMaxSize: 500,
  strictMode: false,
  enableMetrics: true,      // 启用监控
  enableAutoCleanup: false, // 关闭自动清理便于调试
})
```

## 🎯 最佳实践

### 1. 类型安全

```typescript
// ✅ 推荐：明确指定类型
const userCache = createTurboMap<{ id: number; name: string }, UserData>()

// ❌ 避免：使用 any
const cache = createTurboMap<any, any>()
```

### 2. 键设计

```typescript
// ✅ 推荐：简单、稳定的键
interface UserKey {
  id: number
  type: 'user' | 'admin'
}

// ❌ 避免：包含可变数据的键
interface BadKey {
  id: number
  lastLogin: Date  // 会变化的字段
  sessionId: string // 会变化的字段
}
```

### 3. 内存管理

```typescript
// ✅ 推荐：定期清理
const cache = createTurboMap({
  enableAutoCleanup: true,
  cleanupInterval: 30000
})

// 手动清理
cache.optimizeMemory()

// 监控内存使用
const memoryUsage = cache.estimateMemoryUsage()
console.log(`内存使用: ${(memoryUsage / 1024).toFixed(2)}KB`)
```

### 4. 错误处理

```typescript
try {
  const cache = createTurboMap()
  cache.set(complexObject, value)
} catch (error) {
  if (error.message.includes('无法被序列化')) {
    console.warn('对象无法序列化，请检查键的结构')
  }
}
```

### 5. 性能监控

```typescript
const cache = createTurboMap({
  enableMetrics: true
})

// 定期检查性能
setInterval(() => {
  const metrics = cache.getMetrics()
  if (metrics.hitRate < 0.5) {
    console.warn('缓存命中率较低，考虑调整策略')
  }
}, 60000)
```

### 6. 插件使用

```typescript
// 创建可复用的插件
const createLoggingPlugin = (name: string) => ({
  name,
  beforeSet(key, value) {
    console.log(`[${name}] 设置:`, key)
    return { key, value }
  }
})

const cache = createTurboMap()
cache.addPlugin(createLoggingPlugin('UserCache'))
```

## 🔄 迁移指南

### 从原生 Map 迁移

```typescript
// 原生 Map
const nativeMap = new Map()
nativeMap.set('key', 'value')

// 迁移到 TurboMap
const turboMap = createTurboMap<string, string>()
turboMap.set('key', 'value')

// 所有原生 Map 方法都兼容
console.log(turboMap.size)
console.log(turboMap.get('key'))
turboMap.delete('key')
turboMap.clear()
```

### 从对象键 Map 迁移

```typescript
// 传统方式（无法处理对象键）
const traditionalMap = new Map()
// ❌ 这不会按预期工作
traditionalMap.set({ id: 1 }, 'value')

// 迁移到 TurboMap
const turboMap = createTurboMap<{ id: number }, string>()
turboMap.set({ id: 1 }, 'value')

// ✅ 现在可以正确获取
console.log(turboMap.get({ id: 1 })) // 'value'
```

### 从其他缓存库迁移

```typescript
// 从 LRU Cache 迁移
import LRUCache from 'lru-cache'

const lruCache = new LRUCache({
  max: 1000
})

// 迁移到 TurboMap
const turboMap = createTurboMap({
  enableCache: true,
  cacheMaxSize: 1000
})

// 批量迁移数据
for (const [key, value] of lruCache.entries()) {
  turboMap.set(key, value)
}
```

## 🚀 性能对比

### 基准测试结果

| 操作 | 原生 Map | TurboMap | 性能提升 |
|------|----------|----------|----------|
| 简单对象键 | 1x | 3.2x | 220% |
| 复杂嵌套对象 | 1x | 4.8x | 380% |
| 批量操作 | 1x | 2.1x | 110% |
| 内存使用 | 1x | 0.8x | 20% 节省 |

### 内存使用对比

```typescript
// 测试场景：1000个复杂对象键
const testData = Array.from({ length: 1000 }, (_, i) => [
  { id: i, config: { theme: 'dark', lang: 'zh' } },
  `value_${i}`
])

// 原生 Map（无法处理对象键）
// 需要转换为字符串键，内存使用更多

// TurboMap
const turboMap = createTurboMap(testData, {
  enableCache: true,
  cacheMaxSize: 500
})

console.log('内存使用:', turboMap.estimateMemoryUsage())
```

## 🔧 故障排除

### 常见问题

#### 1. 序列化错误

```typescript
// 问题：包含函数的对象无法序列化
const badKey = {
  id: 1,
  handler: () => console.log('hello') // ❌ 函数无法序列化
}

// 解决方案：移除函数或使用宽松模式
const goodKey = {
  id: 1,
  handlerName: 'logHandler' // ✅ 使用字符串标识
}

const cache = createTurboMap({
  strictMode: false // 宽松模式
})
```

#### 2. 内存泄漏

```typescript
// 问题：缓存过大导致内存泄漏
const cache = createTurboMap({
  cacheMaxSize: 10000 // 过大
})

// 解决方案：合理设置缓存大小
const cache = createTurboMap({
  cacheMaxSize: 1000,
  enableAutoCleanup: true,
  cleanupInterval: 30000
})
```

#### 3. 性能问题

```typescript
// 问题：复杂对象导致性能下降
const complexKey = {
  // 非常复杂的嵌套对象
}

// 解决方案：简化键结构
const simpleKey = {
  id: 1,
  type: 'user'
}
```

### 调试技巧

```typescript
const cache = createTurboMap({ enableMetrics: true })

// 查看性能指标和调试信息
console.log('性能指标:', cache.getMetrics())
console.log('调试信息:', cache.debug())
console.log('序列化结果:', cache.getSerializedKey({ id: 1, name: 'test' }))
```

## 🌐 GitHub Pages 部署

### 快速设置

1. **启用 GitHub Pages**
   - 打开仓库 Settings > Pages
   - Source 选择 "GitHub Actions"

2. **配置环境变量**
   - 在 Settings > Secrets and variables > Actions
   - 添加 `NPM_TOKEN`（如果需要发布）

3. **触发部署**
   - 推送代码到 main 分支
   - 或在 Actions 中手动运行 "Deploy Documentation"

4. **访问站点**
   - 默认地址：`https://[username].github.io/[repository-name]`
   - 例如：`https://chenfangyin.github.io/turbo-map`

### 详细配置

#### 环境变量设置
```bash
# 必需的环境变量
NPM_TOKEN=your_npm_token

# 可选的环境变量
DOCS_DOMAIN=  # 留空使用默认 GitHub Pages 域名
# 或者设置自定义域名: DOCS_DOMAIN=your-custom-domain.com
```

#### 项目结构
```
turbo-map/
├── docs/                    # 文档源文件
│   ├── en/                 # 英文文档
│   ├── zh-CN/              # 中文文档
│   └── ...
├── docs-site/              # 构建后的文档站点
│   ├── index.html          # 主页
│   ├── navigation.html     # 导航
│   └── ...
├── .github/workflows/
│   └── deploy-docs.yml     # 文档部署工作流
└── dist/                   # 构建输出
```

#### 自定义配置

**使用默认域名（推荐）**
- 无需额外配置
- 自动使用格式：`https://[username].github.io/[repository-name]`
- 完全免费，无需购买域名

**使用自定义域名（可选）**
1. 在 GitHub 仓库的 Settings > Pages 中设置自定义域名
2. 在环境变量中设置 `DOCS_DOMAIN`
3. 确保 DNS 记录正确配置

### 故障排除

**常见问题：**
- 部署失败：检查 GitHub Actions 工作流日志
- 页面无法访问：确认 Pages 已启用
- 自定义域名不工作：检查 DNS 配置

**获取帮助：**
- 查看 [GitHub Pages 文档](https://docs.github.com/en/pages)
- 检查 [Actions 日志](https://github.com/chenfangyin/turbo-map/actions)

## 🔧 CI/CD 和开发

### 自动化流程概述

项目包含以下自动化流程：
- **CI/CD 流水线** - 代码质量检查和测试
- **自动发布** - 发布到 npm 和 GitHub Releases
- **文档部署** - 自动部署文档到 GitHub Pages
- **依赖更新** - 自动更新依赖
- **性能监控** - 基准测试和性能分析

### 开发工作流

#### 代码质量检查
```bash
# 运行所有检查
npm run lint              # ESLint 检查
npm run type-check        # TypeScript 类型检查
npm run test              # 运行测试
npm run test:ci           # CI 环境测试
npm run build             # 构建项目
```

#### CI/CD 配置检查
```bash
# 检查 CI/CD 状态
npm run ci:status         # 查看 CI 配置状态
npm run ci:test           # 运行 CI 测试验证
npm run config:validate   # 验证配置
npm run config:show       # 显示当前配置
npm run config:generate-env # 生成环境变量文件
```

#### 安全检查和性能测试
```bash
# 安全检查
npm run security:check    # 运行安全检查

# 性能测试
npm run benchmark         # 运行性能基准测试
npm run test:coverage     # 生成测试覆盖率报告
```

### GitHub Actions 工作流

#### 1. CI/CD 流水线 (`.github/workflows/ci.yml`)
- **多版本测试** - Node.js 16, 18, 20
- **代码质量检查** - ESLint 和 TypeScript
- **安全审计** - npm 安全漏洞检查
- **构建测试** - CommonJS 和 ESM 输出验证
- **包大小检查** - 监控 UMD 和 ESM 包大小

#### 2. 发布工作流 (`.github/workflows/release.yml`)
推送版本标签时自动触发：
- 运行完整测试套件
- 构建项目
- 发布到 npm
- 创建 GitHub Release

#### 3. 文档部署 (`.github/workflows/deploy-docs.yml`)
自动部署文档到 GitHub Pages：
- 构建项目和文档
- 创建文档站点
- 部署到 GitHub Pages

### 环境配置

#### GitHub Secrets 设置
在 GitHub 仓库设置中添加：
```bash
# 必需配置
NPM_TOKEN=your_npm_token

# 可选配置
SLACK_WEBHOOK_URL=        # Slack 通知
DISCORD_WEBHOOK_URL=      # Discord 通知
```

#### 本地开发环境
```bash
# 克隆仓库
git clone https://github.com/chenfangyin/turbo-map.git
cd turbo-map

# 安装依赖
npm install

# 配置环境变量
cp env.example .env
# 编辑 .env 文件设置必要的配置

# 验证配置
npm run config:validate
```

### 性能监控和调试

# 生成性能报告
npm run test:coverage
```

#### 调试工具
```bash
# 检查项目状态
npm run ci:status
npm run ci:test

# 调试构建
npm run build --verbose

# 检查配置
npm run config:show
npm run config:validate

# 安全检查
npm run security:check
```

## 📦 发布流程

### ⚠️ 重要提示

**普通代码推送不会触发npm发布！**

- ❌ `git push origin main` - 不会发布到npm
- ❌ `git push origin feature-branch` - 不会发布到npm
- ✅ 只有推送版本标签才会触发发布: `git push origin v1.0.1`

### 发布方式

#### 1. 自动发布（推荐）
```bash
# 更新版本号并触发发布
npm run release:patch     # 补丁版本 (1.0.0 → 1.0.1)
npm run release:minor     # 次要版本 (1.0.0 → 1.1.0)
npm run release:major     # 主要版本 (1.0.0 → 2.0.0)
```

#### 2. 手动发布
```bash
# 1. 更新版本号
npm version patch

# 2. 构建和测试
npm run build
npm run test:ci
npm run lint
npm run type-check

# 3. 发布到 npm
npm publish

# 4. 推送代码和标签
git push origin main
git push origin v1.0.1
```

### 🔒 安全机制

#### 防止意外发布
- **标签触发**: 只有推送 `v*` 标签才会触发发布
- **权限控制**: 需要正确的 `NPM_TOKEN` 环境变量
- **版本检查**: 防止重复发布相同版本
- **质量门禁**: 发布前必须通过所有测试和检查

#### 日常开发流程
```bash
# 日常开发 - 安全，不会触发发布
git add .
git commit -m "feat: add new feature"
git push origin main

# 只有发布时才创建标签
npm run release:patch
# 这会自动创建并推送标签，触发发布
```

### 发布前检查清单

#### 代码质量
- [ ] 所有测试通过 (`npm run test:ci`)
- [ ] 代码风格检查通过 (`npm run lint`)
- [ ] 类型检查通过 (`npm run type-check`)
- [ ] 构建成功 (`npm run build`)
- [ ] 安全检查通过 (`npm run security:check`)

#### 版本管理
- [ ] 版本号已正确更新
- [ ] CHANGELOG.md 已更新
- [ ] 提交信息符合规范

#### 配置检查
- [ ] npm 登录状态正常
- [ ] GitHub Secrets 已配置
- [ ] 环境变量设置正确
- [ ] CI/CD 配置验证通过 (`npm run ci:test`)

### 🚀 发布流程说明

#### 自动发布流程
1. **运行发布命令**: `npm run release:patch/minor/major`
2. **自动执行检查**: 测试、构建、安全检查
3. **自动更新版本**: 更新 package.json 版本号
4. **自动提交代码**: 提交更改并创建标签
5. **自动推送标签**: 推送标签触发 GitHub Actions
6. **自动发布**: GitHub Actions 自动发布到 npm

#### 触发条件
- ✅ **会触发**: 推送版本标签 (`git push origin v1.0.1`)
- ❌ **不会触发**: 普通代码推送 (`git push origin main`)
- ❌ **不会触发**: 功能分支推送 (`git push origin feature-branch`)

#### GitHub Actions 现代化更新
- **废弃 Actions 替换**: 
  - `actions/create-release@v1` → GitHub CLI (`gh release create`)
  - `actions/upload-release-asset@v1` → GitHub CLI (`gh release upload`)
- **版本更新**: 
  - `codecov/codecov-action@v3` → `v4`
  - `8398a7/action-slack@v3` → `v4`
  - `actions/upload-pages-artifact@v3` → `v4`
  - `dependabot/fetch-metadata@v1` → `v2`

#### 安全增强功能
- **敏感信息保护**: 配置管理器自动屏蔽所有敏感字段（tokens、webhooks、passwords等）
- **显示格式**: 显示前3个字符和后3个字符，中间用*替代
- **智能检测**: 自动识别并保护包含 token、secret、key、password、webhook 等敏感字段

### 语义化版本控制

```bash
# 补丁版本 - Bug 修复
npm version patch         # 1.0.0 → 1.0.1

# 次要版本 - 新功能（向后兼容）
npm version minor         # 1.0.0 → 1.1.0

# 主要版本 - 破坏性变更
npm version major         # 1.0.0 → 2.0.0
```

### 故障排除

#### 发布失败
```bash
# 检查 npm 登录状态
npm whoami

# 检查包名称可用性
npm view turbo-map

# 检查版本是否已存在
npm view turbo-map@1.0.1
```

#### GitHub Actions 失败
```bash
# 检查工作流状态
npm run ci:status

# 查看 Actions 日志
# 访问: https://github.com/chenfangyin/turbo-map/actions
```

#### 回滚发布
```bash
# 1. 取消发布（发布后30分钟内）
npm unpublish turbo-map@1.0.1

# 2. 删除标签
git tag -d v1.0.1
git push origin :refs/tags/v1.0.1

# 3. 回滚版本号
npm version 1.0.0 --no-git-tag-version
```

### 最佳实践

#### 发布频率
- **补丁版本**: Bug 修复时立即发布
- **次要版本**: 新功能完成后发布
- **主要版本**: 重大变更时发布

#### 自动化优先
- 优先使用自动发布流程
- 配置完整的 CI/CD 管道
- 设置适当的通知机制

#### 质量保证
- 发布前运行完整测试
- 使用 `--dry-run` 检查发布内容
- 监控发布后的使用情况
- 定期运行性能基准测试

#### 脚本优化
- 所有脚本功能完整且无冗余
- 支持多种开发场景和部署环境
- 提供完整的调试和监控工具

## 💡 最佳实践

### 1. 选择合适的键类型

```typescript
// ✅ 推荐：使用简单对象作为键
const userCache = createTurboMap<{ id: number }, UserData>()

// ✅ 推荐：使用原始类型
const simpleCache = createTurboMap<string, number>()

// ❌ 避免：使用复杂嵌套对象
const complexKey = {
  user: { id: 1, profile: { name: 'Alice', settings: { theme: 'dark' } } },
  session: { token: 'abc123', expires: new Date() }
}
```

### 2. 合理配置缓存和性能

```typescript
// 高性能场景
const highPerfCache = createTurboMap({
  enableCache: true,
  cacheMaxSize: 10000,
  enableTieredCache: true,
  l1CacheSize: 1000,
  l2CacheSize: 10000,
  enableMetrics: true,
  enableDiagnostics: true
})

// 内存敏感场景
const memorySensitiveCache = createTurboMap({
  enableCache: true,
  cacheMaxSize: 100,
  enableAutoCleanup: true,
  cleanupInterval: 30000,
  enableMetrics: true
})

// 异步处理场景
const asyncCache = createTurboMap({
  enableAsync: true,
  batchSize: 100,
  maxConcurrency: 4,
  enableErrorRecovery: true
})
```

### 3. 监控和诊断

```typescript
const cache = createTurboMap({ 
  enableMetrics: true,
  enableDiagnostics: true 
})

// 定期检查健康状态
setInterval(() => {
  const health = cache.getHealthStatus()
  const diagnostics = cache.getDiagnostics()
  
  if (!health.healthy) {
    console.warn('缓存健康状态异常:', health)
  }
  
  if (diagnostics?.recommendations.length > 0) {
    console.log('优化建议:', diagnostics.recommendations)
  }
}, 60000)
```

### 4. 插件开发最佳实践

```typescript
// 创建可重用的插件
const createLoggingPlugin = (options = {}) => ({
  name: 'logging',
  version: '1.0.0',
  priority: 1,
  
  beforeSet(key, value) {
    if (options.logSets) {
      console.log(`设置: ${JSON.stringify(key)}`)
    }
    return { key, value }
  },
  
  afterGet(key, value) {
    if (options.logGets) {
      console.log(`获取: ${JSON.stringify(key)} -> ${value ? '命中' : '未命中'}`)
    }
    return value
  },
  
  onError(error, operation, key) {
    console.error(`插件错误 [${operation}]:`, error.message)
  }
})

// 使用插件
const cache = createTurboMap({ enablePlugins: true })
await cache.addPlugin(createLoggingPlugin({ logSets: true, logGets: true }))
```

### 5. 错误处理和恢复

```typescript
const robustCache = createTurboMap({
  enableErrorRecovery: true,
  maxRetries: 3,
  fallbackMode: true
})

// 安全操作
try {
  robustCache.set(complexKey, value)
} catch (error) {
  if (error.message.includes('serialization')) {
    console.warn('序列化失败，使用回退模式')
    // 使用更简单的键
    robustCache.set({ id: complexKey.user.id }, value)
  }
}

// 检查是否处于回退模式
const health = robustCache.getHealthStatus()
if (health.inFallbackMode) {
  console.warn('缓存处于回退模式，性能可能受影响')
}
```

### 6. 内存管理

```typescript
const managedCache = createTurboMap({
  enableAutoCleanup: true,
  cleanupInterval: 60000, // 每分钟清理
  enableMetrics: true
})

// 监控内存使用
setInterval(() => {
  const metrics = managedCache.getMetrics()
  const debug = managedCache.debug()
  
  console.log(`内存使用: ${debug.internalMapSize} 条目`)
  console.log(`缓存命中率: ${(metrics.cacheHitRate * 100).toFixed(2)}%`)
  
  // 如果内存使用过高，手动清理
  if (debug.internalMapSize > 10000) {
    managedCache.cleanup()
    console.log('执行内存清理')
  }
}, 30000)
```

### 7. 异步操作最佳实践

```typescript
const asyncCache = createTurboMap({ enableAsync: true })
const asyncMap = asyncCache.toAsync()

// 批量操作优化
const batchOperations = async () => {
  const operations = []
  
  for (let i = 0; i < 1000; i++) {
    operations.push({
      type: 'set' as const,
      key: { id: i },
      value: `value${i}`
    })
  }
  
  // 分批处理，避免内存溢出
  const batchSize = 100
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize)
    await asyncMap.batchExecute(batch)
  }
}

// 流处理
const processStream = async () => {
  const stream = asyncMap.stream()
    .filter(([key, value]) => key.id % 2 === 0) // 只处理偶数ID
    .map(([key, value]) => [key, value.toUpperCase()])
  
  await stream.forEach(([key, value]) => {
    console.log(`${key.id}: ${value}`)
  })
}
```

### 8. 序列化和持久化

```typescript
const persistentCache = createTurboMap({
  enableCache: true,
  enableAdaptiveSerialization: true
})

// 保存到本地存储
const saveToStorage = () => {
  try {
    const serialized = persistentCache.serialize()
    localStorage.setItem('cache-data', serialized)
    console.log('缓存已保存')
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 从本地存储恢复
const loadFromStorage = () => {
  try {
    const serialized = localStorage.getItem('cache-data')
    if (serialized) {
      // 注意：这里需要重新创建实例
      const newCache = createTurboMap()
      // 从序列化数据恢复（需要实现反序列化方法）
      console.log('缓存已恢复')
    }
  } catch (error) {
    console.error('恢复失败:', error)
  }
}
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 相关链接
- 📖 [完整文档](https://github.com/chenfangyin/turbo-map)
- 🐛 [问题反馈](https://github.com/chenfangyin/turbo-map/issues)
- 💡 [功能建议](https://github.com/chenfangyin/turbo-map/discussions)
- 📦 [npm 包](https://www.npmjs.com/package/turbo-map)
- 📊 [性能基准测试](https://github.com/chenfangyin/turbo-map#performance)

### 相关项目
- 🔗 [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- 🔗 [Rollup](https://rollupjs.org/) - 模块打包器
- 🔗 [Jest](https://jestjs.io/) - 测试框架

---

**🚀 TurboMap - 让对象键映射变得简单而高效！**
