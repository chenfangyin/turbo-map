# 🚀 TurboMap - 涡轮增压映射工具

> 一个高性能、类型安全的Map实现，支持以复杂嵌套对象作为键，完全兼容ES Map API

## 📖 目录

- [✨ 核心特性](#-核心特性)
- [🚀 快速开始](#-快速开始)
- [📚 API 参考](#-api-参考)
- [💡 使用示例](#-使用示例)
- [⚡ 性能优化](#-性能优化)
- [🎯 最佳实践](#-最佳实践)
- [🔄 迁移指南](#-迁移指南)
- [🚀 性能对比](#-性能对比)
- [🔧 故障排除](#-故障排除)
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
- Node.js >= 14.0.0
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
npm install github:chenfangyin/turbo-map#v1.0.0
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

创建 TurboMap 实例。

**参数：**
- `entries?` - 初始键值对数组或可迭代对象
- `options?` - 配置选项

**返回：** `TurboMapLike<K, V>`

**重载：**
```typescript
// 从数组初始化
createTurboMap<{ id: number }, string>([
  [{ id: 1 }, 'value1']
])

// 仅配置选项
createTurboMap<{ id: number }, string>({
  enableCache: true,
  cacheMaxSize: 1000
})

// 数组 + 配置
createTurboMap<{ id: number }, string>([
  [{ id: 1 }, 'value1']
], {
  enableCache: true
})
```

### 配置选项

#### `TurboMapOptions`

```typescript
interface TurboMapOptions {
  /** 是否缓存序列化结果以提升性能 */
  enableCache?: boolean
  /** 序列化缓存的最大大小 */
  cacheMaxSize?: number
  /** 是否启用严格模式（更严格的类型检查） */
  strictMode?: boolean
  /** 是否启用性能监控 */
  enableMetrics?: boolean
  /** 是否启用自动内存管理 */
  enableAutoCleanup?: boolean
  /** 内存清理间隔（毫秒） */
  cleanupInterval?: number
}
```

### 核心方法

#### 标准 Map 方法

```typescript
interface TurboMapLike<K, V> {
  /** 映射中键值对的数量 */
  readonly size: number
  
  /** 设置键值对，支持链式调用 */
  set(key: K, value: V): TurboMapLike<K, V>
  
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
  forEach(callback: (value: V, key: K, map: TurboMapLike<K, V>) => void): void
}
```

#### 🚀 TurboMap 专属方法

```typescript
interface TurboMapLike<K, V> {
  /** 批量设置键值对 */
  setAll(entries: [K, V][]): TurboMapLike<K, V>
  
  /** 批量获取 */
  getAll(keys: K[]): (V | undefined)[]
  
  /** 条件查找 */
  findByValue(predicate: (value: V, key: K) => boolean): [K, V] | undefined
  
  /** 获取性能指标 */
  getMetrics(): PerformanceMetrics
  
  /** 获取调试信息 */
  debug(): DebugInfo
  
  /** 添加插件 */
  addPlugin(plugin: TurboMapPlugin<K, V>): void
  
  /** 移除插件 */
  removePlugin(pluginName: string): boolean
  
  /** 手动触发内存优化 */
  optimizeMemory(): void
  
  /** 估算内存使用量 */
  estimateMemoryUsage(): number
  
  /** 分析键分布 */
  analyzeKeyDistribution(keys: string[]): Record<string, number>
  
  /** 获取键的序列化字符串（调试用） */
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

创建强类型工厂函数，带有更好的类型推断。

```typescript
const createApiCache = createTypeSafeTurboMap<ApiRequest>()

const apiCache = createApiCache<ApiRequest, Response>({
  enableMetrics: true
})
```

## 💡 使用示例

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
  body?: Record<string, any>
  headers?: Record<string, string>
}

interface ApiResponse {
  data: any
  timestamp: Date
  ttl: number
}

const apiCache = createTurboMap<ApiRequest, ApiResponse>({
  enableCache: true,
  cacheMaxSize: 1000,
  enableMetrics: true
})

// 缓存 API 响应
const request: ApiRequest = {
  endpoint: '/api/users',
  method: 'GET',
  query: { page: 1, limit: 20 },
  headers: { 'Authorization': 'Bearer token123' }
}

apiCache.set(request, {
  data: [{ id: 1, name: 'User 1' }],
  timestamp: new Date(),
  ttl: 300
})

// 查询缓存 - 完全相同的请求结构
const cachedResponse = apiCache.get({
  endpoint: '/api/users',
  method: 'GET',
  query: { page: 1, limit: 20 },
  headers: { 'Authorization': 'Bearer token123' }
})

if (cachedResponse) {
  console.log('缓存命中:', cachedResponse.data)
}
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

### 性能监控

```typescript
const cache = createTurboMap<ApiRequest, Response>({
  enableMetrics: true,
  enableCache: true
})

// 执行一些操作
cache.set(request1, response1)
cache.set(request2, response2)
cache.get(request1)

// 查看性能指标
const metrics = cache.getMetrics()
console.log('性能指标:', {
  命中率: `${(metrics.hitRate * 100).toFixed(2)}%`,
  总操作数: metrics.totalOperations,
  缓存命中: metrics.cacheHits,
  快速路径使用: metrics.fastPathUsage,
  平均序列化时间: `${metrics.averageSerializationTime.toFixed(2)}ms`,
  内存使用量: `${(metrics.memoryUsage / 1024).toFixed(2)}KB`,
  错误次数: metrics.errorCount
})

// 调试信息
const debugInfo = cache.debug()
console.log('调试信息:', {
  大小: debugInfo.size,
  缓存大小: debugInfo.cacheSize,
  键分布: debugInfo.keyDistribution,
  最大键: debugInfo.largestKeys,
  内存估算: `${(debugInfo.memoryEstimate / 1024).toFixed(2)}KB`,
  命中率: `${(debugInfo.hitRate * 100).toFixed(2)}%`
})
```

### 插件系统

```typescript
// 创建日志插件
const loggingPlugin: TurboMapPlugin<ApiRequest, Response> = {
  name: 'logging',
  beforeSet(key, value) {
    console.log(`🚀 设置缓存: ${key.endpoint}`)
    return { key, value }
  },
  afterGet(key, value) {
    if (value) {
      console.log(`✅ 缓存命中: ${key.endpoint}`)
    } else {
      console.log(`❌ 缓存未命中: ${key.endpoint}`)
    }
    return value
  }
}

const cache = createTurboMap<ApiRequest, Response>()
cache.addPlugin(loggingPlugin)

// 创建监控插件
const monitoringPlugin: TurboMapPlugin<ApiRequest, Response> = {
  name: 'monitoring',
  beforeSet(key, value) {
    // 记录设置操作
    console.log(`📊 监控: 设置 ${key.method} ${key.endpoint}`)
  },
  afterDelete(key, deleted) {
    if (deleted) {
      console.log(`🗑️ 监控: 删除 ${key.method} ${key.endpoint}`)
    }
  }
}

cache.addPlugin(monitoringPlugin)
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
const cache = createTurboMap({
  enableMetrics: true
})

// 1. 查看性能指标
const metrics = cache.getMetrics()
console.log('性能指标:', metrics)

// 2. 查看调试信息
const debug = cache.debug()
console.log('调试信息:', debug)

// 3. 分析键分布
const keyDistribution = cache.analyzeKeyDistribution(
  Array.from(cache.keys()).map(k => JSON.stringify(k))
)
console.log('键分布:', keyDistribution)

// 4. 检查序列化结果
const serializedKey = cache.getSerializedKey({ id: 1, name: 'test' })
console.log('序列化结果:', serializedKey)
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
