/**
 * Enhanced diagnostic and monitoring utilities
 */

/**
 * Performance profile data
 */
export interface PerformanceProfile {
  operations: Record<string, {
    count: number
    totalTime: number
    averageTime: number
    minTime: number
    maxTime: number
    lastExecuted: number
  }>
  hotspots: {
    operation: string
    averageTime: number
    count: number
  }[]
  trends: {
    timestamp: number
    operation: string
    duration: number
  }[]
}

/**
 * Memory diagnostic information
 */
export interface MemoryDiagnostic {
  heapUsed: number
  heapTotal: number
  external: number
  estimatedMapSize: number
  keyDistribution: Record<string, number>
  largestKeys: {
    key: string
    size: number
  }[]
  memoryTrend: {
    timestamp: number
    usage: number
  }[]
}

/**
 * Error analysis data
 */
export interface ErrorAnalysis {
  totalErrors: number
  errorsByType: Record<string, number>
  errorsByOperation: Record<string, number>
  recentErrors: {
    timestamp: number
    type: string
    operation: string
    message: string
  }[]
  errorTrends: {
    timestamp: number
    count: number
  }[]
}

/**
 * Optimization suggestions
 */
export interface OptimizationSuggestion {
  type: 'performance' | 'memory' | 'error' | 'config'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
  impact: string
  effort: 'low' | 'medium' | 'high'
}

/**
 * Complete diagnostic information
 */
export interface DiagnosticInfo {
  performanceProfile: PerformanceProfile
  memoryUsage: MemoryDiagnostic
  errorAnalysis: ErrorAnalysis
  optimizationSuggestions: OptimizationSuggestion[]
  healthScore: number
  recommendations: string[]
}

/**
 * Performance monitor for detailed tracking
 */
export class PerformanceMonitor {
  private operations = new Map<string, {
    count: number
    totalTime: number
    minTime: number
    maxTime: number
    lastExecuted: number
  }>()
  private trends: { timestamp: number; operation: string; duration: number }[] = []
  private maxTrendEntries = 1000

  /**
   * Track operation performance
   */
  trackOperation(operation: string, duration: number): void {
    try {
      const existing = this.operations.get(operation)
      const now = Date.now()
      
      if (existing) {
        existing.count++
        existing.totalTime += duration
        existing.minTime = Math.min(existing.minTime, duration)
        existing.maxTime = Math.max(existing.maxTime, duration)
        existing.lastExecuted = now
      } else {
        this.operations.set(operation, {
          count: 1,
          totalTime: duration,
          minTime: duration,
          maxTime: duration,
          lastExecuted: now
        })
      }

      // Add to trends
      this.trends.push({ timestamp: now, operation, duration })
      
      // Keep trends under limit
      if (this.trends.length > this.maxTrendEntries) {
        this.trends = this.trends.slice(-this.maxTrendEntries)
      }
    } catch (error) {
      console.warn('PerformanceMonitor: Error tracking operation:', error)
    }
  }

  /**
   * Get performance profile
   */
  getProfile(): PerformanceProfile {
    try {
      const operations: Record<string, {
        count: number
        totalTime: number
        averageTime: number
        minTime: number
        maxTime: number
        lastExecuted: number
      }> = {}
      
      for (const [name, data] of this.operations) {
        operations[name] = {
          count: data.count,
          totalTime: data.totalTime,
          averageTime: data.totalTime / data.count,
          minTime: data.minTime,
          maxTime: data.maxTime,
          lastExecuted: data.lastExecuted
        }
      }

      // Find hotspots (slowest operations)
      const hotspots = Array.from(this.operations.entries())
        .map(([operation, data]) => ({
          operation,
          averageTime: data.totalTime / data.count,
          count: data.count
        }))
        .sort((a, b) => b.averageTime - a.averageTime)
        .slice(0, 10)

      return {
        operations,
        hotspots,
        trends: [...this.trends]
      }
    } catch (error) {
      console.warn('PerformanceMonitor: Error getting profile:', error)
      return {
        operations: {},
        hotspots: [],
        trends: []
      }
    }
  }

  /**
   * Reset performance data
   */
  reset(): void {
    this.operations.clear()
    this.trends.length = 0
  }

  /**
   * Get operation statistics
   */
  getOperationStats(operation: string) {
    const data = this.operations.get(operation)
    if (!data) {
      return null
    }

    return {
      count: data.count,
      totalTime: data.totalTime,
      averageTime: data.totalTime / data.count,
      minTime: data.minTime,
      maxTime: data.maxTime,
      lastExecuted: data.lastExecuted
    }
  }
}

/**
 * Memory analyzer for detailed memory tracking
 */
export class MemoryAnalyzer {
  private memoryTrend: { timestamp: number; usage: number }[] = []
  private maxTrendEntries = 500

  /**
   * Analyze map memory usage
   */
  analyzeMap<K, V>(map: Map<K, V>): MemoryDiagnostic {
    try {
      // Get Node.js memory usage if available
      const nodeMemory = this.getNodeMemoryUsage()
      
      // Estimate map size
      const estimatedSize = this.estimateMapSize(map)
      
      // Analyze key distribution
      const keyDistribution = this.analyzeKeyDistribution(map)
      
      // Find largest keys
      const largestKeys = this.findLargestKeys(map)
      
      // Update memory trend
      this.updateMemoryTrend(nodeMemory.heapUsed)

      return {
        heapUsed: nodeMemory.heapUsed,
        heapTotal: nodeMemory.heapTotal,
        external: nodeMemory.external,
        estimatedMapSize: estimatedSize,
        keyDistribution,
        largestKeys,
        memoryTrend: [...this.memoryTrend]
      }
    } catch (error) {
      console.warn('MemoryAnalyzer: Error analyzing map:', error)
      return {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        estimatedMapSize: 0,
        keyDistribution: {},
        largestKeys: [],
        memoryTrend: []
      }
    }
  }

  /**
   * Get Node.js memory usage
   */
  private getNodeMemoryUsage() {
    try {
          const nodeGlobal = globalThis as { process?: { memoryUsage(): NodeJS.MemoryUsage } }
          if (typeof nodeGlobal.process !== 'undefined' && nodeGlobal.process.memoryUsage) {
            return nodeGlobal.process.memoryUsage()
      }
    } catch {
      // Ignore errors
    }
    
    return {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      rss: 0
    }
  }

  /**
   * Estimate map memory usage
   */
  private estimateMapSize<K, V>(map: Map<K, V>): number {
    try {
      if (map.size === 0) return 0
      
      // Sample some entries to estimate average size
      const sampleSize = Math.min(10, map.size)
      let totalEstimate = 0
      let count = 0
      
      for (const [key, value] of map) {
        if (count >= sampleSize) break
        
        const keySize = this.estimateObjectSize(key)
        const valueSize = this.estimateObjectSize(value)
        totalEstimate += keySize + valueSize
        count++
      }
      
      const averageEntrySize = count > 0 ? totalEstimate / count : 0
      return averageEntrySize * map.size
    } catch (error) {
      console.warn('MemoryAnalyzer: Error estimating map size:', error)
      return 0
    }
  }

  /**
   * Estimate object size in bytes
   */
  private estimateObjectSize(obj: unknown): number {
    try {
      if (obj === null || obj === undefined) return 8
      
      const type = typeof obj
      switch (type) {
        case 'string':
          return (obj as string).length * 2 + 24 // UTF-16 + overhead
        case 'number':
          return 8
        case 'boolean':
          return 8
        case 'bigint':
          return 16
        case 'symbol':
          return 24
        case 'object':
          if (Array.isArray(obj)) {
            return 24 + obj.length * 8 + obj.reduce((sum: number, item: unknown) => sum + this.estimateObjectSize(item), 0)
          }
          // For objects, estimate based on JSON size
          try {
            return JSON.stringify(obj).length * 2 + 64
          } catch {
            return 256 // Fallback for non-serializable objects
          }
        case 'function':
          return obj.toString().length * 2 + 64
        default:
          return 64
      }
    } catch {
      return 64
    }
  }

  /**
   * Analyze key type distribution
   */
  private analyzeKeyDistribution<K, V>(map: Map<K, V>): Record<string, number> {
    try {
      const distribution: Record<string, number> = {}
      
      for (const key of map.keys()) {
        const type = this.getDetailedType(key)
        distribution[type] = (distribution[type] || 0) + 1
      }
      
      return distribution
    } catch (error) {
      console.warn('MemoryAnalyzer: Error analyzing key distribution:', error)
      return {}
    }
  }

  /**
   * Get detailed type information
   */
  private getDetailedType(obj: unknown): string {
    if (obj === null) return 'null'
    if (obj === undefined) return 'undefined'
    
    const type = typeof obj
    if (type !== 'object') return type
    
    if (Array.isArray(obj)) return 'array'
    if (obj instanceof Date) return 'date'
    if (obj instanceof RegExp) return 'regexp'
    if (obj instanceof Error) return 'error'
    
    return 'object'
  }

  /**
   * Find largest keys by estimated size
   */
  private findLargestKeys<K, V>(map: Map<K, V>): { key: string; size: number }[] {
    try {
      const keySizes: { key: string; size: number }[] = []
      
      for (const key of map.keys()) {
        const size = this.estimateObjectSize(key)
        const keyStr = this.keyToString(key)
        keySizes.push({ key: keyStr, size })
      }
      
      return keySizes
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
    } catch (error) {
      console.warn('MemoryAnalyzer: Error finding largest keys:', error)
      return []
    }
  }

  /**
   * Convert key to string representation
   */
  private keyToString(key: unknown): string {
    try {
      if (typeof key === 'string') return key
      if (typeof key === 'number' || typeof key === 'boolean') return String(key)
      if (key === null) return 'null'
      if (key === undefined) return 'undefined'
      
      try {
        const str = JSON.stringify(key)
        return str.length > 100 ? str.substring(0, 97) + '...' : str
      } catch {
        return Object.prototype.toString.call(key)
      }
    } catch {
      return '[UnknownKey]'
    }
  }

  /**
   * Update memory trend
   */
  private updateMemoryTrend(usage: number): void {
    try {
      this.memoryTrend.push({
        timestamp: Date.now(),
        usage
      })
      
      if (this.memoryTrend.length > this.maxTrendEntries) {
        this.memoryTrend = this.memoryTrend.slice(-this.maxTrendEntries)
      }
    } catch (error) {
      console.warn('MemoryAnalyzer: Error updating memory trend:', error)
    }
  }
}

/**
 * Diagnostic analyzer that combines all analysis
 */
export class DiagnosticAnalyzer {
  private performanceMonitor = new PerformanceMonitor()
  private memoryAnalyzer = new MemoryAnalyzer()

  /**
   * Generate complete diagnostic report
   */
  generateReport<K, V>(
    map: Map<K, V>,
    errorStats?: {
      total: number
      byType: Record<string, number>
      byOperation: Record<string, number>
      recoveryActions: Record<string, number>
      lastError?: {
        type: string
        operation: string
        message: string
        timestamp: number
      }
    },
    cacheStats?: {
      hits: number
      misses: number
      hitRate: number
      size: number
    },
    _pluginStats?: {
      totalPlugins: number
      enabledPlugins: number
      totalExecutions: number
      totalErrors: number
      errorRate: number
    }
  ): DiagnosticInfo {
    try {
      const performanceProfile = this.performanceMonitor.getProfile()
      const memoryUsage = this.memoryAnalyzer.analyzeMap(map)
      const errorAnalysis = this.generateErrorAnalysis(errorStats)
      const optimizationSuggestions = this.generateOptimizationSuggestions(
        performanceProfile,
        memoryUsage,
        errorAnalysis,
        cacheStats,
        _pluginStats
      )
      const healthScore = this.calculateHealthScore(performanceProfile, memoryUsage, errorAnalysis)
      const recommendations = this.generateRecommendations(optimizationSuggestions)

      return {
        performanceProfile,
        memoryUsage,
        errorAnalysis,
        optimizationSuggestions,
        healthScore,
        recommendations
      }
    } catch (error) {
      console.warn('DiagnosticAnalyzer: Error generating report:', error)
      return this.getEmptyReport()
    }
  }

  /**
   * Track operation for performance monitoring
   */
  trackOperation(operation: string, duration: number): void {
    this.performanceMonitor.trackOperation(operation, duration)
  }

  /**
   * Generate error analysis
   */
  private generateErrorAnalysis(errorStats?: {
    total: number
    byType: Record<string, number>
    byOperation: Record<string, number>
    recoveryActions: Record<string, number>
    recentErrors?: Array<{
      timestamp: number
      type: string
      operation: string
      message: string
    }>
    trends?: Array<{
      timestamp: number
      count: number
    }>
    lastError?: {
      type: string
      operation: string
      message: string
      timestamp: number
    }
  }): ErrorAnalysis {
    if (!errorStats) {
      return {
        totalErrors: 0,
        errorsByType: {},
        errorsByOperation: {},
        recentErrors: [],
        errorTrends: []
      }
    }

    return {
      totalErrors: errorStats.total || 0,
      errorsByType: errorStats.byType || {},
      errorsByOperation: errorStats.byOperation || {},
      recentErrors: errorStats.recentErrors || [],
      errorTrends: errorStats.trends || []
    }
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(
    performance: PerformanceProfile,
    memory: MemoryDiagnostic,
    errors: ErrorAnalysis,
    cacheStats?: {
      hits: number
      misses: number
      hitRate: number
      size: number
    },
    _pluginStats?: {
      totalPlugins: number
      enabledPlugins: number
      totalExecutions: number
      totalErrors: number
      errorRate: number
    }
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // Performance suggestions
    if (performance.hotspots.length > 0) {
      const slowestOp = performance.hotspots[0]
      if (slowestOp && slowestOp.averageTime > 10) {
        suggestions.push({
          type: 'performance',
          priority: 'high',
          title: '慢操作优化',
          description: `操作 "${slowestOp.operation}" 平均执行时间为 ${slowestOp.averageTime.toFixed(2)}ms`,
          action: '考虑优化此操作的实现或添加缓存',
          impact: '可显著提高整体性能',
          effort: 'medium'
        })
      }
    }

    // Memory suggestions
    if (memory.estimatedMapSize > 50 * 1024 * 1024) { // 50MB
      suggestions.push({
        type: 'memory',
        priority: 'high',
        title: '内存使用过高',
        description: `估计内存使用量为 ${(memory.estimatedMapSize / 1024 / 1024).toFixed(2)}MB`,
        action: '考虑实现LRU缓存或数据压缩',
        impact: '减少内存占用，提高系统稳定性',
        effort: 'high'
      })
    }

    // Error suggestions
    if (errors.totalErrors > 100) {
      suggestions.push({
        type: 'error',
        priority: 'high',
        title: '错误频率过高',
        description: `总错误数为 ${errors.totalErrors}`,
        action: '检查错误日志，修复主要错误源',
        impact: '提高系统稳定性和可靠性',
        effort: 'medium'
      })
    }

    // Cache suggestions
    if (cacheStats && cacheStats.hitRate < 0.5) {
      suggestions.push({
        type: 'performance',
        priority: 'medium',
        title: '缓存命中率低',
        description: `缓存命中率为 ${(cacheStats.hitRate * 100).toFixed(1)}%`,
        action: '调整缓存策略或增加缓存大小',
        impact: '提高数据访问速度',
        effort: 'low'
      })
    }

    return suggestions
  }

  /**
   * Calculate health score (0-100)
   */
  private calculateHealthScore(
    performance: PerformanceProfile,
    memory: MemoryDiagnostic,
    errors: ErrorAnalysis
  ): number {
    try {
      let score = 100

      // Performance impact
      const avgPerformance = Object.values(performance.operations)
        .reduce((sum, op) => sum + op.averageTime, 0) / Object.keys(performance.operations).length
      if (avgPerformance > 10) score -= 20
      else if (avgPerformance > 5) score -= 10

      // Memory impact
      const memoryMB = memory.estimatedMapSize / 1024 / 1024
      if (memoryMB > 100) score -= 30
      else if (memoryMB > 50) score -= 15

      // Error impact
      const totalOps = Object.values(performance.operations).reduce((sum, op) => sum + op.count, 0)
      const errorRate = totalOps > 0 ? errors.totalErrors / totalOps : 0
      if (errorRate > 0.1) score -= 25
      else if (errorRate > 0.05) score -= 15
      else if (errorRate > 0.01) score -= 5

      return Math.max(0, Math.min(100, score))
    } catch {
      return 50 // Default to medium health if calculation fails
    }
  }

  /**
   * Generate recommendations based on suggestions
   */
  private generateRecommendations(suggestions: OptimizationSuggestion[]): string[] {
    const highPriority = suggestions.filter(s => s.priority === 'high')
    const recommendations: string[] = []

    if (highPriority.length === 0) {
      recommendations.push('系统运行状况良好，无需立即优化')
    } else {
      recommendations.push(`发现 ${highPriority.length} 个高优先级优化机会`)
      recommendations.push(...highPriority.slice(0, 3).map(s => s.title))
    }

    return recommendations
  }

  /**
   * Get empty report for error cases
   */
  private getEmptyReport(): DiagnosticInfo {
    return {
      performanceProfile: { operations: {}, hotspots: [], trends: [] },
      memoryUsage: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        estimatedMapSize: 0,
        keyDistribution: {},
        largestKeys: [],
        memoryTrend: []
      },
      errorAnalysis: {
        totalErrors: 0,
        errorsByType: {},
        errorsByOperation: {},
        recentErrors: [],
        errorTrends: []
      },
      optimizationSuggestions: [],
      healthScore: 0,
      recommendations: ['无法生成诊断报告']
    }
  }

  /**
   * Reset all monitoring data
   */
  reset(): void {
    this.performanceMonitor.reset()
  }
}

// Global diagnostic analyzer
export const globalDiagnostic = new DiagnosticAnalyzer()
