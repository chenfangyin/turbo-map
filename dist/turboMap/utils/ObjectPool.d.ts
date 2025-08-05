export declare class ObjectPool<T> {
    private pool;
    private createFn;
    private resetFn;
    private maxSize;
    constructor(createFn: () => T, resetFn?: (obj: T) => void, maxSize?: number);
    acquire(): T;
    release(obj: T): void;
    get size(): number;
    clear(): void;
}
export declare class EnhancedObjectPool {
    private weakSetPool;
    private mapPool;
    private arrayPool;
    private objectPool;
    private readonly maxPoolSize;
    getWeakSet(): WeakSet<object>;
    releaseWeakSet(weakSet: WeakSet<object>): void;
    getMap<K, V>(): Map<K, V>;
    releaseMap(map: Map<unknown, unknown>): void;
    getArray<T>(): T[];
    releaseArray(array: unknown[]): void;
    getObject(): Record<string, unknown>;
    releaseObject(obj: Record<string, unknown>): void;
    getStats(): {
        weakSetPool: number;
        mapPool: number;
        arrayPool: number;
        objectPool: number;
        totalSize: number;
    };
    clear(): void;
}
export declare const globalObjectPool: EnhancedObjectPool;
//# sourceMappingURL=ObjectPool.d.ts.map