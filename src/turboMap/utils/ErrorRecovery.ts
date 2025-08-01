/**
 * Error recovery and resilience system
 */

import { safeSetTimeout } from '../types/global'

/**
 * Recovery action types
 */
export enum RecoveryAction {
  RETRY = 'retry',
  FALLBACK_MODE = 'fallback',
  SKIP = 'skip',
  ABORT = 'abort'
}

/**
 * Error classification
 */
export enum ErrorType {
  SERIALIZATION = 'serialization',
  CACHE = 'cache',
  ITERATION = 'iteration',
  PLUGIN = 'plugin',
  MEMORY = 'memory',
  UNKNOWN = 'unknown'
}

/**
 * Error statistics
 */
export interface ErrorStats {
  total: number
  byType: Record<ErrorType, number>
  byOperation: Record<string, number>
  recoveryActions: Record<RecoveryAction, number>
  lastError?: {
    type: ErrorType
    operation: string
    message: string
    timestamp: number
  }
}

/**
 * Recovery policy
 */
export interface RecoveryPolicy {
  maxRetries: number
  retryDelay: number
  escalationThreshold: number
  fallbackMode: boolean
}

/**
 * Error recovery manager
 */
export class ErrorRecoveryManager {
  private errorHistory = new Map<string, number>()
  private errorStats: ErrorStats
  private policies = new Map<ErrorType, RecoveryPolicy>()
  private globalFallbackMode = false

  constructor() {
    this.errorStats = {
      total: 0,
      byType: Object.fromEntries(Object.values(ErrorType).map(type => [type, 0])) as Record<ErrorType, number>,
      byOperation: {},
      recoveryActions: Object.fromEntries(Object.values(RecoveryAction).map(action => [action, 0])) as Record<RecoveryAction, number>
    }

    this.initializePolicies()
  }

  /**
   * Initialize default recovery policies
   */
  private initializePolicies(): void {
    // Serialization errors - be more permissive
    this.policies.set(ErrorType.SERIALIZATION, {
      maxRetries: 2,
      retryDelay: 0,
      escalationThreshold: 5,
      fallbackMode: true
    })

    // Cache errors - retry more aggressively
    this.policies.set(ErrorType.CACHE, {
      maxRetries: 3,
      retryDelay: 10,
      escalationThreshold: 10,
      fallbackMode: true
    })

    // Iteration errors - be conservative
    this.policies.set(ErrorType.ITERATION, {
      maxRetries: 1,
      retryDelay: 0,
      escalationThreshold: 3,
      fallbackMode: true
    })

    // Plugin errors - isolate and continue
    this.policies.set(ErrorType.PLUGIN, {
      maxRetries: 0,
      retryDelay: 0,
      escalationThreshold: 1,
      fallbackMode: false
    })

    // Memory errors - immediate fallback
    this.policies.set(ErrorType.MEMORY, {
      maxRetries: 0,
      retryDelay: 0,
      escalationThreshold: 1,
      fallbackMode: true
    })

    // Unknown errors - minimal retries
    this.policies.set(ErrorType.UNKNOWN, {
      maxRetries: 1,
      retryDelay: 100,
      escalationThreshold: 5,
      fallbackMode: true
    })
  }

  /**
   * Handle an error and determine recovery action
   */
  handleError(
    error: Error,
    operation: string,
    errorType: ErrorType = ErrorType.UNKNOWN
  ): RecoveryAction {
    try {
      // Update statistics
      this.updateStats(error, operation, errorType)

      // Check global fallback mode
      if (this.globalFallbackMode) {
        this.errorStats.recoveryActions[RecoveryAction.FALLBACK_MODE]++
        return RecoveryAction.FALLBACK_MODE
      }

      // Get policy for this error type
      const policy = this.policies.get(errorType) || this.policies.get(ErrorType.UNKNOWN)!

      // Check error frequency
      const errorKey = `${operation}:${errorType}`
      const currentCount = this.errorHistory.get(errorKey) || 0
      this.errorHistory.set(errorKey, currentCount + 1)

      // Determine recovery action
      let action: RecoveryAction

      if (currentCount >= policy.escalationThreshold) {
        // Too many errors - escalate
        if (policy.fallbackMode) {
          action = RecoveryAction.FALLBACK_MODE
          this.globalFallbackMode = true
        } else {
          action = RecoveryAction.SKIP
        }
      } else if (currentCount < policy.maxRetries) {
        // Within retry limit
        action = RecoveryAction.RETRY
        if (policy.retryDelay > 0) {
          // Could implement delay here if needed
        }
      } else {
        // Exceeded retries
        if (policy.fallbackMode) {
          action = RecoveryAction.FALLBACK_MODE
        } else {
          action = RecoveryAction.SKIP
        }
      }

      this.errorStats.recoveryActions[action]++
      return action

    } catch (recoveryError) {
      console.error('ErrorRecoveryManager: Error in error handling:', recoveryError)
      this.errorStats.recoveryActions[RecoveryAction.ABORT]++
      return RecoveryAction.ABORT
    }
  }

  /**
   * Update error statistics
   */
  private updateStats(error: Error, operation: string, errorType: ErrorType): void {
    try {
      this.errorStats.total++
      this.errorStats.byType[errorType]++
      this.errorStats.byOperation[operation] = (this.errorStats.byOperation[operation] || 0) + 1
      
      this.errorStats.lastError = {
        type: errorType,
        operation,
        message: error.message,
        timestamp: Date.now()
      }
    } catch (statsError) {
      console.warn('ErrorRecoveryManager: Error updating stats:', statsError)
    }
  }

  /**
   * Execute operation with error recovery
   */
  executeWithRecovery<T>(
    operation: () => T,
    fallback: () => T,
    operationName: string,
    errorType: ErrorType = ErrorType.UNKNOWN
  ): T {
    try {
      return operation()
    } catch (error) {
      const action = this.handleError(error as Error, operationName, errorType)
      
      switch (action) {
        case RecoveryAction.RETRY:
          try {
            return operation()
          } catch (retryError) {
            console.warn(`ErrorRecoveryManager: Retry failed for ${operationName}:`, retryError)
            return fallback()
          }
          
        case RecoveryAction.FALLBACK_MODE:
        case RecoveryAction.SKIP:
          return fallback()
          
        case RecoveryAction.ABORT:
        default:
          throw error
      }
    }
  }

  /**
   * Execute async operation with error recovery
   */
  async executeAsyncWithRecovery<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
    operationName: string,
    errorType: ErrorType = ErrorType.UNKNOWN
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      const action = this.handleError(error as Error, operationName, errorType)
      
      switch (action) {
        case RecoveryAction.RETRY:
          try {
            const policy = this.policies.get(errorType)
            if (policy && policy.retryDelay > 0) {
              await this.delay(policy.retryDelay)
            }
            return await operation()
          } catch (retryError) {
            console.warn(`ErrorRecoveryManager: Async retry failed for ${operationName}:`, retryError)
            return await fallback()
          }
          
        case RecoveryAction.FALLBACK_MODE:
        case RecoveryAction.SKIP:
          return await fallback()
          
        case RecoveryAction.ABORT:
        default:
          throw error
      }
    }
  }

  /**
   * Delay utility for async retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => safeSetTimeout(resolve, ms))
  }

  /**
   * Reset error history for an operation
   */
  resetErrorHistory(operation?: string, errorType?: ErrorType): void {
    try {
      if (operation && errorType) {
        const errorKey = `${operation}:${errorType}`
        this.errorHistory.delete(errorKey)
      } else if (operation) {
        // Reset all errors for this operation
        for (const key of this.errorHistory.keys()) {
          if (key.startsWith(`${operation}:`)) {
            this.errorHistory.delete(key)
          }
        }
      } else {
        // Reset all
        this.errorHistory.clear()
        this.globalFallbackMode = false
      }
    } catch (error) {
      console.warn('ErrorRecoveryManager: Error resetting history:', error)
    }
  }

  /**
   * Get error statistics
   */
  getStats(): ErrorStats {
    return { ...this.errorStats }
  }

  /**
   * Update recovery policy
   */
  setPolicy(errorType: ErrorType, policy: RecoveryPolicy): void {
    try {
      this.policies.set(errorType, { ...policy })
    } catch (error) {
      console.warn('ErrorRecoveryManager: Error setting policy:', error)
    }
  }

  /**
   * Get current policy
   */
  getPolicy(errorType: ErrorType): RecoveryPolicy | undefined {
    try {
      const policy = this.policies.get(errorType)
      return policy ? { ...policy } : undefined
    } catch (error) {
      console.warn('ErrorRecoveryManager: Error getting policy:', error)
      return undefined
    }
  }

  /**
   * Check if in global fallback mode
   */
  isInFallbackMode(): boolean {
    return this.globalFallbackMode
  }

  /**
   * Force exit fallback mode
   */
  exitFallbackMode(): void {
    this.globalFallbackMode = false
    this.errorHistory.clear()
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    try {
      const totalOperations = Object.values(this.errorStats.byOperation).reduce((sum, count) => sum + count, 0)
      const errorRate = totalOperations > 0 ? this.errorStats.total / totalOperations : 0
      
      return {
        healthy: errorRate < 0.1 && !this.globalFallbackMode,
        errorRate,
        totalErrors: this.errorStats.total,
        inFallbackMode: this.globalFallbackMode,
        criticalErrors: this.errorStats.byType[ErrorType.MEMORY] + this.errorStats.byType[ErrorType.UNKNOWN],
        status: this.globalFallbackMode ? 'degraded' : 
                errorRate > 0.2 ? 'warning' : 
                errorRate > 0.1 ? 'caution' : 'healthy'
      }
    } catch (error) {
      console.warn('ErrorRecoveryManager: Error getting health status:', error)
      return {
        healthy: false,
        errorRate: 1,
        totalErrors: this.errorStats.total,
        inFallbackMode: true,
        criticalErrors: 999,
        status: 'unknown'
      }
    }
  }
}

// Global instance
export const globalErrorRecovery = new ErrorRecoveryManager()
