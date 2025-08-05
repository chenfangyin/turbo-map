export declare enum RecoveryAction {
    RETRY = "retry",
    FALLBACK_MODE = "fallback",
    SKIP = "skip",
    ABORT = "abort"
}
export declare enum ErrorType {
    SERIALIZATION = "serialization",
    CACHE = "cache",
    ITERATION = "iteration",
    PLUGIN = "plugin",
    MEMORY = "memory",
    UNKNOWN = "unknown"
}
export interface ErrorStats {
    total: number;
    byType: Record<ErrorType, number>;
    byOperation: Record<string, number>;
    recoveryActions: Record<RecoveryAction, number>;
    lastError?: {
        type: ErrorType;
        operation: string;
        message: string;
        timestamp: number;
    };
}
export interface RecoveryPolicy {
    maxRetries: number;
    retryDelay: number;
    escalationThreshold: number;
    fallbackMode: boolean;
}
export declare class ErrorRecoveryManager {
    private errorHistory;
    private errorStats;
    private policies;
    private globalFallbackMode;
    constructor();
    private initializePolicies;
    handleError(error: Error, operation: string, errorType?: ErrorType): RecoveryAction;
    private updateStats;
    executeWithRecovery<T>(operation: () => T, fallback: () => T, operationName: string, errorType?: ErrorType): T;
    executeAsyncWithRecovery<T>(operation: () => Promise<T>, fallback: () => Promise<T>, operationName: string, errorType?: ErrorType): Promise<T>;
    private delay;
    resetErrorHistory(operation?: string, errorType?: ErrorType): void;
    getStats(): ErrorStats;
    setPolicy(errorType: ErrorType, policy: RecoveryPolicy): void;
    getPolicy(errorType: ErrorType): RecoveryPolicy | undefined;
    isInFallbackMode(): boolean;
    exitFallbackMode(): void;
    getHealthStatus(): {
        healthy: boolean;
        errorRate: number;
        totalErrors: number;
        inFallbackMode: boolean;
        criticalErrors: number;
        status: string;
    };
}
export declare const globalErrorRecovery: ErrorRecoveryManager;
//# sourceMappingURL=ErrorRecovery.d.ts.map