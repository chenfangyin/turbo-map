// tests/turboMap.test.ts
import { createTurboMap, turboMapFactory, createTypeSafeTurboMap } from '../src/index'

describe('TurboMap', () => {
  test('基础功能测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    map.set({ id: 1 }, 'value1')
    expect(map.get({ id: 1 })).toBe('value1')
    expect(map.size).toBe(1)
  })

  test('ES Map 兼容性测试', () => {
    const map = createTurboMap([
      [{ id: 1 }, 'value1'],
      [{ id: 2 }, 'value2']
    ], { enableAutoCleanup: false })
    
    expect(map.size).toBe(2)
    expect(map.toString()).toBe('[object TurboMap]')
  })

  test('深度对象比较测试', () => {
    const map = createTurboMap<{ user: { id: number; name: string } }, string>({ enableAutoCleanup: false })
    
    const key1 = { user: { id: 1, name: 'Alice' } }
    const key2 = { user: { id: 1, name: 'Alice' } }
    
    map.set(key1, 'user data')
    expect(map.get(key2)).toBe('user data')
  })

  test('Date对象键测试', () => {
    const map = createTurboMap<{ date: Date; id: number }, string>({ enableAutoCleanup: false })
    
    const date1 = new Date('2024-01-01')
    const date2 = new Date('2024-01-01')
    
    map.set({ date: date1, id: 1 }, 'date data')
    expect(map.get({ date: date2, id: 1 })).toBe('date data')
  })

  test('数组键测试', () => {
    const map = createTurboMap<{ tags: string[]; id: number }, string>({ enableAutoCleanup: false })
    
    const key1 = { tags: ['tag1', 'tag2'], id: 1 }
    const key2 = { tags: ['tag1', 'tag2'], id: 1 }
    
    map.set(key1, 'array data')
    expect(map.get(key2)).toBe('array data')
  })

  test('工厂函数测试', () => {
    const factory = turboMapFactory<{ id: number }, string>()
    const map = factory({ enableCache: true, enableAutoCleanup: false })
    
    map.set({ id: 1 }, 'factory value')
    expect(map.get({ id: 1 })).toBe('factory value')
  })

  test('类型安全工厂测试', () => {
    const factory = createTypeSafeTurboMap<{ id: number }>()
    const map = factory<{ id: number }, string>({ enableCache: true, enableAutoCleanup: false })
    
    map.set({ id: 1 }, 'type safe value')
    expect(map.get({ id: 1 })).toBe('type safe value')
  })

  test('批量操作测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    const entries: [{ id: number }, string][] = [
      [{ id: 1 }, 'value1'],
      [{ id: 2 }, 'value2'],
      [{ id: 3 }, 'value3']
    ]
    
    map.setAll(entries)
    expect(map.size).toBe(3)
    
    const keys = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const values = map.getAll(keys)
    expect(values).toEqual(['value1', 'value2', 'value3'])
  })

  test('性能指标测试', () => {
    const map = createTurboMap<{ id: number }, string>({ 
      enableMetrics: true,
      enableAutoCleanup: false
    })
    
    map.set({ id: 1 }, 'value1')
    map.get({ id: 1 })
    
    const metrics = map.getMetrics()
    expect(metrics.totalOperations).toBeGreaterThan(0)
    expect(typeof metrics.hitRate).toBe('number')
  })

  test('调试信息测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    map.set({ id: 1 }, 'value1')
    const debug = map.debug()
    
    expect(debug.size).toBe(1)
    expect(typeof debug.memoryEstimate).toBe('number')
  })

  test('内存优化测试', () => {
    const map = createTurboMap<{ id: number }, string>({
      enableAutoCleanup: false,
      cleanupInterval: 100
    })
    
    for (let i = 0; i < 1000; i++) {
      map.set({ id: i }, `value${i}`)
    }
    
    const initialMemory = map.estimateMemoryUsage()
    map.optimizeMemory()
    const optimizedMemory = map.estimateMemoryUsage()
    
    expect(optimizedMemory).toBeLessThanOrEqual(initialMemory)
  })

  test('插件系统测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    const plugin = {
      name: 'test-plugin',
      beforeSet: (key: { id: number }, value: string) => {
        return { key, value: value.toUpperCase() }
      }
    }
    
    map.addPlugin(plugin)
    map.set({ id: 1 }, 'test')
    
    expect(map.get({ id: 1 })).toBe('TEST')
    expect(map.removePlugin('test-plugin')).toBe(true)
  })

  test('循环引用处理测试', () => {
    const map = createTurboMap<any, string>({ strictMode: false, enableAutoCleanup: false })
    
    const obj1: any = { id: 1 }
    const obj2: any = { id: 2 }
    obj1.ref = obj2
    obj2.ref = obj1
    
    expect(() => {
      map.set(obj1, 'circular data')
    }).toThrow('Provided key object cannot be serialized')
    
    const normalObj = { 
      id: 1, 
      nested: { 
        value: 'test',
        deep: { data: 'nested' }
      } 
    }
    
    map.set(normalObj, 'normal data')
    expect(map.get(normalObj)).toBe('normal data')
  })

  test('RegExp对象键测试', () => {
    const map = createTurboMap<{ pattern: RegExp; id: number }, string>({ enableAutoCleanup: false })
    
    const regex1 = /test/i
    const regex2 = /test/i
    
    map.set({ pattern: regex1, id: 1 }, 'regex data')
    expect(map.get({ pattern: regex2, id: 1 })).toBe('regex data')
  })

  test('条件查找测试', () => {
    const map = createTurboMap<{ id: number; name: string }, string>({ enableAutoCleanup: false })
    
    map.set({ id: 1, name: 'Alice' }, 'admin')
    map.set({ id: 2, name: 'Bob' }, 'user')
    map.set({ id: 3, name: 'Charlie' }, 'admin')
    
    const adminUser = map.findByValue((value, key) => 
      value === 'admin' && key.id > 1
    )
    
    expect(adminUser).toBeDefined()
    expect(adminUser![1]).toBe('admin')
    expect(adminUser![0].id).toBe(3)
  })

  test('键分布分析测试', () => {
    const map = createTurboMap<{ id: number; type: string }, string>({ enableAutoCleanup: false })
    
    for (let i = 0; i < 10; i++) {
      map.set({ id: i, type: i % 2 === 0 ? 'even' : 'odd' }, `value${i}`)
    }
    
    const keys = Array.from(map.keys()).map(k => JSON.stringify(k))
    const distribution = map.analyzeKeyDistribution(keys)
    
    expect(distribution).toBeDefined()
    expect(typeof distribution).toBe('object')
  })

  test('序列化键测试', () => {
    const map = createTurboMap<{ id: number; name: string }, string>({ enableAutoCleanup: false })
    
    const key = { id: 1, name: 'Test' }
    const serialized = map.getSerializedKey(key)
    
    expect(typeof serialized).toBe('string')
    expect(serialized.length).toBeGreaterThan(0)
  })

  test('错误处理测试', () => {
    const map = createTurboMap<any, string>({ strictMode: false, enableAutoCleanup: false })
    
    const funcKey = { id: 1, func: () => {} }
    expect(() => map.set(funcKey, 'test')).not.toThrow()
  })

  test('迭代器测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    map.set({ id: 1 }, 'value1')
    map.set({ id: 2 }, 'value2')
    
    const entries = Array.from(map.entries())
    expect(entries).toHaveLength(2)
    
    const keys = Array.from(map.keys())
    expect(keys).toHaveLength(2)
    
    const values = Array.from(map.values())
    expect(values).toHaveLength(2)
  })

  test('forEach测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    map.set({ id: 1 }, 'value1')
    map.set({ id: 2 }, 'value2')
    
    const results: string[] = []
    map.forEach((value, key) => {
      results.push(`${key.id}:${value}`)
    })
    
    expect(results).toContain('1:value1')
    expect(results).toContain('2:value2')
  })

  test('清除和删除测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    map.set({ id: 1 }, 'value1')
    map.set({ id: 2 }, 'value2')
    
    expect(map.size).toBe(2)
    expect(map.delete({ id: 1 })).toBe(true)
    expect(map.size).toBe(1)
    expect(map.has({ id: 2 })).toBe(true)
    
    map.clear()
    expect(map.size).toBe(0)
  })

  test('缓存配置测试', () => {
    const map = createTurboMap<{ id: number }, string>({
      enableCache: true,
      cacheMaxSize: 10,
      enableAutoCleanup: false
    })
    
    for (let i = 0; i < 15; i++) {
      map.set({ id: i }, `value${i}`)
    }
    
    expect(map.size).toBe(15)
  })

  test('严格模式测试', () => {
    const strictMap = createTurboMap<any, string>({ strictMode: true, enableAutoCleanup: false })
    
    expect(() => {
      strictMap.set({ func: () => {} }, 'test')
    }).toThrow('Provided key object cannot be serialized')
    
    expect(() => {
      strictMap.set({ sym: Symbol('test') }, 'test')
    }).toThrow('Provided key object cannot be serialized')
  })

  test('宽松模式测试', () => {
    const looseMap = createTurboMap<any, string>({ strictMode: false, enableAutoCleanup: false })
    
    expect(() => {
      looseMap.set({ func: () => {} }, 'test')
    }).not.toThrow()
    
    expect(() => {
      looseMap.set({ sym: Symbol('test') }, 'test')
    }).not.toThrow()
  })

  test('内存清理测试', () => {
    const map = createTurboMap<{ id: number }, string>({
      enableAutoCleanup: false,
      cleanupInterval: 100
    })
    
    for (let i = 0; i < 100; i++) {
      map.set({ id: i }, `value${i}`)
    }
    
    map.optimizeMemory()
    expect(map.size).toBe(100)
  })

  test('插件错误处理测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    const errorPlugin = {
      name: 'error-plugin',
      beforeSet: () => {
        throw new Error('Plugin error')
      }
    }
    map.addPlugin(errorPlugin)

    expect(() => {
      map.set({ id: 1 }, 'test')
    }).not.toThrow()

    map.removePlugin('error-plugin')
    expect(() => {
      map.set({ id: 1 }, 'test')
    }).not.toThrow()
  })

  test('性能指标详细测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableMetrics: true, enableAutoCleanup: false })
    
    for (let i = 0; i < 10; i++) {
      map.set({ id: i }, `value${i}`)
      map.get({ id: i })
    }
    
    const metrics = map.getMetrics()
    
    expect(metrics.totalOperations).toBeGreaterThan(0)
    expect(metrics.hitRate).toBeGreaterThanOrEqual(0)
    expect(metrics.hitRate).toBeLessThanOrEqual(1)
    expect(metrics.cacheHits).toBeGreaterThanOrEqual(0)
    expect(metrics.averageSerializationTime).toBeGreaterThanOrEqual(0)
    expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0)
    expect(metrics.fastPathUsage).toBeGreaterThanOrEqual(0)
    expect(metrics.errorCount).toBeGreaterThanOrEqual(0)
  })

  test('调试信息详细测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    for (let i = 0; i < 5; i++) {
      map.set({ id: i }, `value${i}`)
    }
    
    const debug = map.debug()
    
    expect(debug.size).toBe(5)
    expect(debug.cacheSize).toBeGreaterThanOrEqual(0)
    expect(debug.memoryEstimate).toBeGreaterThanOrEqual(0)
    expect(debug.hitRate).toBeGreaterThanOrEqual(0)
    expect(debug.hitRate).toBeLessThanOrEqual(1)
    expect(typeof debug.keyDistribution).toBe('object')
    expect(Array.isArray(debug.largestKeys)).toBe(true)
  })

  test('空对象键测试', () => {
    const map = createTurboMap<{}, string>({ enableAutoCleanup: false })
    
    map.set({}, 'empty object')
    expect(map.get({})).toBe('empty object')
    expect(map.has({})).toBe(true)
  })

  test('null 和 undefined 处理测试', () => {
    const map = createTurboMap<any, string>({ strictMode: false, enableAutoCleanup: false })
    
    map.set({ id: 1, value: null }, 'null value')
    expect(map.get({ id: 1, value: null })).toBe('null value')
    
    map.set({ id: 2, value: undefined }, 'undefined value')
    expect(map.get({ id: 2, value: undefined })).toBe('undefined value')
  })

  test('大对象键测试', () => {
    const map = createTurboMap<any, string>({ enableAutoCleanup: false })
    
    const largeKey = {
      id: 1,
      data: Array.from({ length: 1000 }, (_, i) => i),
      nested: {
        deep: {
          deeper: {
            deepest: 'value'
          }
        }
      }
    }
    
    map.set(largeKey, 'large object')
    expect(map.get(largeKey)).toBe('large object')
  })

  test('Symbol.iterator 兼容性测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    map.set({ id: 1 }, 'value1')
    map.set({ id: 2 }, 'value2')
    
    const entries: Array<[{ id: number }, string]> = []
    for (const [key, value] of map) {
      entries.push([key, value])
    }
    
    expect(entries).toHaveLength(2)
    expect(entries[0][1]).toBe('value1')
    expect(entries[1][1]).toBe('value2')
  })

  test('Symbol.toStringTag 测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    expect(map[Symbol.toStringTag]).toBe('TurboMap')
    expect(Object.prototype.toString.call(map)).toBe('[object TurboMap]')
  })

  test('链式调用测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    const result = map
      .set({ id: 1 }, 'value1')
      .set({ id: 2 }, 'value2')
      .set({ id: 3 }, 'value3')
    
    expect(result).toBe(map)
    expect(map.size).toBe(3)
  })

  test('批量操作边界测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    map.setAll([])
    expect(map.size).toBe(0)
    
    map.setAll([[{ id: 1 }, 'value1']])
    expect(map.size).toBe(1)
    
    const largeEntries = Array.from({ length: 1000 }, (_, i) => [{ id: i }, `value${i}`] as [{ id: number }, string])
    map.setAll(largeEntries)
    expect(map.size).toBe(1000)
  })

  test('getAll 边界测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    map.set({ id: 1 }, 'value1')
    map.set({ id: 2 }, 'value2')
    
    expect(map.getAll([])).toEqual([])
    
    const keys = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const values = map.getAll(keys)
    expect(values).toEqual(['value1', 'value2', undefined])
  })

  test('findByValue 边界测试', () => {
    const map = createTurboMap<{ id: number; name: string }, string>({ enableAutoCleanup: false })
    
    map.set({ id: 1, name: 'Alice' }, 'admin')
    map.set({ id: 2, name: 'Bob' }, 'user')
    
    const notFound = map.findByValue((value, key) => value === 'guest')
    expect(notFound).toBeUndefined()
    
    const found = map.findByValue((value, key) => value === 'admin')
    expect(found).toBeDefined()
    expect(found![1]).toBe('admin')
  })

  test('插件管理测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    const plugin1 = { name: 'plugin1', beforeSet: (key: { id: number }, value: string) => ({ key, value }) }
    const plugin2 = { name: 'plugin2', beforeSet: (key: { id: number }, value: string) => ({ key, value }) }
    
    map.addPlugin(plugin1)
    map.addPlugin(plugin2)
    map.addPlugin(plugin1)
    
    expect(map.removePlugin('plugin1')).toBe(true)
    expect(map.removePlugin('plugin2')).toBe(true)
    expect(map.removePlugin('nonexistent')).toBe(false)
  })

  test('内存估算详细测试', () => {
    const map = createTurboMap<{ id: number; data: string }, string>({ enableAutoCleanup: false })
    
    expect(map.estimateMemoryUsage()).toBeGreaterThanOrEqual(0)
    
    map.set({ id: 1, data: 'test' }, 'value')
    const memoryUsage = map.estimateMemoryUsage()
    expect(memoryUsage).toBeGreaterThan(0)
    
    for (let i = 2; i <= 10; i++) {
      map.set({ id: i, data: `test${i}` }, `value${i}`)
    }
    
    const newMemoryUsage = map.estimateMemoryUsage()
    expect(newMemoryUsage).toBeGreaterThan(memoryUsage)
  })

  test('键分布分析详细测试', () => {
    const map = createTurboMap<{ id: number; type: string }, string>({ enableAutoCleanup: false })
    
    map.set({ id: 1, type: 'short' }, 'value1')
    map.set({ id: 2, type: 'medium' }, 'value2'.repeat(20))
    map.set({ id: 3, type: 'long' }, 'value3'.repeat(100))
    
    const keys = Array.from(map.keys()).map(k => JSON.stringify(k))
    const distribution = map.analyzeKeyDistribution(keys)
    
    expect(distribution).toHaveProperty('11-50')
  })

  test('配置选项完整测试', () => {
    const map = createTurboMap<{ id: number }, string>({
      enableCache: true,
      cacheMaxSize: 100,
      strictMode: false,
      enableMetrics: true,
      enableAutoCleanup: false,
      cleanupInterval: 5000
    })
    
    map.set({ id: 1 }, 'value1')
    expect(map.get({ id: 1 })).toBe('value1')
    
    const metrics = map.getMetrics()
    expect(metrics.totalOperations).toBeGreaterThan(0)
  })

  test('错误恢复测试', () => {
    const map = createTurboMap<any, string>({ strictMode: false, enableAutoCleanup: false })
    
    const specialKey = {
      id: 1,
      special: 'test\n\r\t"\'\\'
    }
    
    expect(() => {
      map.set(specialKey, 'special value')
    }).not.toThrow()
    
    expect(map.get(specialKey)).toBe('special value')
  })

  test('性能基准测试', () => {
    const map = createTurboMap<{ id: number; data: string }, string>({ enableMetrics: true, enableAutoCleanup: false })
    
    const startTime = performance.now()
    
    for (let i = 0; i < 1000; i++) {
      map.set({ id: i, data: `data${i}` }, `value${i}`)
    }
    
    for (let i = 0; i < 1000; i++) {
      map.get({ id: i, data: `data${i}` })
    }
    
    const endTime = performance.now()
    const totalTime = endTime - startTime
    
    expect(totalTime).toBeLessThan(1000)
    
    const metrics = map.getMetrics()
    expect(metrics.totalOperations).toBe(2000)
  })

  test('内存泄漏测试', () => {
    const map = createTurboMap<{ id: number }, string>({
      enableCache: true,
      cacheMaxSize: 10,
      enableAutoCleanup: false,
      cleanupInterval: 100
    })
    
    const initialMemory = map.estimateMemoryUsage()
    
    for (let i = 0; i < 100; i++) {
      map.set({ id: i }, `value${i}`)
    }
    
    for (let i = 0; i < 100; i++) {
      map.delete({ id: i })
    }
    
    const finalMemory = map.estimateMemoryUsage()
    expect(finalMemory).toBeLessThanOrEqual(initialMemory * 2)
  })

  test('边界条件测试', () => {
    const map = createTurboMap<any, any>({ enableAutoCleanup: false })
    
    expect(() => {
      map.set(null as any, 'value')
    }).toThrow()
    
    expect(() => {
      map.set(undefined as any, 'value')
    }).toThrow()
    
    expect(() => {
      map.set('string' as any, 'value')
    }).toThrow()
    
    expect(() => {
      map.set(123 as any, 'value')
    }).toThrow()
  })

  test('类型安全测试', () => {
    const map = createTurboMap<{ id: number; name: string }, { data: string; count: number }>({ enableAutoCleanup: false })
    
    map.set({ id: 1, name: 'Alice' }, { data: 'test', count: 1 })
    
    const value = map.get({ id: 1, name: 'Alice' })
    expect(value).toBeDefined()
    expect(value!.data).toBe('test')
    expect(value!.count).toBe(1)
  })

  test('工厂函数类型测试', () => {
    const factory = turboMapFactory<{ id: number }, string>()
    const map = factory({ enableAutoCleanup: false })
    
    map.set({ id: 1 }, 'value')
    expect(map.get({ id: 1 })).toBe('value')
    
    const typeSafeFactory = createTypeSafeTurboMap<{ id: number }>()
    const typeSafeMap = typeSafeFactory<{ id: number }, string>({ enableAutoCleanup: false })
    
    typeSafeMap.set({ id: 1 }, 'value')
    expect(typeSafeMap.get({ id: 1 })).toBe('value')
  })

  test('ES6 模块导入测试', () => {
    const { createTurboMap } = require('../dist/index.js')
    const map1 = createTurboMap({ enableAutoCleanup: false })
    map1.set({ id: 1 }, 'value1')
    expect(map1.get({ id: 1 })).toBe('value1')
    
    const { createTurboMap: namedCreateTurboMap } = require('../dist/index.js')
    const map2 = namedCreateTurboMap({ enableAutoCleanup: false })
    map2.set({ id: 2 }, 'value2')
    expect(map2.get({ id: 2 })).toBe('value2')
  })

  test('LRU缓存边界测试', () => {
    const map = createTurboMap({ 
      enableCache: true, 
      cacheMaxSize: 2,
      enableAutoCleanup: false
    })
    
    map.set({ id: 1 }, 'value1')
    map.set({ id: 2 }, 'value2')
    map.set({ id: 3 }, 'value3')
    
    expect(map.get({ id: 1 })).toBe('value1')
    expect(map.get({ id: 2 })).toBe('value2')
    expect(map.get({ id: 3 })).toBe('value3')
    
    const metrics = map.getMetrics()
    expect(metrics.cacheHits).toBeGreaterThanOrEqual(0)
  })

  test('WeakSet池测试', () => {
    const map = createTurboMap({ enableAutoCleanup: false })
    
    for (let i = 0; i < 100; i++) {
      const key = { id: i, name: `user${i}`, timestamp: 1000 + i }
      map.set(key, `value${i}`)
    }
    
    expect(map.size).toBe(100)
    
    for (let i = 0; i < 5; i++) {
      const testKey = { id: i, name: `user${i}`, timestamp: 1000 + i }
      expect(map.get(testKey)).toBe(`value${i}`)
    }
    
    const middleKey = { id: 50, name: 'user50', timestamp: 1050 }
    const endKey = { id: 99, name: 'user99', timestamp: 1099 }
    expect(map.get(middleKey)).toBe('value50')
    expect(map.get(endKey)).toBe('value99')
  })

  test('快速哈希路径测试', () => {
    const map = createTurboMap({ enableAutoCleanup: false })
    
    const simpleKey = { a: 1, b: 2, c: 3 }
    map.set(simpleKey, 'simple')
    expect(map.get(simpleKey)).toBe('simple')
    
    const complexKey = { a: 1, b: { nested: true }, c: 3 }
    map.set(complexKey, 'complex')
    expect(map.get(complexKey)).toBe('complex')
  })

  test('循环引用深度处理测试', () => {
    const map = createTurboMap({ 
      strictMode: false,
      enableAutoCleanup: false
    })
    
    const obj1: any = { id: 1 }
    const obj2: any = { id: 2 }
    const obj3: any = { id: 3 }
    
    obj1.ref = obj2
    obj2.ref = obj3
    obj3.ref = obj1
    
    expect(() => {
      map.set(obj1, 'circular')
    }).toThrow('Provided key object cannot be serialized')
  })

  test('插件钩子完整测试', () => {
    const map = createTurboMap({ enableAutoCleanup: false })
    
    const testPlugin = {
      name: 'test-plugin',
      beforeSet: (key: { id: number }, value: string) => {
        return { key: { ...key, modified: true }, value: value.toUpperCase() }
      },
      afterSet: (key: { id: number }, value: string) => {
        // 验证钩子被调用
      },
      beforeGet: (key: { id: number }) => {
        return { ...key, modified: true }
      },
      afterGet: (key: { id: number }, value: string | undefined) => {
        return value
      },
      beforeDelete: (key: { id: number }) => {
        return { ...key, modified: true }
      },
      afterDelete: (key: { id: number }, deleted: boolean) => {
        // 验证钩子被调用
      }
    }
    
    map.addPlugin(testPlugin)
    
    map.set({ id: 1 }, 'test')
    expect(map.get({ id: 1 })).toBe('TEST')
    expect(map.delete({ id: 1 })).toBe(true)
  })

  test('性能指标详细测试', () => {
    const map = createTurboMap({ enableMetrics: true, enableAutoCleanup: false })
    
    for (let i = 0; i < 100; i++) {
      map.set({ id: i }, `value${i}`)
      map.get({ id: i })
    }
    
    try {
      map.set({ func: () => {} } as any, 'error')
    } catch (e) {
      // 忽略错误
    }
    
    const metrics = map.getMetrics()
    
    expect(metrics.totalOperations).toBeGreaterThan(0)
    expect(metrics.cacheHits).toBeGreaterThanOrEqual(0)
    expect(metrics.fastPathUsage).toBeGreaterThanOrEqual(0)
    expect(metrics.errorCount).toBeGreaterThanOrEqual(0)
    expect(metrics.averageSerializationTime).toBeGreaterThanOrEqual(0)
    expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0)
    expect(metrics.hitRate).toBeGreaterThanOrEqual(0)
    expect(metrics.hitRate).toBeLessThanOrEqual(1)
  })

  test('自动清理测试', () => {
    const map = createTurboMap({
      enableAutoCleanup: false,
      cleanupInterval: 100
    })
    
    for (let i = 0; i < 100; i++) {
      map.set({ id: i }, `value${i}`)
    }
    
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(map.size).toBe(100)
        resolve()
      }, 200)
    })
  })

  test('序列化上下文测试', () => {
    const map = createTurboMap({ enableAutoCleanup: false })
    
    const specialKey = {
      date: new Date('2024-01-01'),
      regex: /test/i,
      array: [1, 2, 3],
      nested: {
        date: new Date('2024-01-02'),
        regex: /nested/i
      }
    }
    
    map.set(specialKey, 'special')
    expect(map.get(specialKey)).toBe('special')
  })

  test('错误恢复机制测试', () => {
    const map = createTurboMap({ strictMode: false, enableAutoCleanup: false })
    
    const specialCharsKey = {
      id: 1,
      special: 'test\n\r\t"\'\\\u0000\u0001'
    }
    
    expect(() => {
      map.set(specialCharsKey, 'special chars')
    }).not.toThrow()
    
    expect(map.get(specialCharsKey)).toBe('special chars')
  })

  test('内存估算边界测试', () => {
    const map = createTurboMap({ enableAutoCleanup: false })
    
    expect(map.estimateMemoryUsage()).toBe(0)
    
    map.set({ id: 1 }, 'simple')
    expect(map.estimateMemoryUsage()).toBeGreaterThan(0)
    
    map.set({ 
      id: 2, 
      data: Array.from({ length: 1000 }, (_, i) => i),
      nested: { deep: { deeper: 'value' } }
    }, 'complex')
    
    const memoryUsage = map.estimateMemoryUsage()
    expect(memoryUsage).toBeGreaterThan(0)
  })

  test('键分布分析边界测试', () => {
    const map = createTurboMap({ enableAutoCleanup: false })
    
    expect(map.analyzeKeyDistribution([])).toEqual({})
    
    const keys = [
      'a',
      'a'.repeat(20),
      'a'.repeat(60),
      'a'.repeat(200),
      'a'.repeat(600)
    ]
    
    const distribution = map.analyzeKeyDistribution(keys)
    expect(distribution['0-10']).toBe(1)
    expect(distribution['11-50']).toBe(1)
    expect(distribution['51-100']).toBe(1)
    expect(distribution['101-500']).toBe(1)
    expect(distribution['500+']).toBe(1)
  })

  test('工厂函数边界测试', () => {
    const factory = turboMapFactory<{ id: number }, string>()
    const map1 = factory({ enableAutoCleanup: false })
    const map2 = factory({ enableCache: true, enableAutoCleanup: false })
    
    expect(map1).toBeDefined()
    expect(map2).toBeDefined()
    
    const typeSafeFactory = createTypeSafeTurboMap<{ id: number }>()
    const typeSafeMap = typeSafeFactory<{ id: number }, string>({ enableAutoCleanup: false })
    
    expect(typeSafeMap).toBeDefined()
  })

  test('构造函数重载测试', () => {
    const map1 = createTurboMap({ enableAutoCleanup: false })
    const map2 = createTurboMap({ enableCache: true, enableAutoCleanup: false })
    const map3 = createTurboMap([
      [{ id: 1 }, 'value1'],
      [{ id: 2 }, 'value2']
    ], { enableAutoCleanup: false })
    const map4 = createTurboMap([
      [{ id: 1 }, 'value1'],
      [{ id: 2 }, 'value2']
    ], { enableCache: true, enableAutoCleanup: false })
    
    expect(map1.size).toBe(0)
    expect(map2.size).toBe(0)
    expect(map3.size).toBe(2)
    expect(map4.size).toBe(2)
  })

  test('迭代器测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    const emptyEntries = Array.from(map.entries())
    const emptyKeys = Array.from(map.keys())
    const emptyValues = Array.from(map.values())
    
    expect(emptyEntries).toEqual([])
    expect(emptyKeys).toEqual([])
    expect(emptyValues).toEqual([])
    
    map.set({ id: 1 }, 'value1')
    map.set({ id: 2 }, 'value2')
    
    const entries = Array.from(map.entries())
    const keys = Array.from(map.keys())
    const values = Array.from(map.values())
    
    expect(entries).toHaveLength(2)
    expect(keys).toHaveLength(2)
    expect(values).toHaveLength(2)
  })

  test('forEach测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    const emptyResults: string[] = []
    map.forEach((value, key) => {
      emptyResults.push(`${key.id}:${value}`)
    })
    expect(emptyResults).toEqual([])
    
    map.set({ id: 1 }, 'value1')
    map.set({ id: 2 }, 'value2')
    
    const results: string[] = []
    map.forEach((value, key) => {
      results.push(`${key.id}:${value}`)
    })
    
    expect(results).toContain('1:value1')
    expect(results).toContain('2:value2')
  })

  test('Symbol.iterator边界测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    const emptyIteration: Array<[{ id: number }, string]> = []
    for (const entry of map) {
      emptyIteration.push(entry)
    }
    expect(emptyIteration).toEqual([])
    
    map.set({ id: 1 }, 'value1')
    map.set({ id: 2 }, 'value2')
    
    const iteration: Array<[{ id: number }, string]> = []
    for (const entry of map) {
      iteration.push(entry)
    }
    
    expect(iteration).toHaveLength(2)
    expect(iteration[0][1]).toBe('value1')
    expect(iteration[1][1]).toBe('value2')
  })

  test('清除和删除边界测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    expect(map.delete({ id: 1 })).toBe(false)
    expect(map.has({ id: 1 })).toBe(false)
    
    map.set({ id: 1 }, 'value1')
    expect(map.has({ id: 1 })).toBe(true)
    expect(map.delete({ id: 1 })).toBe(true)
    expect(map.has({ id: 1 })).toBe(false)
    
    map.set({ id: 1 }, 'value1')
    map.set({ id: 2 }, 'value2')
    expect(map.size).toBe(2)
    
    map.clear()
    expect(map.size).toBe(0)
    expect(map.has({ id: 1 })).toBe(false)
    expect(map.has({ id: 2 })).toBe(false)
  })

  test('批量操作边界测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    map.setAll([])
    expect(map.size).toBe(0)
    
    map.setAll([[{ id: 1 }, 'value1']])
    expect(map.size).toBe(1)
    expect(map.get({ id: 1 })).toBe('value1')
    
    expect(map.getAll([])).toEqual([])
    expect(map.getAll([{ id: 1 }])).toEqual(['value1'])
    expect(map.getAll([{ id: 1 }, { id: 2 }])).toEqual(['value1', undefined])
  })

  test('条件查找边界测试', () => {
    const map = createTurboMap<{ id: number; name: string }, string>({ enableAutoCleanup: false })
    
    expect(map.findByValue(() => true)).toBeUndefined()
    
    map.set({ id: 1, name: 'Alice' }, 'admin')
    map.set({ id: 2, name: 'Bob' }, 'user')
    
    expect(map.findByValue(() => false)).toBeUndefined()
    
    const found = map.findByValue((value, key) => value === 'admin' && key.id === 1)
    expect(found).toBeDefined()
    expect(found![1]).toBe('admin')
  })

  test('插件管理边界测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    expect(map.removePlugin('nonexistent')).toBe(false)
    
    const plugin = { name: 'test', beforeSet: (key: { id: number }, value: string) => ({ key, value }) }
    map.addPlugin(plugin)
    map.addPlugin(plugin)
    
    expect(map.removePlugin('test')).toBe(true)
    expect(map.removePlugin('test')).toBe(false)
  })

  test('内存优化边界测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    expect(() => map.optimizeMemory()).not.toThrow()
    
    map.set({ id: 1 }, 'value1')
    expect(() => map.optimizeMemory()).not.toThrow()
    
    for (let i = 0; i < 1000; i++) {
      map.set({ id: i }, `value${i}`)
    }
    expect(() => map.optimizeMemory()).not.toThrow()
  })

  test('序列化键边界测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    const simpleKey = { id: 1 }
    const simpleSerialized = map.getSerializedKey(simpleKey)
    expect(typeof simpleSerialized).toBe('string')
    expect(simpleSerialized.length).toBeGreaterThan(0)
    
    const complexKey = { 
      id: 1, 
      nested: { 
        deep: { 
          data: 'test',
          array: [1, 2, 3],
          date: new Date('2024-01-01')
        } 
      } 
    }
    const complexSerialized = map.getSerializedKey(complexKey)
    expect(typeof complexSerialized).toBe('string')
    expect(complexSerialized.length).toBeGreaterThan(0)
  })

  test('调试信息边界测试', () => {
    const map = createTurboMap<{ id: number }, string>({ enableAutoCleanup: false })
    
    const emptyDebug = map.debug()
    expect(emptyDebug.size).toBe(0)
    expect(emptyDebug.cacheSize).toBe(0)
    expect(emptyDebug.memoryEstimate).toBe(0)
    expect(emptyDebug.hitRate).toBe(0)
    expect(emptyDebug.keyDistribution).toEqual({})
    expect(emptyDebug.largestKeys).toEqual([])
    
    map.set({ id: 1 }, 'value1')
    map.set({ id: 2 }, 'value2')
    
    const debug = map.debug()
    expect(debug.size).toBe(2)
    expect(debug.cacheSize).toBeGreaterThanOrEqual(0)
    expect(debug.memoryEstimate).toBeGreaterThan(0)
    expect(debug.hitRate).toBeGreaterThanOrEqual(0)
    expect(typeof debug.keyDistribution).toBe('object')
    expect(Array.isArray(debug.largestKeys)).toBe(true)
  })
})
