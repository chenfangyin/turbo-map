/**
 * Object pool for reducing GC pressure
 */

/**
 * Generic object pool
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn: (obj: T) => void
  private maxSize: number

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void = () => {},
    maxSize: number = 100
  ) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.maxSize = maxSize
  }

  /**
   * Get an object from the pool or create a new one
   */
  acquire(): T {
    const obj = this.pool.pop()
    if (obj) {
      return obj
    }
    return this.createFn()
  }

  /**
   * Return an object to the pool
   */
  release(obj: T): void {
    try {
      if (this.pool.length < this.maxSize) {
        this.resetFn(obj)
        this.pool.push(obj)
      }
    } catch (error) {
      console.warn('ObjectPool: Error releasing object:', error)
    }
  }

  /**
   * Get current pool size
   */
  get size(): number {
    return this.pool.length
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool.length = 0
  }
}

/**
 * Enhanced WeakSet pool with multiple types
 */
export class EnhancedObjectPool {
  private weakSetPool: WeakSet<object>[] = []
  private mapPool: Map<string, unknown>[] = []
  private arrayPool: unknown[][] = []
  private objectPool: Record<string, unknown>[] = []
  
  private readonly maxPoolSize = 50

  /**
   * Get a WeakSet from the pool
   */
  getWeakSet(): WeakSet<object> {
    const weakSet = this.weakSetPool.pop()
    if (weakSet) {
      return weakSet
    }
    return new WeakSet<object>()
  }

  /**
   * Return a WeakSet to the pool
   */
  releaseWeakSet(weakSet: WeakSet<object>): void {
    try {
      if (this.weakSetPool.length < this.maxPoolSize) {
        // WeakSet cannot be cleared, but that's okay for our use case
        this.weakSetPool.push(weakSet)
      }
    } catch (error) {
      console.warn('EnhancedObjectPool: Error releasing WeakSet:', error)
    }
  }

  /**
   * Get a Map from the pool
   */
  getMap<K, V>(): Map<K, V> {
    const map = this.mapPool.pop() as Map<K, V>
    if (map) {
      map.clear()
      return map
    }
    return new Map<K, V>()
  }

  /**
   * Return a Map to the pool
   */
  releaseMap(map: Map<unknown, unknown>): void {
    try {
      if (this.mapPool.length < this.maxPoolSize) {
        map.clear()
        this.mapPool.push(map as Map<string, unknown>)
      }
    } catch (error) {
      console.warn('EnhancedObjectPool: Error releasing Map:', error)
    }
  }

  /**
   * Get an Array from the pool
   */
  getArray<T>(): T[] {
    const array = this.arrayPool.pop() as T[]
    if (array) {
      array.length = 0
      return array
    }
    return []
  }

  /**
   * Return an Array to the pool
   */
  releaseArray(array: unknown[]): void {
    try {
      if (this.arrayPool.length < this.maxPoolSize) {
        array.length = 0
        this.arrayPool.push(array)
      }
    } catch (error) {
      console.warn('EnhancedObjectPool: Error releasing Array:', error)
    }
  }

  /**
   * Get a plain object from the pool
   */
  getObject(): Record<string, unknown> {
    const obj = this.objectPool.pop()
    if (obj) {
      // Clear all properties
      for (const key in obj) {
        delete obj[key]
      }
      return obj
    }
    return {}
  }

  /**
   * Return a plain object to the pool
   */
  releaseObject(obj: Record<string, unknown>): void {
    try {
      if (this.objectPool.length < this.maxPoolSize) {
        // Clear all properties
        for (const key in obj) {
          delete obj[key]
        }
        this.objectPool.push(obj)
      }
    } catch (error) {
      console.warn('EnhancedObjectPool: Error releasing Object:', error)
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      weakSetPool: this.weakSetPool.length,
      mapPool: this.mapPool.length,
      arrayPool: this.arrayPool.length,
      objectPool: this.objectPool.length,
      totalSize: this.weakSetPool.length + this.mapPool.length + 
                 this.arrayPool.length + this.objectPool.length
    }
  }

  /**
   * Clear all pools
   */
  clear(): void {
    this.weakSetPool.length = 0
    this.mapPool.length = 0
    this.arrayPool.length = 0
    this.objectPool.length = 0
  }
}

// Global instance
export const globalObjectPool = new EnhancedObjectPool()
