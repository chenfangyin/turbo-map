import { TieredCacheManager } from './CacheManager';
export interface SerializationContext {
    visited: WeakSet<object>;
    cache: TieredCacheManager<string> | undefined;
    depth: number;
    maxDepth: number;
}
export interface SerializationStrategy {
    name: string;
    canHandle: (obj: unknown) => boolean;
    serialize: (obj: unknown, context: SerializationContext) => string;
    priority: number;
}
export declare class AdaptiveSerializer {
    private strategies;
    private strategyStats;
    private cache;
    private enableMetrics;
    private objectIdMap;
    constructor(enableCache?: boolean, enableMetrics?: boolean);
    private initializeStrategies;
    addStrategy(strategy: SerializationStrategy): void;
    serialize(obj: unknown): string;
    private serializeValue;
    private deepSerialize;
    private fallbackSerialize;
    private serializeSymbol;
    private getObjectId;
    private updateStrategyStats;
    getStats(): {
        strategies: {
            [k: string]: {
                usage: number;
                avgTime: number;
            };
        };
        cache: {
            l1: import("./CacheManager").CacheStats;
            l2: import("./CacheManager").CacheStats;
            combined: {
                hits: number;
                misses: number;
                hitRate: number;
                totalSize: number;
                pendingPromotions: number;
            };
        } | undefined;
        fastHash: {
            hitCount: number;
            totalCount: number;
            hitRate: number;
            strategies: number;
        };
        totalStrategies: number;
    } | {
        strategies: {};
        cache: null;
        fastHash: null;
        totalStrategies: number;
    };
    resetStats(): void;
    clearCache(): void;
}
export declare const globalSerializer: AdaptiveSerializer;
//# sourceMappingURL=Serializer.d.ts.map