import type { MapKey } from '../utils/TypeUtils';
export interface AsyncResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
    duration: number;
}
export interface BatchOperation<K, V> {
    type: 'set' | 'get' | 'delete' | 'has';
    key: K;
    value: V | undefined;
    id: string | number | undefined;
}
export interface BatchResult<V> {
    id: string | number | undefined;
    success: boolean;
    data: V | boolean | undefined;
    error: Error | undefined;
}
export interface AsyncTurboMapLike<K extends MapKey, V> {
    setAsync(key: K, value: V): Promise<this>;
    getAsync(key: K): Promise<V | undefined>;
    hasAsync(key: K): Promise<boolean>;
    deleteAsync(key: K): Promise<boolean>;
    clearAsync(): Promise<void>;
    batchExecute<T extends V>(operations: BatchOperation<K, V>[]): Promise<BatchResult<T>[]>;
    setAllAsync(entries: [K, V][]): Promise<this>;
    getAllAsync(keys: K[]): Promise<(V | undefined)[]>;
    deleteAllAsync(keys: K[]): Promise<boolean[]>;
    stream(): AsyncTurboMapStream<K, V>;
    sizeAsync(): Promise<number>;
    entriesAsync(): AsyncIterableIterator<[K, V]>;
    keysAsync(): AsyncIterableIterator<K>;
    valuesAsync(): AsyncIterableIterator<V>;
}
export interface AsyncTurboMapStream<K, V> {
    filter(predicate: (entry: [K, V]) => boolean | Promise<boolean>): AsyncTurboMapStream<K, V>;
    map<U>(transform: (entry: [K, V]) => [K, U] | Promise<[K, U]>): AsyncTurboMapStream<K, U>;
    forEach(callback: (entry: [K, V]) => void | Promise<void>): Promise<void>;
    collect(): Promise<Map<K, V>>;
    toArray(): Promise<[K, V][]>;
    reduce<T>(callback: (accumulator: T, entry: [K, V]) => T | Promise<T>, initialValue: T): Promise<T>;
}
export interface AsyncOptions {
    batchSize?: number;
    delayBetweenBatches?: number;
    maxConcurrency?: number;
    timeoutMs?: number;
    enableProgress?: boolean;
}
export type ProgressCallback = (completed: number, total: number, percentage: number) => void;
export declare class AsyncTurboMap<K extends MapKey, V> implements AsyncTurboMapLike<K, V> {
    private syncMap;
    private options;
    constructor(syncMap: Map<K, V>, options?: AsyncOptions);
    setAsync(key: K, value: V): Promise<this>;
    getAsync(key: K): Promise<V | undefined>;
    hasAsync(key: K): Promise<boolean>;
    deleteAsync(key: K): Promise<boolean>;
    clearAsync(): Promise<void>;
    batchExecute<T extends V>(operations: BatchOperation<K, V>[]): Promise<BatchResult<T>[]>;
    private processBatch;
    setAllAsync(entries: [K, V][]): Promise<this>;
    getAllAsync(keys: K[]): Promise<(V | undefined)[]>;
    deleteAllAsync(keys: K[]): Promise<boolean[]>;
    sizeAsync(): Promise<number>;
    stream(): AsyncTurboMapStream<K, V>;
    entriesAsync(): AsyncIterableIterator<[K, V]>;
    keysAsync(): AsyncIterableIterator<K>;
    valuesAsync(): AsyncIterableIterator<V>;
    private nextTick;
    private delay;
}
//# sourceMappingURL=AsyncTurboMap.d.ts.map