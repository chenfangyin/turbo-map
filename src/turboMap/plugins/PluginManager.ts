/**
 * Enhanced plugin management system
 */

import { MapKey } from '../utils/TypeUtils'
import { globalErrorRecovery, ErrorType } from '../utils/ErrorRecovery'
import { safeSetTimeout, safeClearTimeout } from '../types/global'

/**
 * Plugin lifecycle hooks
 */
export interface TurboMapPlugin<K extends MapKey, V> {
  name: string
  version?: string
  priority?: number
  enabled?: boolean
  
  // Lifecycle hooks
  beforeSet?(key: K, value: V): { key: K; value: V } | null
  afterSet?(key: K, value: V): void
  beforeGet?(key: K): K | null
  afterGet?(key: K, value: V | undefined): V | undefined
  beforeDelete?(key: K): K | null
  afterDelete?(key: K, deleted: boolean): void
  beforeClear?(): boolean // return false to prevent clear
  afterClear?(): void
  
  // Advanced hooks
  onError?(error: Error, operation: string, key?: K): void
  onMetricsUpdate?(metrics: {
    size: number
    operationCount: number
    cacheHits: number
    cacheMisses: number
    errorCount: number
    [key: string]: unknown
  }): void
  
  // Plugin lifecycle
  onInstall?(): Promise<void> | void
  onUninstall?(): Promise<void> | void
  onEnable?(): Promise<void> | void
  onDisable?(): Promise<void> | void
}

/**
 * Plugin execution context
 */
export interface PluginContext<K extends MapKey, V> {
  operation: string
  key?: K
  value?: V
  metadata?: Record<string, unknown>
  timestamp: number
}

/**
 * Plugin statistics
 */
export interface PluginStats {
  name: string
  executions: number
  errors: number
  totalTime: number
  averageTime: number
  lastExecution?: number
  enabled: boolean
}

/**
 * Plugin manager configuration
 */
export interface PluginManagerOptions {
  enableStats: boolean
  maxExecutionTime: number
  enableErrorRecovery: boolean
  pluginTimeout: number
}

/**
 * Enhanced plugin manager
 */
export class PluginManager<K extends MapKey, V> {
  private plugins = new Map<string, TurboMapPlugin<K, V>>()
  private pluginStats = new Map<string, PluginStats>()
  private options: PluginManagerOptions
  private globalEnabled = true

  constructor(options: Partial<PluginManagerOptions> = {}) {
    this.options = {
      enableStats: true,
      maxExecutionTime: 100,
      enableErrorRecovery: true,
      pluginTimeout: 5000,
      ...options
    }
  }

  /**
   * Add a plugin
   */
  async addPlugin(plugin: TurboMapPlugin<K, V>): Promise<boolean> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        if (!plugin || typeof plugin !== 'object') {
          throw new Error('Invalid plugin: must be an object')
        }
        
        if (!plugin.name || typeof plugin.name !== 'string') {
          throw new Error('Invalid plugin: must have a string name property')
        }

        if (this.plugins.has(plugin.name)) {
          console.warn(`Plugin ${plugin.name} already exists, replacing...`)
        }

        // Initialize plugin
        if (plugin.onInstall) {
          await this.executeWithTimeout(
            () => plugin.onInstall!(),
            this.options.pluginTimeout,
            `install:${plugin.name}`
          )
        }

        // Set defaults
        plugin.enabled = plugin.enabled !== false
        plugin.priority = plugin.priority || 0

        this.plugins.set(plugin.name, plugin)
        this.pluginStats.set(plugin.name, {
          name: plugin.name,
          executions: 0,
          errors: 0,
          totalTime: 0,
          averageTime: 0,
          enabled: plugin.enabled
        })

        // Enable if needed
        if (plugin.enabled && plugin.onEnable) {
          await this.executeWithTimeout(
            () => plugin.onEnable!(),
            this.options.pluginTimeout,
            `enable:${plugin.name}`
          )
        }

        return true
      },
      async () => {
        console.error(`Failed to add plugin: ${plugin?.name || 'unknown'}`)
        return false
      },
      'addPlugin',
      ErrorType.PLUGIN
    )
  }

  /**
   * Remove a plugin
   */
  async removePlugin(pluginName: string): Promise<boolean> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        if (typeof pluginName !== 'string') {
          throw new Error('Plugin name must be a string')
        }

        const plugin = this.plugins.get(pluginName)
        if (!plugin) {
          return false
        }

        // Disable first
        if (plugin.enabled && plugin.onDisable) {
          await this.executeWithTimeout(
            () => plugin.onDisable!(),
            this.options.pluginTimeout,
            `disable:${pluginName}`
          )
        }

        // Uninstall
        if (plugin.onUninstall) {
          await this.executeWithTimeout(
            () => plugin.onUninstall!(),
            this.options.pluginTimeout,
            `uninstall:${pluginName}`
          )
        }

        this.plugins.delete(pluginName)
        this.pluginStats.delete(pluginName)
        return true
      },
      async () => {
        console.error(`Failed to remove plugin: ${pluginName}`)
        return false
      },
      'removePlugin',
      ErrorType.PLUGIN
    )
  }

  /**
   * Enable a plugin
   */
  async enablePlugin(pluginName: string): Promise<boolean> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        const plugin = this.plugins.get(pluginName)
        if (!plugin) {
          return false
        }

        if (plugin.enabled) {
          return true
        }

        plugin.enabled = true
        
        if (plugin.onEnable) {
          await this.executeWithTimeout(
            () => plugin.onEnable!(),
            this.options.pluginTimeout,
            `enable:${pluginName}`
          )
        }

        const stats = this.pluginStats.get(pluginName)
        if (stats) {
          stats.enabled = true
        }

        return true
      },
      async () => {
        console.error(`Failed to enable plugin: ${pluginName}`)
        return false
      },
      'enablePlugin',
      ErrorType.PLUGIN
    )
  }

  /**
   * Disable a plugin
   */
  async disablePlugin(pluginName: string): Promise<boolean> {
    return globalErrorRecovery.executeAsyncWithRecovery(
      async () => {
        const plugin = this.plugins.get(pluginName)
        if (!plugin) {
          return false
        }

        if (!plugin.enabled) {
          return true
        }

        plugin.enabled = false
        
        if (plugin.onDisable) {
          await this.executeWithTimeout(
            () => plugin.onDisable!(),
            this.options.pluginTimeout,
            `disable:${pluginName}`
          )
        }

        const stats = this.pluginStats.get(pluginName)
        if (stats) {
          stats.enabled = false
        }

        return true
      },
      async () => {
        console.error(`Failed to disable plugin: ${pluginName}`)
        return false
      },
      'disablePlugin',
      ErrorType.PLUGIN
    )
  }

  /**
   * Execute before hooks
   */
  executeBefore<T>(
    hookName: keyof TurboMapPlugin<K, V>,
    context: PluginContext<K, V>,
    ...args: unknown[]
  ): T | null {
    if (!this.globalEnabled) {
      return args[0] as T
    }

    const plugins = this.getActivePlugins()
    let result = args[0] as T

    for (const plugin of plugins) {
      try {
        const hook = plugin[hookName] as (...args: unknown[]) => unknown
        if (typeof hook === 'function') {
          const startTime = performance.now()
          
          const hookResult = hook.apply(plugin, args)
          if (hookResult !== undefined && hookResult !== null) {
            result = hookResult as T
          }

          if (this.options.enableStats) {
            this.updateStats(plugin.name, performance.now() - startTime, false)
          }
        }
      } catch (error) {
        this.handlePluginError(plugin, error as Error, context)
      }
    }

    return result
  }

  /**
   * Execute after hooks
   */
  executeAfter<T>(
    hookName: keyof TurboMapPlugin<K, V>,
    context: PluginContext<K, V>,
    ...args: unknown[]
  ): T | undefined {
    if (!this.globalEnabled) {
      return args[0] as T
    }

    const plugins = this.getActivePlugins()
    let result = args[0] as T

    for (const plugin of plugins) {
      try {
        const hook = plugin[hookName] as (...args: unknown[]) => unknown
        if (typeof hook === 'function') {
          const startTime = performance.now()
          
          const hookResult = hook.apply(plugin, args)
          if (hookResult !== undefined && hookResult !== null) {
            result = hookResult as T
          }

          if (this.options.enableStats) {
            this.updateStats(plugin.name, performance.now() - startTime, false)
          }
        }
      } catch (error) {
        this.handlePluginError(plugin, error as Error, context)
      }
    }

    return result
  }

  /**
   * Get active plugins sorted by priority
   */
  private getActivePlugins(): TurboMapPlugin<K, V>[] {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.enabled !== false)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  /**
   * Handle plugin errors
   */
  private handlePluginError(
    plugin: TurboMapPlugin<K, V>,
    error: Error,
    context: PluginContext<K, V>
  ): void {
    if (this.options.enableStats) {
      this.updateStats(plugin.name, 0, true)
    }

    if (this.options.enableErrorRecovery) {
      const action = globalErrorRecovery.handleError(
        error,
        `plugin:${plugin.name}:${context.operation}`,
        ErrorType.PLUGIN
      )

      // Auto-disable problematic plugins
      if (action === globalErrorRecovery.constructor.name) {
        plugin.enabled = false
        console.warn(`Auto-disabled problematic plugin: ${plugin.name}`)
      }
    }

    // Call plugin's error handler if available
    try {
      if (plugin.onError) {
        plugin.onError(error, context.operation, context.key)
      }
    } catch (handlerError) {
      console.error(`Plugin ${plugin.name} error handler failed:`, handlerError)
    }
  }

  /**
   * Update plugin statistics
   */
  private updateStats(pluginName: string, duration: number, isError: boolean): void {
    try {
      const stats = this.pluginStats.get(pluginName)
      if (stats) {
        stats.executions++
        if (isError) {
          stats.errors++
        } else {
          stats.totalTime += duration
          stats.averageTime = stats.totalTime / (stats.executions - stats.errors)
        }
        stats.lastExecution = Date.now()
      }
    } catch (error) {
      console.warn('PluginManager: Error updating stats:', error)
    }
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T> | T,
    timeout: number,
    operation: string
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = safeSetTimeout(() => {
        reject(new Error(`Plugin operation timed out: ${operation}`))
      }, timeout)

      try {
        const result = fn()
        if (result instanceof Promise) {
          result
            .then(value => {
              safeClearTimeout(timer)
              resolve(value)
            })
            .catch(error => {
              safeClearTimeout(timer)
              reject(error)
            })
        } else {
          safeClearTimeout(timer)
          resolve(result)
        }
      } catch (error) {
        safeClearTimeout(timer)
        reject(error)
      }
    })
  }

  /**
   * Get plugin by name
   */
  getPlugin(name: string): TurboMapPlugin<K, V> | undefined {
    return this.plugins.get(name)
  }

  /**
   * Get all plugins
   */
  getAllPlugins(): TurboMapPlugin<K, V>[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get plugin statistics
   */
  getPluginStats(name?: string): PluginStats | PluginStats[] {
    if (name) {
      const stats = this.pluginStats.get(name)
      return stats ? { ...stats } : {
        name,
        executions: 0,
        errors: 0,
        totalTime: 0,
        averageTime: 0,
        enabled: false
      }
    }
    return Array.from(this.pluginStats.values()).map(stats => ({ ...stats }))
  }

  /**
   * Clear all statistics
   */
  clearStats(): void {
    for (const stats of this.pluginStats.values()) {
      stats.executions = 0
      stats.errors = 0
      stats.totalTime = 0
      stats.averageTime = 0
      delete stats.lastExecution
    }
  }

  /**
   * Enable/disable all plugins
   */
  setGlobalEnabled(enabled: boolean): void {
    this.globalEnabled = enabled
  }

  /**
   * Check if plugins are globally enabled
   */
  isGlobalEnabled(): boolean {
    return this.globalEnabled
  }

  /**
   * Get manager status
   */
  getStatus() {
    const plugins = Array.from(this.plugins.values())
    const stats = Array.from(this.pluginStats.values())
    
    return {
      totalPlugins: plugins.length,
      enabledPlugins: plugins.filter(p => p.enabled !== false).length,
      totalExecutions: stats.reduce((sum, s) => sum + s.executions, 0),
      totalErrors: stats.reduce((sum, s) => sum + s.errors, 0),
      globalEnabled: this.globalEnabled,
      averageExecutionTime: this.calculateAverageExecutionTime(),
      errorRate: this.calculateErrorRate()
    }
  }

  /**
   * Calculate average execution time across all plugins
   */
  private calculateAverageExecutionTime(): number {
    const stats = Array.from(this.pluginStats.values())
    const totalTime = stats.reduce((sum, s) => sum + s.totalTime, 0)
    const totalExecutions = stats.reduce((sum, s) => sum + (s.executions - s.errors), 0)
    return totalExecutions > 0 ? totalTime / totalExecutions : 0
  }

  /**
   * Calculate error rate across all plugins
   */
  private calculateErrorRate(): number {
    const stats = Array.from(this.pluginStats.values())
    const totalErrors = stats.reduce((sum, s) => sum + s.errors, 0)
    const totalExecutions = stats.reduce((sum, s) => sum + s.executions, 0)
    return totalExecutions > 0 ? totalErrors / totalExecutions : 0
  }
}
