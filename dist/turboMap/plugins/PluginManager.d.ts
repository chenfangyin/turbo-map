import type { MapKey } from '../utils/TypeUtils';
export interface TurboMapPlugin<K extends MapKey, V> {
    name: string;
    version?: string;
    priority?: number;
    enabled?: boolean;
    beforeSet?(key: K, value: V): {
        key: K;
        value: V;
    } | null;
    afterSet?(key: K, value: V): void;
    beforeGet?(key: K): K | null;
    afterGet?(key: K, value: V | undefined): V | undefined;
    beforeDelete?(key: K): K | null;
    afterDelete?(key: K, deleted: boolean): void;
    beforeClear?(): boolean;
    afterClear?(): void;
    onError?(error: Error, operation: string, key?: K): void;
    onMetricsUpdate?(metrics: {
        size: number;
        operationCount: number;
        cacheHits: number;
        cacheMisses: number;
        errorCount: number;
        [key: string]: unknown;
    }): void;
    onInstall?(): Promise<void> | void;
    onUninstall?(): Promise<void> | void;
    onEnable?(): Promise<void> | void;
    onDisable?(): Promise<void> | void;
}
export interface PluginContext<K extends MapKey, V> {
    operation: string;
    key: K | undefined;
    value: V | undefined;
    metadata: Record<string, unknown> | undefined;
    timestamp: number;
}
export interface PluginStats {
    name: string;
    executions: number;
    errors: number;
    totalTime: number;
    averageTime: number;
    lastExecution?: number;
    enabled: boolean;
}
export interface PluginManagerOptions {
    enableStats: boolean;
    maxExecutionTime: number;
    enableErrorRecovery: boolean;
    pluginTimeout: number;
}
export declare class PluginManager<K extends MapKey, V> {
    private plugins;
    private pluginStats;
    private options;
    private globalEnabled;
    constructor(options?: Partial<PluginManagerOptions>);
    addPlugin(plugin: TurboMapPlugin<K, V>): Promise<boolean>;
    removePlugin(pluginName: string): Promise<boolean>;
    enablePlugin(pluginName: string): Promise<boolean>;
    disablePlugin(pluginName: string): Promise<boolean>;
    executeBefore<T>(hookName: keyof TurboMapPlugin<K, V>, context: PluginContext<K, V>, ...args: unknown[]): T | null;
    executeAfter<T>(hookName: keyof TurboMapPlugin<K, V>, context: PluginContext<K, V>, ...args: unknown[]): T | undefined;
    private getActivePlugins;
    private handlePluginError;
    private updateStats;
    private executeWithTimeout;
    getPlugin(name: string): TurboMapPlugin<K, V> | undefined;
    getAllPlugins(): TurboMapPlugin<K, V>[];
    getPluginStats(name?: string): PluginStats | PluginStats[];
    clearStats(): void;
    setGlobalEnabled(enabled: boolean): void;
    isGlobalEnabled(): boolean;
    getStatus(): {
        totalPlugins: number;
        enabledPlugins: number;
        totalExecutions: number;
        totalErrors: number;
        globalEnabled: boolean;
        averageExecutionTime: number;
        errorRate: number;
    };
    private calculateAverageExecutionTime;
    private calculateErrorRate;
}
//# sourceMappingURL=PluginManager.d.ts.map