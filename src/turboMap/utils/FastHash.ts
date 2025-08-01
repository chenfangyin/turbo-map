/**
 * Enhanced fast hashing utilities
 */

import { TypeUtils } from './TypeUtils'

/**
 * Enhanced fast hash implementation with multiple strategies
 */
export class FastHasher {
  private strategyCache = new Map<string, (obj: unknown) => string | null>()
  private hitCount = 0
  private totalCount = 0

  constructor() {
    this.initializeStrategies()
  }

  /**
   * Initialize hashing strategies
   */
  private initializeStrategies(): void {
    // Primitive strategies
    this.strategyCache.set('primitive:number', (obj) => `num:${obj}`)
    this.strategyCache.set('primitive:string', (obj) => `str:${obj}`)
    this.strategyCache.set('primitive:boolean', (obj) => `bool:${obj}`)
    this.strategyCache.set('primitive:null', () => 'null')
    this.strategyCache.set('primitive:undefined', () => 'undefined')
    this.strategyCache.set('primitive:symbol', (obj) => `sym:${(obj as symbol).toString()}`)
    this.strategyCache.set('primitive:bigint', (obj) => `big:${(obj as bigint).toString()}`)

    // Object strategies
    this.strategyCache.set('date', (obj) => `d:${(obj as Date).getTime()}`)
    this.strategyCache.set('regexp', (obj) => `r:${(obj as RegExp).toString()}`)
    this.strategyCache.set('error', (obj) => `err:${(obj as Error).name}:${(obj as Error).message}`)
    this.strategyCache.set('function', (obj) => `fn:${(obj as Function).name || 'anonymous'}:${(obj as Function).length}`)

    // Array strategy
    this.strategyCache.set('array', (obj) => {
      const arr = obj as unknown[]
      if (arr.length === 0) return 'arr:[]'
      const items = arr.map(item => {
        if (this.isPrimitive(item)) {
          return String(item)
        }
        return 'complex'
      })
      return `arr:${arr.length}:${items.join(',')}`
    })

    // Simple object strategies
    for (let i = 0; i <= 5; i++) {
      this.strategyCache.set(`object:${i}:`, (_obj) => this.hashSimpleObject(_obj))
    }
  }

  /**
   * Check if value is primitive
   */
  private isPrimitive(value: unknown): boolean {
    return value === null ||
           value === undefined ||
           typeof value === 'string' ||
           typeof value === 'number' ||
           typeof value === 'boolean' ||
           typeof value === 'symbol' ||
           typeof value === 'bigint'
  }

  /**
   * Fast hash for simple objects
   */
  fastHash(obj: unknown): string | null {
    this.totalCount++
    
    try {
      // Check cache first
      const signature = TypeUtils.getObjectSignature(obj)
      const cached = this.strategyCache.get(signature)
      if (cached) {
        const result = cached(obj)
        if (result) {
          this.hitCount++
          return result
        }
      }

      // Try type-specific strategies first
      if (this.isPrimitive(obj)) {
        const type = obj === null ? 'null' : typeof obj
        const strategy = this.strategyCache.get(`primitive:${type}`)
        if (strategy) {
          const result = strategy(obj)
          if (result) {
            this.strategyCache.set(signature, strategy)
            return result
          }
        }
      }

      if (obj instanceof Date) {
        const strategy = this.strategyCache.get('date')
        if (strategy) {
          const result = strategy(obj)
          if (result) {
            this.strategyCache.set(signature, strategy)
            return result
          }
        }
      }

      if (obj instanceof RegExp) {
        const strategy = this.strategyCache.get('regexp')
        if (strategy) {
          const result = strategy(obj)
          if (result) {
            this.strategyCache.set(signature, strategy)
            return result
          }
        }
      }

      if (obj instanceof Error) {
        const strategy = this.strategyCache.get('error')
        if (strategy) {
          const result = strategy(obj)
          if (result) {
            this.strategyCache.set(signature, strategy)
            return result
          }
        }
      }

      if (typeof obj === 'function') {
        const strategy = this.strategyCache.get('function')
        if (strategy) {
          const result = strategy(obj)
          if (result) {
            this.strategyCache.set(signature, strategy)
            return result
          }
        }
      }

      if (Array.isArray(obj)) {
        const strategy = this.strategyCache.get('array')
        if (strategy) {
          const result = strategy(obj)
          if (result) {
            this.strategyCache.set(signature, strategy)
            return result
          }
        }
        // Fallback to simple array hashing
        const result = this.hashSimpleArray(obj)
        if (result) {
          this.strategyCache.set(signature, (obj) => this.hashSimpleArray(obj as unknown[]))
          return result
        }
      }

      // Try object strategies for simple objects
      if (typeof obj === 'object' && obj !== null) {
        const keys = Object.keys(obj as Record<string, unknown>)
        for (let i = 0; i <= 5; i++) {
          if (keys.length <= i) {
            const strategy = this.strategyCache.get(`object:${i}:`)
            if (strategy) {
              const result = strategy(obj)
              if (result) {
                this.strategyCache.set(signature, strategy)
                return result
              }
            }
          }
        }
      }

      // Try custom strategies (but not object strategies)
      for (const [key, strategy] of this.strategyCache.entries()) {
        if (!key.startsWith('object:') && !key.startsWith('primitive:')) {
          const result = strategy(obj)
          if (result) {
            this.strategyCache.set(signature, strategy)
            return result
          }
        }
      }

      // Try simple object hashing as last resort
      const result = this.hashSimpleObject(obj)
      if (result) {
        this.strategyCache.set(signature, (_obj) => this.hashSimpleObject(_obj))
        return result
      }

      return null
    } catch {
      return null
    }
  }

  /**
   * Hash simple object with known structure
   */
  private hashSimpleObject(obj: unknown, depth: number = 0, visited: WeakSet<object> = new WeakSet()): string | null {
    try {
      // Prevent infinite recursion
      if (depth > 10) {
        return 'obj:max_depth'
      }
      
      // Basic object check
      if (typeof obj !== 'object' || obj === null) {
        return null
      }

      // Circular reference check
      if (visited.has(obj as object)) {
        // Generate unique identifier for circular references
        const objectId = this.getObjectId(obj as object);
        return `obj:circular:${objectId}`;
      }
      visited.add(obj as object)
      
      const keys = Object.keys(obj as Record<string, unknown>).sort()
      if (keys.length === 0) return 'obj:{}'
      
      const pairs = keys.map(key => {
        const value = (obj as Record<string, unknown>)[key]
        if (this.isPrimitive(value)) {
          return `${key}:${value}`
        }
        // For nested objects, include their content for better uniqueness
        if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            const arrayHash = this.hashSimpleArray(value)
            return `${key}:${arrayHash || 'complex'}`
          } else {
            // Recursively hash nested objects with depth limit
            const nestedHash = this.hashSimpleObject(value, depth + 1, visited)
            return `${key}:${nestedHash || 'complex'}`
          }
        }
        return `${key}:complex`
      })
      
      return `obj:{${pairs.join(',')}}`
    } catch {
      return null
    }
  }

  /**
   * Hash simple array with primitive values
   */
  private hashSimpleArray(arr: unknown[]): string | null {
    try {
      if (arr.length === 0) return 'arr:[]'
      
      const items = arr.map(item => {
        if (this.isPrimitive(item)) {
          return String(item)
        }
        return 'complex'
      })
      
      return `arr:${arr.length}:${items.join(',')}`
    } catch {
      return null
    }
  }

  /**
   * Get unique object identifier
   */
  private getObjectId(_obj: object): string {
    // Use object reference as unique identifier
    return `ref_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
  }

  /**
   * Get performance statistics
   */
  getStats() {
    return {
      hitCount: this.hitCount,
      totalCount: this.totalCount,
      hitRate: this.totalCount > 0 ? this.hitCount / this.totalCount : 0,
      strategies: this.strategyCache.size
    }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hitCount = 0
    this.totalCount = 0
  }

  /**
   * Add custom strategy
   */
  addStrategy(signature: string, strategy: (obj: unknown) => string | null): void {
    try {
      if (typeof signature === 'string' && typeof strategy === 'function') {
        this.strategyCache.set(signature, strategy)
      }
    } catch (error) {
      console.warn('FastHasher: Error adding strategy:', error)
    }
  }
}

// Global instance
export const globalFastHasher = new FastHasher()
