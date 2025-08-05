export interface CacheStats {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    evictions: number;
    hitRate: number;
    size: number;
    maxSize: number;
}
export declare class EnhancedLRUCache<T> {
    private cache;
    private head;
    private tail;
    private maxSize;
    private stats;
    constructor(maxSize?: number);
    get(key: string): T | undefined;
    set(key: string, value: T): void;
    delete(key: string): boolean;
    private updateAccess;
    private moveToHead;
    private addToHead;
    private removeNode;
    private removeTail;
    private updateHitRate;
    getStats(): CacheStats;
    clear(): void;
    get size(): number;
}
export interface TieredCacheOptions {
    l1CacheSize: number;
    l2CacheSize: number;
    promoteThreshold: number;
    enableCompression?: boolean;
}
export declare class TieredCacheManager<T> {
    private l1Cache;
    private l2Cache;
    private promoteThreshold;
    private accessCounts;
    constructor(options: TieredCacheOptions);
    get(key: string): T | undefined;
    set(key: string, value: T): void;
    private trackAccess;
    delete(key: string): boolean;
    getStats(): {
        l1: CacheStats;
        l2: CacheStats;
        combined: {
            hits: number;
            misses: number;
            hitRate: number;
            totalSize: number;
            pendingPromotions: number;
        };
    };
    clear(): void;
}
//# sourceMappingURL=CacheManager.d.ts.map