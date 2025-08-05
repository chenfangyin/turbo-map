export interface PerformanceProfile {
    operations: Record<string, {
        count: number;
        totalTime: number;
        averageTime: number;
        minTime: number;
        maxTime: number;
        lastExecuted: number;
    }>;
    hotspots: {
        operation: string;
        averageTime: number;
        count: number;
    }[];
    trends: {
        timestamp: number;
        operation: string;
        duration: number;
    }[];
}
export interface MemoryDiagnostic {
    heapUsed: number;
    heapTotal: number;
    external: number;
    estimatedMapSize: number;
    keyDistribution: Record<string, number>;
    largestKeys: {
        key: string;
        size: number;
    }[];
    memoryTrend: {
        timestamp: number;
        usage: number;
    }[];
}
export interface ErrorAnalysis {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByOperation: Record<string, number>;
    recentErrors: {
        timestamp: number;
        type: string;
        operation: string;
        message: string;
    }[];
    errorTrends: {
        timestamp: number;
        count: number;
    }[];
}
export interface OptimizationSuggestion {
    type: 'performance' | 'memory' | 'error' | 'config';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
}
export interface DiagnosticInfo {
    performanceProfile: PerformanceProfile;
    memoryUsage: MemoryDiagnostic;
    errorAnalysis: ErrorAnalysis;
    optimizationSuggestions: OptimizationSuggestion[];
    healthScore: number;
    recommendations: string[];
}
export declare class PerformanceMonitor {
    private operations;
    private trends;
    private maxTrendEntries;
    trackOperation(operation: string, duration: number): void;
    getProfile(): PerformanceProfile;
    reset(): void;
    getOperationStats(operation: string): {
        count: number;
        totalTime: number;
        averageTime: number;
        minTime: number;
        maxTime: number;
        lastExecuted: number;
    } | null;
}
export declare class MemoryAnalyzer {
    private memoryTrend;
    private maxTrendEntries;
    analyzeMap<K, V>(map: Map<K, V>): MemoryDiagnostic;
    private getNodeMemoryUsage;
    private estimateMapSize;
    private estimateObjectSize;
    private analyzeKeyDistribution;
    private getDetailedType;
    private findLargestKeys;
    private keyToString;
    private updateMemoryTrend;
}
export declare class DiagnosticAnalyzer {
    private performanceMonitor;
    private memoryAnalyzer;
    generateReport<K, V>(map: Map<K, V>, errorStats?: {
        total: number;
        byType: Record<string, number>;
        byOperation: Record<string, number>;
        recoveryActions: Record<string, number>;
        lastError?: {
            type: string;
            operation: string;
            message: string;
            timestamp: number;
        };
    }, cacheStats?: {
        hits: number;
        misses: number;
        hitRate: number;
        size: number;
    }, _pluginStats?: {
        totalPlugins: number;
        enabledPlugins: number;
        totalExecutions: number;
        totalErrors: number;
        errorRate: number;
    }): DiagnosticInfo;
    trackOperation(operation: string, duration: number): void;
    private generateErrorAnalysis;
    private generateOptimizationSuggestions;
    private calculateHealthScore;
    private generateRecommendations;
    private getEmptyReport;
    reset(): void;
}
export declare const globalDiagnostic: DiagnosticAnalyzer;
//# sourceMappingURL=DiagnosticUtils.d.ts.map