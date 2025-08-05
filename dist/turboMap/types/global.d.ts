export interface GlobalTimers {
    setTimeout(callback: () => void, ms: number): number | NodeJS.Timeout;
    clearTimeout(id: number | NodeJS.Timeout): void;
}
export interface NodeGlobal {
    global?: {
        gc?(): void;
    };
    process?: {
        memoryUsage(): NodeJS.MemoryUsage;
    };
}
export type SafeGlobalThis = typeof globalThis & GlobalTimers & NodeGlobal;
export declare const safeGlobalThis: SafeGlobalThis;
export declare const safeSetTimeout: (callback: () => void, ms: number) => number | NodeJS.Timeout;
export declare const safeClearTimeout: (id: number | NodeJS.Timeout) => void;
export declare const safeGarbageCollect: () => void;
export declare const safeMemoryUsage: () => NodeJS.MemoryUsage | null;
//# sourceMappingURL=global.d.ts.map