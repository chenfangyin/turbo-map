/**
 * TurboMap v2.0 - Enhanced Entry Point
 * 
 * Advanced Map implementation with:
 * - Adaptive serialization strategies
 * - Tiered caching system
 * - Object pooling for performance
 * - Error recovery mechanisms
 * - Async operations and streaming API
 * - Enhanced diagnostics and monitoring
 * - Robust plugin system
 */

// Core types and utilities
export type { MapKey, PrimitiveKey, ObjectKey } from './utils/TypeUtils'
export { TypeUtils } from './utils/TypeUtils'

// Enhanced object pooling
export { ObjectPool, EnhancedObjectPool, globalObjectPool } from './utils/ObjectPool'

// Fast hashing with multiple strategies
export { FastHasher, globalFastHasher } from './utils/FastHash'

// Error recovery system
export { 
  ErrorRecoveryManager, 
  globalErrorRecovery,
  ErrorType,
  RecoveryAction
} from './utils/ErrorRecovery'

// Advanced caching
export { 
  EnhancedLRUCache, 
  TieredCacheManager,
  type CacheStats,
  type TieredCacheOptions 
} from './core/CacheManager'

// Adaptive serialization
export { 
  AdaptiveSerializer, 
  globalSerializer,
  type SerializationContext,
  type SerializationStrategy 
} from './core/Serializer'

// Async operations
export { 
  AsyncTurboMap,
  type AsyncTurboMapLike,
  type AsyncTurboMapStream,
  type BatchOperation,
  type BatchResult,
  type AsyncOptions 
} from './core/AsyncTurboMap'

// Plugin system
export { 
  PluginManager,
  type TurboMapPlugin,
  type PluginContext,
  type PluginStats 
} from './plugins/PluginManager'

// Diagnostics and monitoring
export { 
  PerformanceMonitor,
  MemoryAnalyzer,
  DiagnosticAnalyzer,
  globalDiagnostic,
  type PerformanceProfile,
  type MemoryDiagnostic,
  type ErrorAnalysis,
  type OptimizationSuggestion,
  type DiagnosticInfo 
} from './utils/DiagnosticUtils'

// Enhanced TurboMap interface
import { MapKey } from './utils/TypeUtils'
import { AsyncTurboMap, type AsyncTurboMapLike } from './core/AsyncTurboMap'
import { PluginManager, type TurboMapPlugin } from './plugins/PluginManager'
import { globalSerializer } from './core/Serializer'
import { TieredCacheManager } from './core/CacheManager'
import { globalErrorRecovery, ErrorType } from './utils/ErrorRecovery'
import { globalDiagnostic, type PerformanceProfile, type MemoryDiagnostic, type ErrorAnalysis, type OptimizationSuggestion } from './utils/DiagnosticUtils'
import { globalFastHasher } from './utils/FastHash'

/**
 * Enhanced TurboMap configuration options
 */
export interface EnhancedTurboMapOptions {
  // Serialization options
  enableCache?: boolean
  cacheMaxSize?: number
  enableAdaptiveSerialization?: boolean
  
  // Performance options
  enableMetrics?: boolean
  enableAutoCleanup?: boolean
  cleanupInterval?: number
  
  // Caching options
  enableTieredCache?: boolean
  l1CacheSize?: number
  l2CacheSize?: number
  promoteThreshold?: number
  
  // Error recovery options
  enableErrorRecovery?: boolean
  maxRetries?: number
  fallbackMode?: boolean
  
  // Plugin options
  enablePlugins?: boolean
  pluginTimeout?: number
  
  // Diagnostic options
  enableDiagnostics?: boolean
  trackPerformance?: boolean
  
  // Async options
  enableAsync?: boolean
  batchSize?: number
  maxConcurrency?: number
}

/**
 * Enhanced TurboMap interface with all optimizations
 */
export interface EnhancedTurboMapLike<K extends MapKey, V> {
  // Core Map interface
  readonly size: number
  set(key: K, value: V): this
  get(key: K): V | undefined
  has(key: K): boolean
  delete(key: K): boolean
  clear(): void
  entries(): IterableIterator<[K, V]>
  keys(): IterableIterator<K>
  values(): IterableIterator<V>
  forEach(callback: (value: V, key: K, map: this) => void): void
  [Symbol.iterator](): IterableIterator<[K, V]>
  readonly [Symbol.toStringTag]: string

  // Enhanced core methods
  getSerializedKey(key: K): string
  
  // Batch operations
  setAll(entries: [K, V][]): this
  getAll(keys: K[]): (V | undefined)[]
  deleteAll(keys: K[]): boolean[]
  
  // Advanced queries
  findByValue(predicate: (value: V, key: K) => boolean): [K, V] | undefined
  filter(predicate: (value: V, key: K) => boolean): [K, V][]
  mapValues<U>(transform: (value: V, key: K) => U): EnhancedTurboMapLike<K, U>
  
  // Statistics and diagnostics
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
  
  // Plugin management
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
  
  // Async operations
  toAsync(): AsyncTurboMapLike<K, V>
  
  // Performance
  optimize(): void
  reset(): void
  
  // Serialization
  serialize(): string
  clone(): EnhancedTurboMapLike<K, V>
  
  // Memory management
  cleanup(): void
  compact(): void
}

/**
 * Create enhanced TurboMap with all optimizations
 */
export function createEnhancedTurboMap<K extends MapKey, V>(
  entriesOrOptions?: readonly (readonly [K, V])[] | Iterable<readonly [K, V]> | EnhancedTurboMapOptions | null,
  optionsParam?: EnhancedTurboMapOptions
): EnhancedTurboMapLike<K, V> {
  // Parse arguments
  let entries: Iterable<readonly [K, V]> | null = null
  let options: EnhancedTurboMapOptions = {}

  if (entriesOrOptions && (Symbol.iterator in Object(entriesOrOptions))) {
    entries = entriesOrOptions as Iterable<readonly [K, V]>
    options = optionsParam || {}
  } else if (entriesOrOptions && typeof entriesOrOptions === 'object') {
    options = entriesOrOptions as EnhancedTurboMapOptions
  }

  // Default options
  const config: Required<EnhancedTurboMapOptions> = {
    enableCache: true,
    cacheMaxSize: 10000,
    enableAdaptiveSerialization: true,
    enableMetrics: true,
    enableAutoCleanup: true,
    cleanupInterval: 300000, // 5 minutes
    enableTieredCache: true,
    l1CacheSize: 1000,
    l2CacheSize: 5000,
    promoteThreshold: 3,
    enableErrorRecovery: true,
    maxRetries: 3,
    fallbackMode: true,
    enablePlugins: true,
    pluginTimeout: 5000,
    enableDiagnostics: true,
    trackPerformance: true,
    enableAsync: true,
    batchSize: 100,
    maxConcurrency: 10,
    ...options
  }

  return globalErrorRecovery.executeWithRecovery(
    () => createEnhancedTurboMapInternal<K, V>(entries, config),
    () => createFallbackEnhancedTurboMap<K, V>(),
    'createEnhancedTurboMap',
    ErrorType.UNKNOWN
  )
}

/**
 * Internal enhanced TurboMap creation
 */
function createEnhancedTurboMapInternal<K extends MapKey, V>(
  entries: Iterable<readonly [K, V]> | null,
  config: Required<EnhancedTurboMapOptions>
): EnhancedTurboMapLike<K, V> {
  // Core storage
  const internalMap = new Map<string, V>()
  const keyMap = new Map<string, K>()
  
  // Enhanced components
  const pluginManager = config.enablePlugins ? new PluginManager<K, V>({
    enableStats: config.enableDiagnostics,
    maxExecutionTime: 100,
    enableErrorRecovery: config.enableErrorRecovery,
    pluginTimeout: config.pluginTimeout
  }) : null

  const cache = config.enableTieredCache ? new TieredCacheManager<string>({
    l1CacheSize: config.l1CacheSize,
    l2CacheSize: config.l2CacheSize,
    promoteThreshold: config.promoteThreshold
  }) : null

  // Statistics
  let operationCount = 0
  let cacheHits = 0
  let cacheMisses = 0
  let errorCount = 0

  // Serialization function with error recovery
  const serialize = (key: K): string => {
    return globalErrorRecovery.executeWithRecovery(
      () => {
        const startTime = config.trackPerformance ? performance.now() : 0
        
        // Try cache first
        if (cache) {
          // Use a more stable cache key for objects
          const cacheKey = typeof key === 'object' && key !== null 
            ? `obj_${globalFastHasher.fastHash(key) || Date.now()}_${Math.random()}`
            : String(key)
          const cached = cache.get(cacheKey)
          if (cached !== undefined) {
            cacheHits++
            return cached
          }
          cacheMisses++
        }

        // Use adaptive serializer
        const result = config.enableAdaptiveSerialization 
          ? globalSerializer.serialize(key)
          : JSON.stringify(key)

        // Cache result
        if (cache) {
          const cacheKey = typeof key === 'object' && key !== null 
            ? `obj_${globalFastHasher.fastHash(key) || Date.now()}_${Math.random()}`
            : String(key)
          cache.set(cacheKey, result)
        }

        // Track performance
        if (config.trackPerformance) {
          globalDiagnostic.trackOperation('serialize', performance.now() - startTime)
        }

        return result
      },
      () => {
        errorCount++
        // Fallback serialization
        try {
          return JSON.stringify(key)
        } catch {
          return `[SerializationError:${typeof key}:${Date.now()}]`
        }
      },
      'serialize',
      ErrorType.SERIALIZATION
    )
  }

  // Create enhanced map instance
  const enhancedMap: EnhancedTurboMapLike<K, V> = {
    [Symbol.toStringTag]: 'EnhancedTurboMap',

    // Core Map interface
    get size(): number {
      return internalMap.size
    },

    set(key: K, value: V): EnhancedTurboMapLike<K, V> {
      return globalErrorRecovery.executeWithRecovery(
        () => {
          operationCount++
          const startTime = config.trackPerformance ? performance.now() : 0

          // Plugin before hook
          const beforeResult = pluginManager?.executeBefore('beforeSet', {
            operation: 'set',
            key,
            value,
            timestamp: Date.now()
          }, key, value) as { key: K; value: V } | null

          const finalKey = beforeResult?.key ?? key
          const finalValue = beforeResult?.value ?? value

          const serializedKey = serialize(finalKey)
          internalMap.set(serializedKey, finalValue)
          keyMap.set(serializedKey, finalKey)

          // Plugin after hook
          pluginManager?.executeAfter('afterSet', {
            operation: 'set',
            key: finalKey,
            value: finalValue,
            timestamp: Date.now()
          }, finalKey, finalValue)

          // Track performance
          if (config.trackPerformance) {
            globalDiagnostic.trackOperation('set', performance.now() - startTime)
          }

          return enhancedMap
        },
        () => {
          errorCount++
          console.warn('EnhancedTurboMap: Set operation failed, skipping')
          return enhancedMap
        },
        'set',
        ErrorType.UNKNOWN
      )
    },

    get(key: K): V | undefined {
      return globalErrorRecovery.executeWithRecovery(
        () => {
          operationCount++
          const startTime = config.trackPerformance ? performance.now() : 0

          // Plugin before hook
          const beforeResult = pluginManager?.executeBefore('beforeGet', {
            operation: 'get',
            key,
            timestamp: Date.now()
          }, key) as K | null

          const finalKey = beforeResult ?? key
          const serializedKey = serialize(finalKey)
          const value = internalMap.get(serializedKey)

          // Plugin after hook - only call if we have plugins
          let finalValue = value
          if (pluginManager && pluginManager.getAllPlugins().length > 0) {
            const pluginResult = pluginManager.executeAfter('afterGet', {
              operation: 'get',
              key: finalKey,
              value,
              timestamp: Date.now()
            }, finalKey, value) as V | undefined
            finalValue = pluginResult ?? value
          }

          // Track performance
          if (config.trackPerformance) {
            globalDiagnostic.trackOperation('get', performance.now() - startTime)
          }

          return finalValue
        },
        () => {
          errorCount++
          console.warn('EnhancedTurboMap: Get operation failed, returning undefined')
          return undefined
        },
        'get',
        ErrorType.UNKNOWN
      )
    },

    has(key: K): boolean {
      return globalErrorRecovery.executeWithRecovery(
        () => {
          operationCount++
          const serializedKey = serialize(key)
          return internalMap.has(serializedKey)
        },
        () => {
          errorCount++
          console.warn('EnhancedTurboMap: Has operation failed, returning false')
          return false
        },
        'has',
        ErrorType.UNKNOWN
      )
    },

    delete(key: K): boolean {
      return globalErrorRecovery.executeWithRecovery(
        () => {
          operationCount++
          const startTime = config.trackPerformance ? performance.now() : 0

          // Plugin before hook
          const beforeResult = pluginManager?.executeBefore('beforeDelete', {
            operation: 'delete',
            key,
            timestamp: Date.now()
          }, key) as K | null

          const finalKey = beforeResult ?? key
          const serializedKey = serialize(finalKey)
          const deleted = internalMap.delete(serializedKey)
          
          if (deleted) {
            keyMap.delete(serializedKey)
          }

          // Plugin after hook
          pluginManager?.executeAfter('afterDelete', {
            operation: 'delete',
            key: finalKey,
            timestamp: Date.now()
          }, finalKey, deleted)

          // Track performance
          if (config.trackPerformance) {
            globalDiagnostic.trackOperation('delete', performance.now() - startTime)
          }

          return deleted
        },
        () => {
          errorCount++
          console.warn('EnhancedTurboMap: Delete operation failed, returning false')
          return false
        },
        'delete',
        ErrorType.UNKNOWN
      )
    },

    clear(): void {
      globalErrorRecovery.executeWithRecovery(
        () => {
          operationCount++

          // Plugin before hook
          const shouldClear = pluginManager?.executeBefore('beforeClear', {
            operation: 'clear',
            timestamp: Date.now()
          }) !== false

          if (shouldClear) {
            internalMap.clear()
            keyMap.clear()

            // Plugin after hook
            pluginManager?.executeAfter('afterClear', {
              operation: 'clear',
              timestamp: Date.now()
            })
          }
        },
        () => {
          errorCount++
          console.warn('EnhancedTurboMap: Clear operation failed')
        },
        'clear',
        ErrorType.UNKNOWN
      )
    },

    // Enhanced methods
    getSerializedKey(key: K): string {
      return serialize(key)
    },

    setAll(entries: [K, V][]): EnhancedTurboMapLike<K, V> {
      return globalErrorRecovery.executeWithRecovery(
        () => {
          if (!Array.isArray(entries)) {
            throw new Error('setAll requires an array of entries')
          }
          
          for (const [key, value] of entries) {
            this.set(key, value)
          }
          return enhancedMap
        },
        () => {
          errorCount++
          console.warn('EnhancedTurboMap: setAll operation failed')
          return enhancedMap
        },
        'setAll',
        ErrorType.UNKNOWN
      )
    },

    getAll(keys: K[]): (V | undefined)[] {
      return globalErrorRecovery.executeWithRecovery(
        () => {
          if (!Array.isArray(keys)) {
            throw new Error('getAll requires an array of keys')
          }
          
          return keys.map(key => this.get(key))
        },
        () => {
          errorCount++
          console.warn('EnhancedTurboMap: getAll operation failed')
          return []
        },
        'getAll',
        ErrorType.UNKNOWN
      )
    },

    deleteAll(keys: K[]): boolean[] {
      return globalErrorRecovery.executeWithRecovery(
        () => {
          if (!Array.isArray(keys)) {
            throw new Error('deleteAll requires an array of keys')
          }
          
          return keys.map(key => this.delete(key))
        },
        () => {
          errorCount++
          console.warn('EnhancedTurboMap: deleteAll operation failed')
          return []
        },
        'deleteAll',
        ErrorType.UNKNOWN
      )
    },

    findByValue(predicate: (value: V, key: K) => boolean): [K, V] | undefined {
      return globalErrorRecovery.executeWithRecovery(
        () => {
          if (typeof predicate !== 'function') {
            throw new Error('findByValue requires a function predicate')
          }
          
          for (const [key, value] of this.entries()) {
            if (predicate(value, key)) {
              return [key, value]
            }
          }
          return undefined
        },
        () => {
          errorCount++
          console.warn('EnhancedTurboMap: findByValue operation failed')
          return undefined
        },
        'findByValue',
        ErrorType.UNKNOWN
      )
    },

    filter(predicate: (value: V, key: K) => boolean): [K, V][] {
      return globalErrorRecovery.executeWithRecovery(
        () => {
          const result: [K, V][] = []
          for (const [key, value] of this.entries()) {
            if (predicate(value, key)) {
              result.push([key, value])
            }
          }
          return result
        },
        () => {
          errorCount++
          console.warn('EnhancedTurboMap: filter operation failed')
          return []
        },
        'filter',
        ErrorType.UNKNOWN
      )
    },

    mapValues<U>(transform: (value: V, key: K) => U): EnhancedTurboMapLike<K, U> {
      return globalErrorRecovery.executeWithRecovery(
        () => {
          const result = createEnhancedTurboMap<K, U>([], config)
          for (const [key, value] of this.entries()) {
            result.set(key, transform(value, key))
          }
          return result
        },
        () => {
          errorCount++
          console.warn('EnhancedTurboMap: mapValues operation failed')
          return createEnhancedTurboMap<K, U>([], config)
        },
        'mapValues',
        ErrorType.UNKNOWN
      )
    },

        // Iterators
    *entries(): IterableIterator<[K, V]> {
      try {
        for (const [serializedKey, value] of internalMap.entries()) {
          const originalKey = keyMap.get(serializedKey)
          if (originalKey !== undefined) {
            yield [originalKey, value]
          }
        }
      } catch (error) {
        errorCount++
        console.warn('EnhancedTurboMap: entries iteration failed:', error)
      }
    },

    *keys(): IterableIterator<K> {
      for (const [key] of this.entries()) {
        yield key
      }
    },

    *values(): IterableIterator<V> {
      for (const [, value] of this.entries()) {
        yield value
      }
    },

    forEach(callback: (value: V, key: K, map: EnhancedTurboMapLike<K, V>) => void): void {
      try {
        for (const [key, value] of this.entries()) {
          callback(value, key, enhancedMap)
        }
      } catch (error) {
        errorCount++
        console.warn('EnhancedTurboMap: forEach failed:', error)
      }
    },

    [Symbol.iterator](): IterableIterator<[K, V]> {
      return this.entries()
    },

    // Statistics and diagnostics
    getMetrics() {
      return {
        size: this.size,
        operationCount,
        cacheHits,
        cacheMisses,
        cacheHitRate: operationCount > 0 ? cacheHits / operationCount : 0,
        errorCount,
        errorRate: operationCount > 0 ? errorCount / operationCount : 0,
        pluginStats: pluginManager?.getStatus(),
        cacheStats: cache?.getStats(),
        serializerStats: config.enableAdaptiveSerialization ? globalSerializer.getStats() : null
      }
    },

    debug() {
      return {
        size: this.size,
        internalMapSize: internalMap.size,
        keyMapSize: keyMap.size,
        config,
        health: this.getHealthStatus(),
        diagnostics: this.getDiagnostics()
      }
    },

    getDiagnostics() {
      if (!config.enableDiagnostics) {
        return null
      }
      
      const cacheStats = cache?.getStats()
      return globalDiagnostic.generateReport(
        internalMap,
        globalErrorRecovery.getStats(),
        cacheStats?.combined ? {
          hits: cacheStats.combined.hits,
          misses: cacheStats.combined.misses,
          hitRate: cacheStats.combined.hitRate,
          size: cacheStats.combined.totalSize
        } : undefined,
        pluginManager?.getStatus()
      )
    },

    getHealthStatus() {
      const errorRate = operationCount > 0 ? errorCount / operationCount : 0
      const cacheHitRate = operationCount > 0 ? cacheHits / operationCount : 0
      
      return {
        healthy: errorRate < 0.05 && !globalErrorRecovery.isInFallbackMode(),
        errorRate,
        cacheHitRate,
        inFallbackMode: globalErrorRecovery.isInFallbackMode(),
        score: this.getDiagnostics()?.healthScore || 0
      }
    },

    // Plugin management
    async addPlugin(plugin: TurboMapPlugin<K, V>): Promise<boolean> {
      if (!pluginManager) {
        console.warn('EnhancedTurboMap: Plugins not enabled')
        return false
      }
      return pluginManager.addPlugin(plugin)
    },

    async removePlugin(pluginName: string): Promise<boolean> {
      if (!pluginManager) return false
      return pluginManager.removePlugin(pluginName)
    },

    async enablePlugin(pluginName: string): Promise<boolean> {
      if (!pluginManager) return false
      return pluginManager.enablePlugin(pluginName)
    },

    async disablePlugin(pluginName: string): Promise<boolean> {
      if (!pluginManager) return false
      return pluginManager.disablePlugin(pluginName)
    },

    getPluginStats() {
      return pluginManager?.getStatus() || null
    },

    // Async operations
    toAsync(): AsyncTurboMapLike<K, V> {
      if (!config.enableAsync) {
        throw new Error('Async operations not enabled')
      }
      
      // Create a Map-compatible wrapper
      const mapWrapper = new Map<K, V>()
      for (const [key, value] of enhancedMap.entries()) {
        mapWrapper.set(key, value)
      }
      
      return new AsyncTurboMap(mapWrapper, {
        batchSize: config.batchSize,
        maxConcurrency: config.maxConcurrency
      })
    },

    // Performance
    optimize(): void {
      globalErrorRecovery.executeWithRecovery(
        () => {
          // Clear caches to force re-optimization
          cache?.clear()
          globalSerializer.clearCache()
          
          // Reset error recovery
          globalErrorRecovery.resetErrorHistory()
          
          console.log('EnhancedTurboMap: Optimization completed')
        },
        () => {
          console.warn('EnhancedTurboMap: Optimization failed')
        },
        'optimize',
        ErrorType.UNKNOWN
      )
    },

    reset(): void {
      globalErrorRecovery.executeWithRecovery(
        () => {
          this.clear()
          operationCount = 0
          cacheHits = 0
          cacheMisses = 0
          errorCount = 0
          
          // Reset components
          cache?.clear()
          globalSerializer.resetStats()
          globalDiagnostic.reset()
          globalErrorRecovery.resetErrorHistory()
          
          console.log('EnhancedTurboMap: Reset completed')
        },
        () => {
          console.warn('EnhancedTurboMap: Reset failed')
        },
        'reset',
        ErrorType.UNKNOWN
      )
    },

    // Serialization
    serialize(): string {
      return globalErrorRecovery.executeWithRecovery(
        () => {
          const entries = Array.from(this.entries())
          return JSON.stringify(entries)
        },
        () => {
          console.warn('EnhancedTurboMap: Serialization failed')
          return '[]'
        },
        'serialize',
        ErrorType.SERIALIZATION
      )
    },

    clone(): EnhancedTurboMapLike<K, V> {
      return globalErrorRecovery.executeWithRecovery(
        () => {
          const entriesArray: [K, V][] = []
          for (const [key, value] of enhancedMap.entries()) {
            entriesArray.push([key, value])
          }
          const cloned = createEnhancedTurboMap<K, V>(entriesArray, config)
          return cloned
        },
        () => {
          console.warn('EnhancedTurboMap: Clone failed, returning empty map')
          return createEnhancedTurboMap<K, V>([], config)
        },
        'clone',
        ErrorType.UNKNOWN
      )
    },

    // Memory management
    cleanup(): void {
      globalErrorRecovery.executeWithRecovery(
        () => {
          // Cleanup caches
          cache?.clear()
          globalSerializer.clearCache()
          
          // Force garbage collection if available
          if (typeof (globalThis as { global?: { gc?: () => void } }).global !== 'undefined' && (globalThis as { global?: { gc?: () => void } }).global?.gc) {
            (globalThis as { global?: { gc?: () => void } }).global!.gc!()
          }
          
          console.log('EnhancedTurboMap: Cleanup completed')
        },
        () => {
          console.warn('EnhancedTurboMap: Cleanup failed')
        },
        'cleanup',
        ErrorType.MEMORY
      )
    },

    compact(): void {
      globalErrorRecovery.executeWithRecovery(
        () => {
          // Remove any inconsistencies
          const toDelete: string[] = []
          for (const serializedKey of internalMap.keys()) {
            if (!keyMap.has(serializedKey)) {
              toDelete.push(serializedKey)
            }
          }
          
          for (const key of toDelete) {
            internalMap.delete(key)
          }
          
          console.log(`EnhancedTurboMap: Compacted, removed ${toDelete.length} orphaned entries`)
        },
        () => {
          console.warn('EnhancedTurboMap: Compact failed')
        },
        'compact',
        ErrorType.UNKNOWN
      )
    }
  }

  // Initialize with entries if provided
  if (entries) {
    try {
      for (const [key, value] of entries) {
        enhancedMap.set(key, value)
      }
    } catch (error) {
      errorCount++
      console.warn('EnhancedTurboMap: Failed to populate initial data:', error)
    }
  }

  // Setup auto-cleanup if enabled
  if (config.enableAutoCleanup) {
    setInterval(() => {
      enhancedMap.cleanup()
    }, config.cleanupInterval)
  }

  return enhancedMap
}

/**
 * Create fallback enhanced TurboMap for critical errors
 */
function createFallbackEnhancedTurboMap<K extends MapKey, V>(): EnhancedTurboMapLike<K, V> {
  const fallbackMap = new Map<K, V>()
  
  return {
    [Symbol.toStringTag]: 'EnhancedTurboMap',
    
    // Proxy all methods to the fallback map
    get size() { return fallbackMap.size },
    set: function(key: K, value: V) { fallbackMap.set(key, value); return this },
    get: (key: K) => fallbackMap.get(key),
    has: (key: K) => fallbackMap.has(key),
    delete: (key: K) => fallbackMap.delete(key),
    clear: () => fallbackMap.clear(),
    entries: () => fallbackMap.entries(),
    keys: () => fallbackMap.keys(),
    values: () => fallbackMap.values(),
    forEach: function(callback: (value: V, key: K, map: EnhancedTurboMapLike<K, V>) => void) { 
      fallbackMap.forEach((value, key) => callback(value, key, this))
    },
    [Symbol.iterator]: () => fallbackMap[Symbol.iterator](),
    
    // Enhanced methods (minimal implementation)
    getSerializedKey: (key: K) => JSON.stringify(key),
    setAll: function(entries: [K, V][]) { entries.forEach(([k, v]) => fallbackMap.set(k, v)); return this },
    getAll: (keys: K[]) => keys.map(k => fallbackMap.get(k)),
    deleteAll: (keys: K[]) => keys.map(k => fallbackMap.delete(k)),
    findByValue: () => undefined,
    filter: () => [],
    mapValues: () => createFallbackEnhancedTurboMap<K, unknown>(),
    getMetrics: () => ({
      size: fallbackMap.size,
      operationCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      errorCount: 1,
      errorRate: 1,
      fallbackMode: true
    }),
    debug: () => ({
      size: fallbackMap.size,
      internalMapSize: fallbackMap.size,
      keyMapSize: fallbackMap.size,
      config: { fallbackMode: true },
      health: { healthy: false, fallbackMode: true },
      diagnostics: null,
      fallbackMode: true
    }),
    getDiagnostics: () => null,
    getHealthStatus: () => ({
      healthy: false,
      errorRate: 1,
      cacheHitRate: 0,
      inFallbackMode: true,
      score: 0,
      fallbackMode: true
    }),
    addPlugin: async () => false,
    removePlugin: async () => false,
    enablePlugin: async () => false,
    disablePlugin: async () => false,
    getPluginStats: () => null,
    toAsync: () => { throw new Error('Async not available in fallback mode') },
    optimize: () => {},
    reset: () => fallbackMap.clear(),
    serialize: () => '[]',
    clone: () => createFallbackEnhancedTurboMap<K, V>(),
    cleanup: () => {},
    compact: () => {}
  } as EnhancedTurboMapLike<K, V>
}

// Export main creation function as default
export default createEnhancedTurboMap

// Export compatibility function
export { createEnhancedTurboMap as createTurboMap }
