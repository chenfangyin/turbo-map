export declare class FastHasher {
    private strategyCache;
    private hitCount;
    private totalCount;
    constructor();
    private initializeStrategies;
    private isPrimitive;
    fastHash(obj: unknown): string | null;
    private hashSimpleObject;
    private hashSimpleArray;
    private getObjectId;
    getStats(): {
        hitCount: number;
        totalCount: number;
        hitRate: number;
        strategies: number;
    };
    resetStats(): void;
    addStrategy(signature: string, strategy: (obj: unknown) => string | null): void;
}
export declare const globalFastHasher: FastHasher;
//# sourceMappingURL=FastHash.d.ts.map