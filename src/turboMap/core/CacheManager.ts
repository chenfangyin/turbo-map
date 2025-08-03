/**
 * Advanced caching system with tiered architecture
 */

/**
 * LRU cache node
 */
interface LRUNode<T> {
  key: string
  value: T
  prev: LRUNode<T> | undefined
  next: LRUNode<T> | undefined
  frequency: number | undefined
  lastAccess: number | undefined
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  evictions: number
  hitRate: number
  size: number
  maxSize: number
}

/**
 * Enhanced LRU cache with frequency tracking
 */
export class EnhancedLRUCache<T> {
  private cache = new Map<string, LRUNode<T>>()
  private head: LRUNode<T> | undefined
  private tail: LRUNode<T> | undefined
  private maxSize: number
  private stats: CacheStats

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      hitRate: 0,
      size: 0,
      maxSize
    }
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    try {
      const node = this.cache.get(key)
      if (node) {
        this.stats.hits++
        this.updateAccess(node)
        this.moveToHead(node)
        return node.value
      }
      this.stats.misses++
      this.updateHitRate()
      return undefined
    } catch (error) {
      console.warn('EnhancedLRUCache: Error in get:', error)
      this.stats.misses++
      this.updateHitRate()
      return undefined
    }
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T): void {
    try {
      this.stats.sets++
      
      const existingNode = this.cache.get(key)
      if (existingNode) {
        existingNode.value = value
        this.updateAccess(existingNode)
        this.moveToHead(existingNode)
        return
      }

      const newNode: LRUNode<T> = {
        key,
        value,
        prev: undefined,
        next: undefined,
        frequency: 1,
        lastAccess: Date.now()
      }

      this.cache.set(key, newNode)
      this.addToHead(newNode)
      this.stats.size++

      if (this.cache.size > this.maxSize) {
        this.removeTail()
      }

      this.updateHitRate()
    } catch (error) {
      console.warn('EnhancedLRUCache: Error in set:', error)
    }
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    try {
      const node = this.cache.get(key)
      if (node) {
        this.removeNode(node)
        this.cache.delete(key)
        this.stats.deletes++
        this.stats.size--
        this.updateHitRate()
        return true
      }
      return false
    } catch (error) {
      console.warn('EnhancedLRUCache: Error in delete:', error)
      return false
    }
  }

  /**
   * Update access statistics
   */
  private updateAccess(node: LRUNode<T>): void {
    try {
      node.frequency = (node.frequency || 0) + 1
      node.lastAccess = Date.now()
    } catch (error) {
      console.warn('EnhancedLRUCache: Error updating access:', error)
    }
  }

  /**
   * Move node to head
   */
  private moveToHead(node: LRUNode<T>): void {
    try {
      if (!node) return
      this.removeNode(node)
      this.addToHead(node)
    } catch (error) {
      console.warn('EnhancedLRUCache: Error moving to head:', error)
    }
  }

  /**
   * Add node to head
   */
  private addToHead(node: LRUNode<T>): void {
    try {
      if (!node) return
      node.prev = undefined
      node.next = this.head
      if (this.head) {
        this.head.prev = node
      }
      this.head = node
      if (!this.tail) {
        this.tail = node
      }
    } catch (error) {
      console.warn('EnhancedLRUCache: Error adding to head:', error)
    }
  }

  /**
   * Remove node from list
   */
  private removeNode(node: LRUNode<T>): void {
    try {
      if (!node) return
      if (node.prev) {
        node.prev.next = node.next
      } else {
        this.head = node.next
      }
      if (node.next) {
        node.next.prev = node.prev
      } else {
        this.tail = node.prev
      }
    } catch (error) {
      console.warn('EnhancedLRUCache: Error removing node:', error)
    }
  }

  /**
   * Remove tail node
   */
  private removeTail(): void {
    try {
      if (this.tail) {
        this.cache.delete(this.tail.key)
        this.removeNode(this.tail)
        this.stats.evictions++
        this.stats.size--
      }
    } catch (error) {
      console.warn('EnhancedLRUCache: Error removing tail:', error)
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Clear cache
   */
  clear(): void {
    try {
      this.cache.clear()
      this.head = undefined
      this.tail = undefined
      this.stats.size = 0
    } catch (error) {
      console.warn('EnhancedLRUCache: Error clearing cache:', error)
    }
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size
  }
}

/**
 * Tiered cache configuration
 */
export interface TieredCacheOptions {
  l1CacheSize: number
  l2CacheSize: number
  promoteThreshold: number
  enableCompression?: boolean
}

/**
 * Two-level cache system
 */
export class TieredCacheManager<T> {
  private l1Cache: EnhancedLRUCache<T>
  private l2Cache: EnhancedLRUCache<T>
  private promoteThreshold: number
  private accessCounts = new Map<string, number>()

  constructor(options: TieredCacheOptions) {
    // Validate and sanitize options
    const l1Size = Math.max(1, options.l1CacheSize || 100)
    const l2Size = Math.max(1, options.l2CacheSize || 1000)
    const threshold = Math.max(1, options.promoteThreshold || 3)
    
    this.l1Cache = new EnhancedLRUCache<T>(l1Size)
    this.l2Cache = new EnhancedLRUCache<T>(l2Size)
    this.promoteThreshold = threshold
  }

  /**
   * Get value from tiered cache
   */
  get(key: string): T | undefined {
    try {
      // Try L1 first
      let value = this.l1Cache.get(key)
      if (value !== undefined) {
        return value
      }

      // Try L2
      value = this.l2Cache.get(key)
      if (value !== undefined) {
        this.trackAccess(key)
        return value
      }

      return undefined
    } catch (error) {
      console.warn('TieredCacheManager: Error in get:', error)
      return undefined
    }
  }

  /**
   * Set value in tiered cache
   */
  set(key: string, value: T): void {
    try {
      // Set in L2 only initially
      this.l2Cache.set(key, value)
    } catch (error) {
      console.warn('TieredCacheManager: Error in set:', error)
    }
  }

  /**
   * Track access for promotion
   */
  private trackAccess(key: string): void {
    try {
      const count = this.accessCounts.get(key) || 0
      const newCount = count + 1
      this.accessCounts.set(key, newCount)

      // Promote to L1 if threshold reached
      if (newCount >= this.promoteThreshold) {
        const value = this.l2Cache.get(key)
        if (value !== undefined) {
          this.l1Cache.set(key, value)
        }
        this.accessCounts.delete(key)
      }
    } catch (error) {
      console.warn('TieredCacheManager: Error tracking access:', error)
    }
  }

  /**
   * Delete from both caches
   */
  delete(key: string): boolean {
    try {
      const l1Deleted = this.l1Cache.delete(key)
      const l2Deleted = this.l2Cache.delete(key)
      this.accessCounts.delete(key)
      return l1Deleted || l2Deleted
    } catch (error) {
      console.warn('TieredCacheManager: Error in delete:', error)
      return false
    }
  }

  /**
   * Get combined statistics
   */
  getStats() {
    try {
      const l1Stats = this.l1Cache.getStats()
      const l2Stats = this.l2Cache.getStats()
      
      return {
        l1: l1Stats,
        l2: l2Stats,
        combined: {
          hits: l1Stats.hits + l2Stats.hits,
          misses: l1Stats.misses + l2Stats.misses,
          hitRate: (l1Stats.hits + l2Stats.hits) / 
                   (l1Stats.hits + l2Stats.hits + l1Stats.misses + l2Stats.misses),
          totalSize: l1Stats.size + l2Stats.size,
          pendingPromotions: this.accessCounts.size
        }
      }
    } catch (error) {
      console.warn('TieredCacheManager: Error getting stats:', error)
      return {
        l1: this.l1Cache.getStats(),
        l2: this.l2Cache.getStats(),
        combined: { hits: 0, misses: 0, hitRate: 0, totalSize: 0, pendingPromotions: 0 }
      }
    }
  }

  /**
   * Clear all caches
   */
  clear(): void {
    try {
      this.l1Cache.clear()
      this.l2Cache.clear()
      this.accessCounts.clear()
    } catch (error) {
      console.warn('TieredCacheManager: Error clearing:', error)
    }
  }
}
