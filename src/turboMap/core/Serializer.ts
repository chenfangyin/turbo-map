/**
 * Advanced serialization system with adaptive strategies
 */

import { TypeUtils } from '../utils/TypeUtils'
import { globalFastHasher } from '../utils/FastHash'
import { TieredCacheManager } from './CacheManager'

/**
 * Serialization context for tracking visited objects
 */
export interface SerializationContext {
  visited: WeakSet<object>
  cache: TieredCacheManager<string> | undefined
  depth: number
  maxDepth: number
}

/**
 * Serialization strategy interface
 */
export interface SerializationStrategy {
  name: string
  canHandle: (obj: unknown) => boolean
  serialize: (obj: unknown, context: SerializationContext) => string
  priority: number
}

/**
 * Adaptive serializer with multiple strategies
 */
export class AdaptiveSerializer {
  private strategies = new Map<string, SerializationStrategy>()
  private strategyStats = new Map<string, { usage: number, avgTime: number }>()
  private cache: TieredCacheManager<string> | undefined
  private enableMetrics: boolean
  private objectIdMap = new WeakMap<object, string>()

  constructor(enableCache = true, enableMetrics = true) {
    this.cache = enableCache ? new TieredCacheManager<string>({
      l1CacheSize: 1000,
      l2CacheSize: 5000,
      promoteThreshold: 3
    }) : undefined
    this.enableMetrics = enableMetrics
    this.initializeStrategies()
  }

  /**
   * Initialize built-in serialization strategies
   */
  private initializeStrategies(): void {
    // Primitive strategy
    this.addStrategy({
      name: 'primitive',
      priority: 100,
      canHandle: (obj) => TypeUtils.isPrimitive(obj),
      serialize: (obj) => {
        if (obj === null) return 'null'
        if (obj === undefined) return 'undefined'
        if (typeof obj === 'string') return `"${obj}"`
        if (typeof obj === 'symbol') return this.serializeSymbol(obj)
        if (typeof obj === 'bigint') return `${obj}n`
        return String(obj)
      }
    })

    // Simple object strategy (high priority for JSON-style output)
    this.addStrategy({
      name: 'simpleObject',
      priority: 95,
      canHandle: (obj) => TypeUtils.isSimpleObject(obj),
      serialize: (obj, context) => {
        try {
          const keys = Object.keys(obj as Record<string, unknown>).sort()
          const pairs = keys.map(key => {
            const value = (obj as Record<string, unknown>)[key]
            // Use serializeValue for nested values, but handle circular references properly
            const serializedValue = this.serializeValue(value, context)
            return `"${key}":${serializedValue}`
          })
          return `{${pairs.join(',')}}`
        } catch {
          return this.fallbackSerialize(obj)
        }
      }
    })

    // Simple array strategy (high priority for JSON-style output)
    this.addStrategy({
      name: 'simpleArray',
      priority: 90,
      canHandle: (obj) => {
        return Array.isArray(obj) && 
               obj.length <= 10 && 
               obj.every(item => TypeUtils.isPrimitive(item))
      },
      serialize: (obj) => {
        const items = (obj as unknown[]).map((item: unknown) => {
          if (item === null) return 'null'
          if (item === undefined) return 'undefined'
          if (typeof item === 'string') return `"${item}"`
          return String(item)
        })
        return `[${items.join(',')}]`
      }
    })

    // Date strategy
    this.addStrategy({
      name: 'date',
      priority: 85,
      canHandle: (obj) => obj instanceof Date,
      // 用户需求：无参数 new Date() 应该根据调用时机区分（不同的）
      // 所有 Date 对象都根据时间戳来区分
      serialize: (obj) => `[Date:${(obj as Date).getTime()}]`
    })

    // RegExp strategy
    this.addStrategy({
      name: 'regexp',
      priority: 85,
      canHandle: (obj) => obj instanceof RegExp,
      serialize: (obj) => `[RegExp:${(obj as RegExp).toString()}]`
    })

    // Error strategy
    this.addStrategy({
      name: 'error',
      priority: 85,
      canHandle: (obj) => obj instanceof Error,
      serialize: (obj) => `[Error:${(obj as Error).name}:${(obj as Error).message}]`
    })

    // Function strategy
    this.addStrategy({
      name: 'function',
      priority: 80,
      canHandle: (obj) => typeof obj === 'function',
      serialize: (obj) => `[Function:${(obj as Function).name || 'anonymous'}:${(obj as Function).length}]`
    })

    // Complex object strategy (fallback for complex objects)
    this.addStrategy({
      name: 'complex',
      priority: 75,
      canHandle: () => true,
      serialize: (obj, context) => this.deepSerialize(obj, context)
    })

    // Fast hash strategy for simple objects (lower priority)
    this.addStrategy({
      name: 'fastHash',
      priority: 10,
      canHandle: (obj) => {
        const result = globalFastHasher.fastHash(obj)
        return result !== null
      },
      serialize: (obj) => {
        const result = globalFastHasher.fastHash(obj)
        return result || this.fallbackSerialize(obj)
      }
    })
  }

  /**
   * Add a custom serialization strategy
   */
  addStrategy(strategy: SerializationStrategy): void {
    try {
      this.strategies.set(strategy.name, strategy)
      this.strategyStats.set(strategy.name, { usage: 0, avgTime: 0 })
    } catch (error) {
      console.warn('AdaptiveSerializer: Error adding strategy:', error)
    }
  }

  /**
   * Main serialization method
   */
  serialize(obj: unknown): string {
    try {
      // Check cache first
      if (this.cache && typeof obj === 'object' && obj !== null) {
        const cached = this.cache.get(this.getObjectId(obj))
        if (cached !== undefined) {
          return cached
        }
      }

      // Create context
      const context: SerializationContext = {
        visited: new WeakSet<object>(),
        cache: this.cache,
        depth: 0,
        maxDepth: 50
      }

      try {
        const result = this.serializeValue(obj, context)
        
        // Cache result if applicable
        if (this.cache && typeof obj === 'object' && obj !== null) {
          this.cache.set(this.getObjectId(obj), result)
        }

        return result
      } finally {
        // No need to release WeakSet - let it be garbage collected
      }
    } catch (error) {
      console.warn('AdaptiveSerializer: Serialization error:', error)
      return this.fallbackSerialize(obj)
    }
  }

  /**
   * Serialize a value using the best strategy
   */
  private serializeValue(obj: unknown, context: SerializationContext): string {
    try {
      // Depth check
      if (context.depth > context.maxDepth) {
        return '[MaxDepthExceeded]'
      }

      // Circular reference check - only for objects that are already visited
      if (typeof obj === 'object' && obj !== null) {
        if (context.visited.has(obj)) {
          // Generate unique identifier for circular references
          const objectId = this.getObjectId(obj);
          return `[Circular:${objectId}]`;
        }
      }

      // Find and apply best strategy
      const strategies = Array.from(this.strategies.values())
        .sort((a, b) => b.priority - a.priority)

      for (const strategy of strategies) {
        try {
          if (strategy.canHandle(obj)) {
            const startTime = this.enableMetrics ? performance.now() : 0
            
            // Add to visited set before calling strategy.serialize
            if (typeof obj === 'object' && obj !== null) {
              context.visited.add(obj)
            }
            
            const result = strategy.serialize(obj, {
              ...context,
              depth: context.depth + 1
            })
            
            if (this.enableMetrics) {
              this.updateStrategyStats(strategy.name, performance.now() - startTime)
            }
            
            return result
          }
        } catch (strategyError) {
          console.warn(`AdaptiveSerializer: Strategy ${strategy.name} failed:`, strategyError)
          continue
        }
      }

      return this.fallbackSerialize(obj)
    } catch (error) {
      console.warn('AdaptiveSerializer: Error in serializeValue:', error)
      return this.fallbackSerialize(obj)
    }
  }

  /**
   * Deep serialization for complex objects
   */
  private deepSerialize(obj: unknown, context: SerializationContext): string {
    try {
      if (Array.isArray(obj)) {
        const items = obj.map(item => this.serializeValue(item, context))
        return `[${items.join(',')}]`
      }

      if (obj && typeof obj === 'object') {
        const keys = Object.keys(obj as Record<string, unknown>).sort()
        const pairs = keys.map(key => {
          try {
            const value = this.serializeValue((obj as Record<string, unknown>)[key], context)
            return `"${key}":${value}`
          } catch {
            return `"${key}":"[SerializationError]"`
          }
        })
        return `{${pairs.join(',')}}`
      }

      return this.fallbackSerialize(obj)
    } catch {
      return this.fallbackSerialize(obj)
    }
  }

  /**
   * Fallback serialization
   */
  private fallbackSerialize(obj: unknown): string {
    try {
      if (obj === null) return 'null'
      if (obj === undefined) return 'undefined'
      if (typeof obj === 'string') return `"${obj}"`
      if (typeof obj === 'number') return String(obj)
      if (typeof obj === 'boolean') return String(obj)
      if (typeof obj === 'symbol') return this.serializeSymbol(obj)
      if (typeof obj === 'bigint') return `${obj}n`
      
      // Last resort - try JSON.stringify
      try {
        return JSON.stringify(obj) || '[UnserializableObject]'
      } catch {
        return `[${typeof obj}:${Object.prototype.toString.call(obj)}]`
      }
    } catch {
      return '[CriticalSerializationError]'
    }
  }

  /**
   * Serialize Symbol with proper uniqueness handling
   */
  private serializeSymbol(sym: symbol): string {
    try {
      // Check if it's a global symbol (created with Symbol.for())
      const globalKey = Symbol.keyFor(sym)
      if (globalKey !== undefined) {
        // Global symbols with same key should be treated as identical
        return `Symbol.for("${globalKey}")`
      }
      
      // 用户需求：所有普通 Symbol() 都应该被当作相同的键
      // 不管是否有 description，所有普通 Symbol 都返回相同的字符串
      return 'Symbol()'
    } catch {
      // Fallback for any errors
      return `Symbol(${sym.toString()})`
    }
  }

  /**
   * Get object identifier for caching
   */
  private getObjectId(obj: unknown): string {
    try {
      // Generate stable identifier for objects
      if (typeof obj === 'object' && obj !== null) {
        // Use object reference for stability
        if (this.objectIdMap.has(obj)) {
          return this.objectIdMap.get(obj)!
        }
        const newId = `obj_${Math.random().toString(36).substr(2, 9)}`
        this.objectIdMap.set(obj, newId)
        return newId
      }
      // Use object signature for stable caching for non-objects
      return `obj_${TypeUtils.getObjectSignature(obj)}`
    } catch {
      return `obj_unknown`
    }
  }

  /**
   * Update strategy statistics
   */
  private updateStrategyStats(strategyName: string, duration: number): void {
    try {
      const stats = this.strategyStats.get(strategyName)
      if (stats) {
        stats.usage++
        stats.avgTime = (stats.avgTime * (stats.usage - 1) + duration) / stats.usage
      }
    } catch (error) {
      console.warn('AdaptiveSerializer: Error updating stats:', error)
    }
  }

  /**
   * Get serialization statistics
   */
  getStats() {
    try {
      const strategyStats = Object.fromEntries(this.strategyStats)
      const cacheStats = this.cache?.getStats()
      const fastHashStats = globalFastHasher.getStats()

      return {
        strategies: strategyStats,
        cache: cacheStats,
        fastHash: fastHashStats,
        totalStrategies: this.strategies.size
      }
    } catch (error) {
      console.warn('AdaptiveSerializer: Error getting stats:', error)
      return {
        strategies: {},
        cache: null,
        fastHash: null,
        totalStrategies: 0
      }
    }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    try {
      this.strategyStats.forEach(stats => {
        stats.usage = 0
        stats.avgTime = 0
      })
      this.cache?.clear()
      globalFastHasher.resetStats()
    } catch (error) {
      console.warn('AdaptiveSerializer: Error resetting stats:', error)
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    try {
      this.cache?.clear()
    } catch (error) {
      console.warn('AdaptiveSerializer: Error clearing cache:', error)
    }
  }
}

// Global instance
export const globalSerializer = new AdaptiveSerializer()
