/**
 * Async TurboMap implementation for non-blocking operations
 */

import type { MapKey } from '../utils/TypeUtils'
import { globalErrorRecovery, ErrorType } from '../utils/ErrorRecovery'
import { safeSetTimeout } from '../types/global'

/**
 * Async operation result
 */
export interface AsyncResult<T> {
  success: boolean
  data?: T
  error?: Error
  duration: number
}

/**
 * Batch operation for async processing
 */
export interface BatchOperation<K, V> {
  type: 'set' | 'get' | 'delete' | 'has'
  key: K
  value: V | undefined
  id: string | number | undefined
}

/**
 * Batch result
 */
export interface BatchResult<V> {
  id: string | number | undefined
  success: boolean
  data: V | boolean | undefined
  error: Error | undefined
}

/**
 * Async TurboMap interface
 */
export interface AsyncTurboMapLike<K extends MapKey, V> {
  // Async methods
  setAsync(key: K, value: V): Promise<this>
  getAsync(key: K): Promise<V | undefined>
  hasAsync(key: K): Promise<boolean>
  deleteAsync(key: K): Promise<boolean>
  clearAsync(): Promise<void>
  
  // Batch operations
  batchExecute<T extends V>(operations: BatchOperation<K, V>[]): Promise<BatchResult<T>[]>
  setAllAsync(entries: [K, V][]): Promise<this>
  getAllAsync(keys: K[]): Promise<(V | undefined)[]>
  deleteAllAsync(keys: K[]): Promise<boolean[]>
  
  // Stream operations
  stream(): AsyncTurboMapStream<K, V>
  
  // Utility
  sizeAsync(): Promise<number>
  entriesAsync(): AsyncIterableIterator<[K, V]>
  keysAsync(): AsyncIterableIterator<K>
  valuesAsync(): AsyncIterableIterator<V>
}

/**
 * Async TurboMap stream interface
 */
export interface AsyncTurboMapStream<K, V> {
  filter(predicate: (entry: [K, V]) => boolean | Promise<boolean>): AsyncTurboMapStream<K, V>
  map<U>(transform: (entry: [K, V]) => [K, U] | Promise<[K, U]>): AsyncTurboMapStream<K, U>
  forEach(callback: (entry: [K, V]) => void | Promise<void>): Promise<void>
  collect(): Promise<Map<K, V>>
  toArray(): Promise<[K, V][]>
  reduce<T>(
    callback: (accumulator: T, entry: [K, V]) => T | Promise<T>,
    initialValue: T
  ): Promise<T>
}

/**
 * Async processing options
 */
export interface AsyncOptions {
  batchSize?: number
  delayBetweenBatches?: number
  maxConcurrency?: number
  timeoutMs?: number
  enableProgress?: boolean
}

/**
 * Progress callback
 */
export type ProgressCallback = (completed: number, total: number, percentage: number) => void

/**
 * Async TurboMap implementation
 */
export class AsyncTurboMap<K extends MapKey, V> implements AsyncTurboMapLike<K, V> {
  private syncMap: Map<K, V>
  private options: AsyncOptions

  constructor(
    syncMap: Map<K, V>,
    options: AsyncOptions = {}
  ) {
    this.syncMap = syncMap
    this.options = {
      batchSize: 100,
      delayBetweenBatches: 1,
      maxConcurrency: 10,
      timeoutMs: 30000,
      enableProgress: false,
      ...options
    }
  }

  /**
   * Async set operation
   */
  async setAsync(key: K, value: V): Promise<this> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        await this.nextTick()
        this.syncMap.set(key, value)
        return this
      },
      async () => {
        console.warn('AsyncTurboMap: Failed to set key, using fallback')
        return this
      },
      'setAsync',
      ErrorType.UNKNOWN
    )
  }

  /**
   * Async get operation
   */
  async getAsync(key: K): Promise<V | undefined> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        await this.nextTick()
        return this.syncMap.get(key)
      },
      async () => {
        console.warn('AsyncTurboMap: Failed to get key, returning undefined')
        return undefined
      },
      'getAsync',
      ErrorType.UNKNOWN
    )
  }

  /**
   * Async has operation
   */
  async hasAsync(key: K): Promise<boolean> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        await this.nextTick()
        return this.syncMap.has(key)
      },
      async () => {
        console.warn('AsyncTurboMap: Failed to check key, returning false')
        return false
      },
      'hasAsync',
      ErrorType.UNKNOWN
    )
  }

  /**
   * Async delete operation
   */
  async deleteAsync(key: K): Promise<boolean> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        await this.nextTick()
        return this.syncMap.delete(key)
      },
      async () => {
        console.warn('AsyncTurboMap: Failed to delete key, returning false')
        return false
      },
      'deleteAsync',
      ErrorType.UNKNOWN
    )
  }

  /**
   * Async clear operation
   */
  async clearAsync(): Promise<void> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        await this.nextTick()
        this.syncMap.clear()
      },
      async () => {
        console.warn('AsyncTurboMap: Failed to clear map')
      },
      'clearAsync',
      ErrorType.UNKNOWN
    )
  }

  /**
   * Batch execute operations
   */
  async batchExecute<T extends V>(operations: BatchOperation<K, V>[]): Promise<BatchResult<T>[]> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        const results: BatchResult<T>[] = []
        const { batchSize = 100, delayBetweenBatches = 1 } = this.options

        for (let i = 0; i < operations.length; i += batchSize) {
          const batch = operations.slice(i, i + batchSize)
          const batchResults = await this.processBatch<T>(batch)
          results.push(...batchResults)

          // Small delay between batches to prevent blocking
          if (i + batchSize < operations.length && delayBetweenBatches > 0) {
            await this.delay(delayBetweenBatches)
          }
        }

        return results
      },
      async () => {
        console.warn('AsyncTurboMap: Batch execution failed, returning empty results')
        return []
      },
      'batchExecute',
      ErrorType.UNKNOWN
    )
  }

  /**
   * Process a single batch of operations
   */
  private async processBatch<T extends V>(operations: BatchOperation<K, V>[]): Promise<BatchResult<T>[]> {
    const results: BatchResult<T>[] = []

    for (const operation of operations) {
      try {
        let data: V | boolean | undefined
        let success = true

        switch (operation.type) {
          case 'set':
            if (operation.value !== undefined) {
              this.syncMap.set(operation.key, operation.value)
              data = true
            } else {
              success = false
            }
            break

          case 'get':
            data = this.syncMap.get(operation.key)
            break

          case 'delete':
            data = this.syncMap.delete(operation.key)
            break

          case 'has':
            data = this.syncMap.has(operation.key)
            break

          default:
            success = false
            break
        }

        results.push({
          id: operation.id,
          success,
          data: data as T | boolean,
          error: undefined
        })

      } catch (error) {
        results.push({
          id: operation.id,
          success: false,
          data: undefined,
          error: error as Error
        })
      }
    }

    return results
  }

  /**
   * Set multiple entries async
   */
  async setAllAsync(entries: [K, V][]): Promise<this> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        const operations: BatchOperation<K, V>[] = entries.map(([key, value], index) => ({
          type: 'set' as const,
          key,
          value,
          id: index
        }))

        await this.batchExecute(operations)
        return this
      },
      async () => {
        console.warn('AsyncTurboMap: setAllAsync failed, using fallback')
        return this
      },
      'setAllAsync',
      ErrorType.UNKNOWN
    )
  }

  /**
   * Get multiple values async
   */
  async getAllAsync(keys: K[]): Promise<(V | undefined)[]> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        const operations: BatchOperation<K, V>[] = keys.map((key, index) => ({
          type: 'get' as const,
          key,
          value: undefined,
          id: index
        }))

        const results = await this.batchExecute(operations)
        return results.map(result => result.data as V | undefined)
      },
      async () => {
        console.warn('AsyncTurboMap: getAllAsync failed, returning empty array')
        return []
      },
      'getAllAsync',
      ErrorType.UNKNOWN
    )
  }

  /**
   * Delete multiple keys async
   */
  async deleteAllAsync(keys: K[]): Promise<boolean[]> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        const operations: BatchOperation<K, V>[] = keys.map((key, index) => ({
          type: 'delete' as const,
          key,
          value: undefined,
          id: index
        }))

        const results = await this.batchExecute(operations)
        return results.map(result => result.data as boolean)
      },
      async () => {
        console.warn('AsyncTurboMap: deleteAllAsync failed, returning empty array')
        return []
      },
      'deleteAllAsync',
      ErrorType.UNKNOWN
    )
  }

  /**
   * Get size async
   */
  async sizeAsync(): Promise<number> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        await this.nextTick()
        return this.syncMap.size
      },
      async () => {
        console.warn('AsyncTurboMap: sizeAsync failed, returning 0')
        return 0
      },
      'sizeAsync',
      ErrorType.UNKNOWN
    )
  }

  /**
   * Create async stream
   */
  stream(): AsyncTurboMapStream<K, V> {
    return new TurboMapAsyncStream(this.syncMap, this.options)
  }

  /**
   * Async entries iterator
   */
  async* entriesAsync(): AsyncIterableIterator<[K, V]> {
    try {
      const entries = Array.from(this.syncMap.entries())
      const { batchSize = 100, delayBetweenBatches = 1 } = this.options

      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize)
        
        for (const entry of batch) {
          yield entry
        }

        if (i + batchSize < entries.length && delayBetweenBatches > 0) {
          await this.delay(delayBetweenBatches)
        }
      }
    } catch (error) {
      console.warn('AsyncTurboMap: entriesAsync failed:', error)
    }
  }

  /**
   * Async keys iterator
   */
  async* keysAsync(): AsyncIterableIterator<K> {
    for await (const [key] of this.entriesAsync()) {
      yield key
    }
  }

  /**
   * Async values iterator
   */
  async* valuesAsync(): AsyncIterableIterator<V> {
    for await (const [, value] of this.entriesAsync()) {
      yield value
    }
  }

  /**
   * Next tick helper
   */
  private async nextTick(): Promise<void> {
    return new Promise(resolve => safeSetTimeout(resolve, 0))
  }

  /**
   * Delay helper
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => safeSetTimeout(resolve, ms))
  }
}

/**
 * Async stream implementation
 */
class TurboMapAsyncStream<K, V> implements AsyncTurboMapStream<K, V> {
  private entries: [K, V][]
  private options: AsyncOptions

  constructor(syncMap: Map<K, V>, options: AsyncOptions) {
    this.entries = Array.from(syncMap.entries())
    this.options = options
  }

  /**
   * Filter entries async
   */
  filter(predicate: (entry: [K, V]) => boolean | Promise<boolean>): AsyncTurboMapStream<K, V> {
    const newStream = new TurboMapAsyncStream<K, V>(new Map(), this.options)
    // Add filter predicate to stream for later execution
    ;(newStream as TurboMapAsyncStream<K, V> & { filterPredicate: typeof predicate; sourceEntries: [K, V][] }).filterPredicate = predicate
    ;(newStream as TurboMapAsyncStream<K, V> & { filterPredicate: typeof predicate; sourceEntries: [K, V][] }).sourceEntries = this.entries
    
    return newStream
  }

  /**
   * Map entries async
   */
  map<U>(transform: (entry: [K, V]) => [K, U] | Promise<[K, U]>): AsyncTurboMapStream<K, U> {
    const newStream = new TurboMapAsyncStream<K, U>(new Map(), this.options)
    // Add map transform to stream for later execution
    ;(newStream as TurboMapAsyncStream<K, U> & { mapTransform: typeof transform; sourceEntries: [K, V][] }).mapTransform = transform
    ;(newStream as TurboMapAsyncStream<K, U> & { mapTransform: typeof transform; sourceEntries: [K, V][] }).sourceEntries = this.entries
    
    return newStream
  }

  /**
   * Execute forEach on all entries
   */
  async forEach(callback: (entry: [K, V]) => void | Promise<void>): Promise<void> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        const { batchSize = 100, delayBetweenBatches = 1 } = this.options

        for (let i = 0; i < this.entries.length; i += batchSize) {
          const batch = this.entries.slice(i, i + batchSize)
          
          for (const entry of batch) {
            await callback(entry)
          }

          if (i + batchSize < this.entries.length && delayBetweenBatches > 0) {
            await this.delay(delayBetweenBatches)
          }
        }
      },
      async () => {
        console.warn('AsyncTurboMapStream: forEach failed')
      },
      'streamForEach',
      ErrorType.ITERATION
    )
  }

  /**
   * Collect stream to Map
   */
  async collect(): Promise<Map<K, V>> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        return new Map(this.entries)
      },
      async () => {
        console.warn('AsyncTurboMapStream: collect failed, returning empty Map')
        return new Map()
      },
      'streamCollect',
      ErrorType.UNKNOWN
    )
  }

  /**
   * Convert stream to array
   */
  async toArray(): Promise<[K, V][]> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        return [...this.entries]
      },
      async () => {
        console.warn('AsyncTurboMapStream: toArray failed, returning empty array')
        return []
      },
      'streamToArray',
      ErrorType.UNKNOWN
    )
  }

  /**
   * Reduce stream entries
   */
  async reduce<T>(
    callback: (accumulator: T, entry: [K, V]) => T | Promise<T>,
    initialValue: T
  ): Promise<T> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        let accumulator = initialValue
        const { batchSize = 100, delayBetweenBatches = 1 } = this.options

        for (let i = 0; i < this.entries.length; i += batchSize) {
          const batch = this.entries.slice(i, i + batchSize)
          
          for (const entry of batch) {
            accumulator = await callback(accumulator, entry)
          }

          if (i + batchSize < this.entries.length && delayBetweenBatches > 0) {
            await this.delay(delayBetweenBatches)
          }
        }

        return accumulator
      },
      async () => {
        console.warn('AsyncTurboMapStream: reduce failed, returning initial value')
        return initialValue
      },
      'streamReduce',
      ErrorType.UNKNOWN
    )
  }

  /**
   * Delay helper
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => safeSetTimeout(resolve, ms))
  }
}
