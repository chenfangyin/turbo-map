// Export enhanced TurboMap as primary interface
export {
  createEnhancedTurboMap as createTurboMap,
  createEnhancedTurboMap,
  type EnhancedTurboMapLike as TurboMapLike,
  type EnhancedTurboMapOptions as TurboMapOptions,
  type MapKey,
  type PrimitiveKey,
  type ObjectKey
} from './turboMap/index'

// Export all enhanced components
export {
  // Core utilities
  TypeUtils,
  ObjectPool,
  EnhancedObjectPool,
  globalObjectPool,

  // Fast hashing
  FastHasher,
  globalFastHasher,

  // Error recovery
  ErrorRecoveryManager,
  globalErrorRecovery,
  ErrorType,
  RecoveryAction,

  // Caching
  EnhancedLRUCache,
  TieredCacheManager,
  type CacheStats,
  type TieredCacheOptions,

  // Serialization
  AdaptiveSerializer,
  globalSerializer,
  type SerializationContext,
  type SerializationStrategy,

  // Async operations
  AsyncTurboMap,
  type AsyncTurboMapLike,
  type AsyncTurboMapStream,
  type BatchOperation,
  type BatchResult,
  type AsyncOptions,

  // Plugin system
  PluginManager,
  type TurboMapPlugin,
  type PluginContext,
  type PluginStats,

  // Diagnostics
  PerformanceMonitor,
  MemoryAnalyzer,
  DiagnosticAnalyzer,
  globalDiagnostic,
  type PerformanceProfile,
  type MemoryDiagnostic,
  type ErrorAnalysis,
  type OptimizationSuggestion,
  type DiagnosticInfo
} from './turboMap/index'
