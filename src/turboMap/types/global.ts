/**
 * Global type definitions for cross-platform compatibility
 */

/**
 * Timer functions available on globalThis
 */
export interface GlobalTimers {
  setTimeout(callback: () => void, ms: number): number | NodeJS.Timeout
  clearTimeout(id: number | NodeJS.Timeout): void
}

/**
 * Node.js specific global features
 */
export interface NodeGlobal {
  global?: {
    gc?(): void
  }
  process?: {
    memoryUsage(): NodeJS.MemoryUsage
  }
}

/**
 * Cross-platform global object with type safety
 */
export type SafeGlobalThis = typeof globalThis & GlobalTimers & NodeGlobal

/**
 * Safely access global timer functions
 */
export const safeGlobalThis = globalThis as SafeGlobalThis

/**
 * Type-safe setTimeout
 */
export const safeSetTimeout = (callback: () => void, ms: number): number | NodeJS.Timeout => {
  return safeGlobalThis.setTimeout(callback, ms)
}

/**
 * Type-safe clearTimeout
 */
export const safeClearTimeout = (id: number | NodeJS.Timeout): void => {
  return safeGlobalThis.clearTimeout(id)
}

/**
 * Type-safe garbage collection (Node.js only)
 */
export const safeGarbageCollect = (): void => {
  if (typeof safeGlobalThis.global !== 'undefined' && safeGlobalThis.global.gc) {
    safeGlobalThis.global.gc()
  }
}

/**
 * Type-safe memory usage (Node.js only)
 */
export const safeMemoryUsage = (): NodeJS.MemoryUsage | null => {
  if (typeof safeGlobalThis.process !== 'undefined' && safeGlobalThis.process.memoryUsage) {
    return safeGlobalThis.process.memoryUsage()
  }
  return null
}
