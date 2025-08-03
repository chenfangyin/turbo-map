/**
 * Type utilities for TurboMap
 */

/**
 * Primitive key types
 */
export type PrimitiveKey = string | number | boolean | null | undefined | symbol | bigint

/**
 * Object key types
 */
export type ObjectKey = object | Function | Date | RegExp | Error

/**
 * All supported Map key types
 */
export type MapKey = PrimitiveKey | ObjectKey

/**
 * Enhanced type checking utilities
 */
export class TypeUtils {
  /**
   * Check if value is a primitive type
   */
  static isPrimitive(value: unknown): value is PrimitiveKey {
    return value === null || 
           value === undefined ||
           typeof value === 'string' ||
           typeof value === 'number' ||
           typeof value === 'boolean' ||
           typeof value === 'symbol' ||
           typeof value === 'bigint'
  }

  /**
   * Check if value is a simple object (no nested complexity)
   */
  static isSimpleObject(value: unknown): boolean {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false
    }
    
    // Check for special object types
    if (value instanceof Date || 
        value instanceof RegExp || 
        value instanceof Error || 
        value instanceof Map || 
        value instanceof Set) {
      return false
    }
    
    // Check for functions
    if (typeof value === 'function') {
      return false
    }
    
    try {
      const keys = Object.keys(value)
      
      // Check for getters/setters
      if (keys.length > 0) {
        const firstKey = keys[0]
        if (firstKey !== undefined) {
          const descriptor = Object.getOwnPropertyDescriptor(value, firstKey)
          if (descriptor && (descriptor.get || descriptor.set)) {
            return false
          }
        }
      }
      
      return keys.length <= 5 && keys.every(key => {
        const prop = (value as Record<string, unknown>)[key]
        // Allow nested objects but check they are also simple
        if (this.isPrimitive(prop) || prop === null) {
          return true
        }
        if (typeof prop === 'object' && prop !== null) {
          return this.isSimpleObject(prop)
        }
        return false
      })
    } catch {
      return false
    }
  }

  /**
   * Get object type signature for optimization
   */
  static getObjectSignature(obj: unknown): string {
    if (this.isPrimitive(obj)) {
      return `primitive:${typeof obj}`
    }
    
    if (Array.isArray(obj)) {
      // 用全部元素的实际值生成签名，递归嵌套对象
      const elementHash = obj.map(item => {
        if (typeof item === 'string') {
          return `str:${item}`
        } else if (typeof item === 'number') {
          return `num:${item}`
        } else if (typeof item === 'boolean') {
          return `bool:${item}`
        } else if (item === null) {
          return 'null'
        } else if (typeof item === 'object') {
          return this.getObjectSignature(item)
        }
        return typeof item
      }).join(',')
      return `array:${obj.length}:${elementHash}`
    }
    
    if (obj instanceof Date) {
      return 'date'
    }
    
    if (obj instanceof RegExp) {
      return 'regexp'
    }
    
    if (obj instanceof Error) {
      return 'error'
    }
    
    if (typeof obj === 'function') {
      return 'function'
    }
    
    try {
      const keys = Object.keys(obj).sort()
      const keySignature = keys.slice(0, 3).join(',')
      // 递归前两个属性的值摘要
      const valueHash = keys.slice(0, 2).map(key => {
        const value = (obj as Record<string, unknown>)[key]
        if (typeof value === 'string') {
          return `str:${value}`
        } else if (typeof value === 'number') {
          return `num:${value}`
        } else if (typeof value === 'boolean') {
          return `bool:${value}`
        } else if (value === null) {
          return 'null'
        } else if (typeof value === 'object') {
          return this.getObjectSignature(value)
        }
        return typeof value
      }).join(',')
      return `object:${keys.length}:${keySignature}:${valueHash}`
    } catch {
      return 'unknown'
    }
  }

  /**
   * Safe property access
   */
  static safeAccess<T>(obj: unknown, accessor: () => T, fallback: T): T {
    try {
      if (obj === null || obj === undefined) {
        return fallback
      }
      const result = accessor()
      return result !== undefined ? result : fallback
    } catch {
      return fallback
    }
  }

  /**
   * Check if object can be safely serialized
   */
  static isSerializable(obj: unknown, visited = new WeakSet<object>()): boolean {
    try {
      if (this.isPrimitive(obj)) {
        // Symbol and undefined are not JSON serializable
        if (typeof obj === 'symbol' || obj === undefined) {
          return false
        }
        return true
      }
      
      if (typeof obj === 'object' && obj !== null) {
        if (visited.has(obj)) {
          return false // Circular reference
        }
        visited.add(obj)
        
        if (Array.isArray(obj)) {
          return obj.every(item => this.isSerializable(item, visited))
        }
        
        return Object.values(obj).every(value => this.isSerializable(value, visited))
      }
      
      return false
    } catch {
      return false
    }
  }
}
