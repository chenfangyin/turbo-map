'use strict';

class TypeUtils {
    static isPrimitive(value) {
        return value === null ||
            value === undefined ||
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            typeof value === 'symbol' ||
            typeof value === 'bigint';
    }
    static isSimpleObject(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return false;
        }
        if (value instanceof Date ||
            value instanceof RegExp ||
            value instanceof Error ||
            value instanceof Map ||
            value instanceof Set) {
            return false;
        }
        if (typeof value === 'function') {
            return false;
        }
        try {
            const keys = Object.keys(value);
            if (keys.length > 0) {
                const firstKey = keys[0];
                if (firstKey !== undefined) {
                    const descriptor = Object.getOwnPropertyDescriptor(value, firstKey);
                    if (descriptor && (descriptor.get || descriptor.set)) {
                        return false;
                    }
                }
            }
            return keys.length <= 5 && keys.every(key => {
                const prop = value[key];
                if (this.isPrimitive(prop) || prop === null) {
                    return true;
                }
                if (typeof prop === 'object' && prop !== null) {
                    return this.isSimpleObject(prop);
                }
                return false;
            });
        }
        catch {
            return false;
        }
    }
    static getObjectSignature(obj) {
        if (this.isPrimitive(obj)) {
            return `primitive:${typeof obj}`;
        }
        if (Array.isArray(obj)) {
            const elementHash = obj.map(item => {
                if (typeof item === 'string') {
                    return `str:${item}`;
                }
                else if (typeof item === 'number') {
                    return `num:${item}`;
                }
                else if (typeof item === 'boolean') {
                    return `bool:${item}`;
                }
                else if (item === null) {
                    return 'null';
                }
                else if (typeof item === 'object') {
                    return this.getObjectSignature(item);
                }
                return typeof item;
            }).join(',');
            return `array:${obj.length}:${elementHash}`;
        }
        if (obj instanceof Date) {
            return 'date';
        }
        if (obj instanceof RegExp) {
            return 'regexp';
        }
        if (obj instanceof Error) {
            return 'error';
        }
        if (typeof obj === 'function') {
            return 'function';
        }
        try {
            const keys = Object.keys(obj).sort();
            const keySignature = keys.slice(0, 3).join(',');
            const valueHash = keys.slice(0, 2).map(key => {
                const value = obj[key];
                if (typeof value === 'string') {
                    return `str:${value}`;
                }
                else if (typeof value === 'number') {
                    return `num:${value}`;
                }
                else if (typeof value === 'boolean') {
                    return `bool:${value}`;
                }
                else if (value === null) {
                    return 'null';
                }
                else if (typeof value === 'object') {
                    return this.getObjectSignature(value);
                }
                return typeof value;
            }).join(',');
            return `object:${keys.length}:${keySignature}:${valueHash}`;
        }
        catch {
            return 'unknown';
        }
    }
    static safeAccess(obj, accessor, fallback) {
        try {
            if (obj === null || obj === undefined) {
                return fallback;
            }
            const result = accessor();
            return result !== undefined ? result : fallback;
        }
        catch {
            return fallback;
        }
    }
    static isSerializable(obj, visited = new WeakSet()) {
        try {
            if (this.isPrimitive(obj)) {
                if (typeof obj === 'symbol' || obj === undefined) {
                    return false;
                }
                return true;
            }
            if (typeof obj === 'object' && obj !== null) {
                if (visited.has(obj)) {
                    return false;
                }
                visited.add(obj);
                if (Array.isArray(obj)) {
                    return obj.every(item => this.isSerializable(item, visited));
                }
                return Object.values(obj).every(value => this.isSerializable(value, visited));
            }
            return false;
        }
        catch {
            return false;
        }
    }
}

class ObjectPool {
    pool = [];
    createFn;
    resetFn;
    maxSize;
    constructor(createFn, resetFn = () => { }, maxSize = 100) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.maxSize = maxSize;
    }
    acquire() {
        const obj = this.pool.pop();
        if (obj) {
            return obj;
        }
        return this.createFn();
    }
    release(obj) {
        try {
            if (this.pool.length < this.maxSize) {
                this.resetFn(obj);
                this.pool.push(obj);
            }
        }
        catch (error) {
            console.warn('ObjectPool: Error releasing object:', error);
        }
    }
    get size() {
        return this.pool.length;
    }
    clear() {
        this.pool.length = 0;
    }
}
class EnhancedObjectPool {
    weakSetPool = [];
    mapPool = [];
    arrayPool = [];
    objectPool = [];
    maxPoolSize = 50;
    getWeakSet() {
        const weakSet = this.weakSetPool.pop();
        if (weakSet) {
            return weakSet;
        }
        return new WeakSet();
    }
    releaseWeakSet(weakSet) {
        try {
            if (this.weakSetPool.length < this.maxPoolSize) {
                this.weakSetPool.push(weakSet);
            }
        }
        catch (error) {
            console.warn('EnhancedObjectPool: Error releasing WeakSet:', error);
        }
    }
    getMap() {
        const map = this.mapPool.pop();
        if (map) {
            map.clear();
            return map;
        }
        return new Map();
    }
    releaseMap(map) {
        try {
            if (this.mapPool.length < this.maxPoolSize) {
                map.clear();
                this.mapPool.push(map);
            }
        }
        catch (error) {
            console.warn('EnhancedObjectPool: Error releasing Map:', error);
        }
    }
    getArray() {
        const array = this.arrayPool.pop();
        if (array) {
            array.length = 0;
            return array;
        }
        return [];
    }
    releaseArray(array) {
        try {
            if (this.arrayPool.length < this.maxPoolSize) {
                array.length = 0;
                this.arrayPool.push(array);
            }
        }
        catch (error) {
            console.warn('EnhancedObjectPool: Error releasing Array:', error);
        }
    }
    getObject() {
        const obj = this.objectPool.pop();
        if (obj) {
            for (const key in obj) {
                delete obj[key];
            }
            return obj;
        }
        return {};
    }
    releaseObject(obj) {
        try {
            if (this.objectPool.length < this.maxPoolSize) {
                for (const key in obj) {
                    delete obj[key];
                }
                this.objectPool.push(obj);
            }
        }
        catch (error) {
            console.warn('EnhancedObjectPool: Error releasing Object:', error);
        }
    }
    getStats() {
        return {
            weakSetPool: this.weakSetPool.length,
            mapPool: this.mapPool.length,
            arrayPool: this.arrayPool.length,
            objectPool: this.objectPool.length,
            totalSize: this.weakSetPool.length + this.mapPool.length +
                this.arrayPool.length + this.objectPool.length
        };
    }
    clear() {
        this.weakSetPool.length = 0;
        this.mapPool.length = 0;
        this.arrayPool.length = 0;
        this.objectPool.length = 0;
    }
}
const globalObjectPool = new EnhancedObjectPool();

class FastHasher {
    strategyCache = new Map();
    hitCount = 0;
    totalCount = 0;
    constructor() {
        this.initializeStrategies();
    }
    initializeStrategies() {
        this.strategyCache.set('primitive:number', (obj) => `num:${obj}`);
        this.strategyCache.set('primitive:string', (obj) => `str:${obj}`);
        this.strategyCache.set('primitive:boolean', (obj) => `bool:${obj}`);
        this.strategyCache.set('primitive:null', () => 'null');
        this.strategyCache.set('primitive:undefined', () => 'undefined');
        this.strategyCache.set('primitive:symbol', (obj) => `sym:${obj.toString()}`);
        this.strategyCache.set('primitive:bigint', (obj) => `big:${obj.toString()}`);
        this.strategyCache.set('date', (obj) => `d:${obj.getTime()}`);
        this.strategyCache.set('regexp', (obj) => `r:${obj.toString()}`);
        this.strategyCache.set('error', (obj) => `err:${obj.name}:${obj.message}`);
        this.strategyCache.set('function', (obj) => `fn:${obj.name || 'anonymous'}:${obj.length}`);
        this.strategyCache.set('array', (obj) => {
            const arr = obj;
            if (arr.length === 0)
                return 'arr:[]';
            const items = arr.map(item => {
                if (this.isPrimitive(item)) {
                    return String(item);
                }
                return 'complex';
            });
            return `arr:${arr.length}:${items.join(',')}`;
        });
        for (let i = 0; i <= 5; i++) {
            this.strategyCache.set(`object:${i}:`, (_obj) => this.hashSimpleObject(_obj));
        }
    }
    isPrimitive(value) {
        return value === null ||
            value === undefined ||
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            typeof value === 'symbol' ||
            typeof value === 'bigint';
    }
    fastHash(obj) {
        this.totalCount++;
        try {
            const signature = TypeUtils.getObjectSignature(obj);
            const cached = this.strategyCache.get(signature);
            if (cached) {
                const result = cached(obj);
                if (result) {
                    this.hitCount++;
                    return result;
                }
            }
            if (this.isPrimitive(obj)) {
                const type = obj === null ? 'null' : typeof obj;
                const strategy = this.strategyCache.get(`primitive:${type}`);
                if (strategy) {
                    const result = strategy(obj);
                    if (result) {
                        this.strategyCache.set(signature, strategy);
                        return result;
                    }
                }
            }
            if (obj instanceof Date) {
                const strategy = this.strategyCache.get('date');
                if (strategy) {
                    const result = strategy(obj);
                    if (result) {
                        this.strategyCache.set(signature, strategy);
                        return result;
                    }
                }
            }
            if (obj instanceof RegExp) {
                const strategy = this.strategyCache.get('regexp');
                if (strategy) {
                    const result = strategy(obj);
                    if (result) {
                        this.strategyCache.set(signature, strategy);
                        return result;
                    }
                }
            }
            if (obj instanceof Error) {
                const strategy = this.strategyCache.get('error');
                if (strategy) {
                    const result = strategy(obj);
                    if (result) {
                        this.strategyCache.set(signature, strategy);
                        return result;
                    }
                }
            }
            if (typeof obj === 'function') {
                const strategy = this.strategyCache.get('function');
                if (strategy) {
                    const result = strategy(obj);
                    if (result) {
                        this.strategyCache.set(signature, strategy);
                        return result;
                    }
                }
            }
            if (Array.isArray(obj)) {
                const strategy = this.strategyCache.get('array');
                if (strategy) {
                    const result = strategy(obj);
                    if (result) {
                        this.strategyCache.set(signature, strategy);
                        return result;
                    }
                }
                const result = this.hashSimpleArray(obj);
                if (result) {
                    this.strategyCache.set(signature, (obj) => this.hashSimpleArray(obj));
                    return result;
                }
            }
            if (typeof obj === 'object' && obj !== null) {
                const keys = Object.keys(obj);
                for (let i = 0; i <= 5; i++) {
                    if (keys.length <= i) {
                        const strategy = this.strategyCache.get(`object:${i}:`);
                        if (strategy) {
                            const result = strategy(obj);
                            if (result) {
                                this.strategyCache.set(signature, strategy);
                                return result;
                            }
                        }
                    }
                }
            }
            for (const [key, strategy] of this.strategyCache.entries()) {
                if (!key.startsWith('object:') && !key.startsWith('primitive:')) {
                    const result = strategy(obj);
                    if (result) {
                        this.strategyCache.set(signature, strategy);
                        return result;
                    }
                }
            }
            const result = this.hashSimpleObject(obj);
            if (result) {
                this.strategyCache.set(signature, (_obj) => this.hashSimpleObject(_obj));
                return result;
            }
            return null;
        }
        catch {
            return null;
        }
    }
    hashSimpleObject(obj, depth = 0, visited = new WeakSet()) {
        try {
            if (depth > 10) {
                return 'obj:max_depth';
            }
            if (typeof obj !== 'object' || obj === null) {
                return null;
            }
            if (visited.has(obj)) {
                const objectId = this.getObjectId(obj);
                return `obj:circular:${objectId}`;
            }
            visited.add(obj);
            const keys = Object.keys(obj).sort();
            if (keys.length === 0)
                return 'obj:{}';
            const pairs = keys.map(key => {
                const value = obj[key];
                if (this.isPrimitive(value)) {
                    return `${key}:${value}`;
                }
                if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                        const arrayHash = this.hashSimpleArray(value);
                        return `${key}:${arrayHash || 'complex'}`;
                    }
                    else {
                        const nestedHash = this.hashSimpleObject(value, depth + 1, visited);
                        return `${key}:${nestedHash || 'complex'}`;
                    }
                }
                return `${key}:complex`;
            });
            return `obj:{${pairs.join(',')}}`;
        }
        catch {
            return null;
        }
    }
    hashSimpleArray(arr) {
        try {
            if (arr.length === 0)
                return 'arr:[]';
            const items = arr.map(item => {
                if (this.isPrimitive(item)) {
                    return String(item);
                }
                return 'complex';
            });
            return `arr:${arr.length}:${items.join(',')}`;
        }
        catch {
            return null;
        }
    }
    getObjectId(_obj) {
        return `ref_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    }
    getStats() {
        return {
            hitCount: this.hitCount,
            totalCount: this.totalCount,
            hitRate: this.totalCount > 0 ? this.hitCount / this.totalCount : 0,
            strategies: this.strategyCache.size
        };
    }
    resetStats() {
        this.hitCount = 0;
        this.totalCount = 0;
    }
    addStrategy(signature, strategy) {
        try {
            if (typeof signature === 'string' && typeof strategy === 'function') {
                this.strategyCache.set(signature, strategy);
            }
        }
        catch (error) {
            console.warn('FastHasher: Error adding strategy:', error);
        }
    }
}
const globalFastHasher = new FastHasher();

const safeGlobalThis = globalThis;
const safeSetTimeout = (callback, ms) => {
    return safeGlobalThis.setTimeout(callback, ms);
};
const safeClearTimeout = (id) => {
    return safeGlobalThis.clearTimeout(id);
};

exports.RecoveryAction = void 0;
(function (RecoveryAction) {
    RecoveryAction["RETRY"] = "retry";
    RecoveryAction["FALLBACK_MODE"] = "fallback";
    RecoveryAction["SKIP"] = "skip";
    RecoveryAction["ABORT"] = "abort";
})(exports.RecoveryAction || (exports.RecoveryAction = {}));
exports.ErrorType = void 0;
(function (ErrorType) {
    ErrorType["SERIALIZATION"] = "serialization";
    ErrorType["CACHE"] = "cache";
    ErrorType["ITERATION"] = "iteration";
    ErrorType["PLUGIN"] = "plugin";
    ErrorType["MEMORY"] = "memory";
    ErrorType["UNKNOWN"] = "unknown";
})(exports.ErrorType || (exports.ErrorType = {}));
class ErrorRecoveryManager {
    errorHistory = new Map();
    errorStats;
    policies = new Map();
    globalFallbackMode = false;
    constructor() {
        this.errorStats = {
            total: 0,
            byType: Object.fromEntries(Object.values(exports.ErrorType).map(type => [type, 0])),
            byOperation: {},
            recoveryActions: Object.fromEntries(Object.values(exports.RecoveryAction).map(action => [action, 0]))
        };
        this.initializePolicies();
    }
    initializePolicies() {
        this.policies.set(exports.ErrorType.SERIALIZATION, {
            maxRetries: 2,
            retryDelay: 0,
            escalationThreshold: 5,
            fallbackMode: true
        });
        this.policies.set(exports.ErrorType.CACHE, {
            maxRetries: 3,
            retryDelay: 10,
            escalationThreshold: 10,
            fallbackMode: true
        });
        this.policies.set(exports.ErrorType.ITERATION, {
            maxRetries: 1,
            retryDelay: 0,
            escalationThreshold: 3,
            fallbackMode: true
        });
        this.policies.set(exports.ErrorType.PLUGIN, {
            maxRetries: 0,
            retryDelay: 0,
            escalationThreshold: 1,
            fallbackMode: false
        });
        this.policies.set(exports.ErrorType.MEMORY, {
            maxRetries: 0,
            retryDelay: 0,
            escalationThreshold: 1,
            fallbackMode: true
        });
        this.policies.set(exports.ErrorType.UNKNOWN, {
            maxRetries: 1,
            retryDelay: 100,
            escalationThreshold: 5,
            fallbackMode: true
        });
    }
    handleError(error, operation, errorType = exports.ErrorType.UNKNOWN) {
        try {
            this.updateStats(error, operation, errorType);
            if (this.globalFallbackMode) {
                this.errorStats.recoveryActions[exports.RecoveryAction.FALLBACK_MODE]++;
                return exports.RecoveryAction.FALLBACK_MODE;
            }
            const policy = this.policies.get(errorType) || this.policies.get(exports.ErrorType.UNKNOWN);
            const errorKey = `${operation}:${errorType}`;
            const currentCount = this.errorHistory.get(errorKey) || 0;
            this.errorHistory.set(errorKey, currentCount + 1);
            let action;
            if (currentCount >= policy.escalationThreshold) {
                if (policy.fallbackMode) {
                    action = exports.RecoveryAction.FALLBACK_MODE;
                    this.globalFallbackMode = true;
                }
                else {
                    action = exports.RecoveryAction.SKIP;
                }
            }
            else if (currentCount < policy.maxRetries) {
                action = exports.RecoveryAction.RETRY;
                if (policy.retryDelay > 0) {
                }
            }
            else {
                if (policy.fallbackMode) {
                    action = exports.RecoveryAction.FALLBACK_MODE;
                }
                else {
                    action = exports.RecoveryAction.SKIP;
                }
            }
            this.errorStats.recoveryActions[action]++;
            return action;
        }
        catch (recoveryError) {
            console.error('ErrorRecoveryManager: Error in error handling:', recoveryError);
            this.errorStats.recoveryActions[exports.RecoveryAction.ABORT]++;
            return exports.RecoveryAction.ABORT;
        }
    }
    updateStats(error, operation, errorType) {
        try {
            this.errorStats.total++;
            this.errorStats.byType[errorType]++;
            this.errorStats.byOperation[operation] = (this.errorStats.byOperation[operation] || 0) + 1;
            this.errorStats.lastError = {
                type: errorType,
                operation,
                message: error.message,
                timestamp: Date.now()
            };
        }
        catch (statsError) {
            console.warn('ErrorRecoveryManager: Error updating stats:', statsError);
        }
    }
    executeWithRecovery(operation, fallback, operationName, errorType = exports.ErrorType.UNKNOWN) {
        try {
            return operation();
        }
        catch (error) {
            const action = this.handleError(error, operationName, errorType);
            switch (action) {
                case exports.RecoveryAction.RETRY:
                    try {
                        return operation();
                    }
                    catch (retryError) {
                        console.warn(`ErrorRecoveryManager: Retry failed for ${operationName}:`, retryError);
                        return fallback();
                    }
                case exports.RecoveryAction.FALLBACK_MODE:
                case exports.RecoveryAction.SKIP:
                    return fallback();
                case exports.RecoveryAction.ABORT:
                default:
                    throw error;
            }
        }
    }
    async executeAsyncWithRecovery(operation, fallback, operationName, errorType = exports.ErrorType.UNKNOWN) {
        try {
            return await operation();
        }
        catch (error) {
            const action = this.handleError(error, operationName, errorType);
            switch (action) {
                case exports.RecoveryAction.RETRY:
                    try {
                        const policy = this.policies.get(errorType);
                        if (policy && policy.retryDelay > 0) {
                            await this.delay(policy.retryDelay);
                        }
                        return await operation();
                    }
                    catch (retryError) {
                        console.warn(`ErrorRecoveryManager: Async retry failed for ${operationName}:`, retryError);
                        return await fallback();
                    }
                case exports.RecoveryAction.FALLBACK_MODE:
                case exports.RecoveryAction.SKIP:
                    return await fallback();
                case exports.RecoveryAction.ABORT:
                default:
                    throw error;
            }
        }
    }
    delay(ms) {
        return new Promise(resolve => safeSetTimeout(resolve, ms));
    }
    resetErrorHistory(operation, errorType) {
        try {
            if (operation && errorType) {
                const errorKey = `${operation}:${errorType}`;
                this.errorHistory.delete(errorKey);
            }
            else if (operation) {
                for (const key of this.errorHistory.keys()) {
                    if (key.startsWith(`${operation}:`)) {
                        this.errorHistory.delete(key);
                    }
                }
            }
            else {
                this.errorHistory.clear();
                this.globalFallbackMode = false;
            }
        }
        catch (error) {
            console.warn('ErrorRecoveryManager: Error resetting history:', error);
        }
    }
    getStats() {
        return { ...this.errorStats };
    }
    setPolicy(errorType, policy) {
        try {
            this.policies.set(errorType, { ...policy });
        }
        catch (error) {
            console.warn('ErrorRecoveryManager: Error setting policy:', error);
        }
    }
    getPolicy(errorType) {
        try {
            const policy = this.policies.get(errorType);
            return policy ? { ...policy } : undefined;
        }
        catch (error) {
            console.warn('ErrorRecoveryManager: Error getting policy:', error);
            return undefined;
        }
    }
    isInFallbackMode() {
        return this.globalFallbackMode;
    }
    exitFallbackMode() {
        this.globalFallbackMode = false;
        this.errorHistory.clear();
    }
    getHealthStatus() {
        try {
            const totalOperations = Object.values(this.errorStats.byOperation).reduce((sum, count) => sum + count, 0);
            const errorRate = totalOperations > 0 ? this.errorStats.total / totalOperations : 0;
            return {
                healthy: errorRate < 0.1 && !this.globalFallbackMode,
                errorRate,
                totalErrors: this.errorStats.total,
                inFallbackMode: this.globalFallbackMode,
                criticalErrors: this.errorStats.byType[exports.ErrorType.MEMORY] + this.errorStats.byType[exports.ErrorType.UNKNOWN],
                status: this.globalFallbackMode ? 'degraded' :
                    errorRate > 0.2 ? 'warning' :
                        errorRate > 0.1 ? 'caution' : 'healthy'
            };
        }
        catch (error) {
            console.warn('ErrorRecoveryManager: Error getting health status:', error);
            return {
                healthy: false,
                errorRate: 1,
                totalErrors: this.errorStats.total,
                inFallbackMode: true,
                criticalErrors: 999,
                status: 'unknown'
            };
        }
    }
}
const globalErrorRecovery = new ErrorRecoveryManager();

class EnhancedLRUCache {
    cache = new Map();
    head;
    tail;
    maxSize;
    stats;
    constructor(maxSize = 1000) {
        this.maxSize = maxSize;
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
            hitRate: 0,
            size: 0,
            maxSize
        };
    }
    get(key) {
        try {
            const node = this.cache.get(key);
            if (node) {
                this.stats.hits++;
                this.updateAccess(node);
                this.moveToHead(node);
                return node.value;
            }
            this.stats.misses++;
            this.updateHitRate();
            return undefined;
        }
        catch (error) {
            console.warn('EnhancedLRUCache: Error in get:', error);
            this.stats.misses++;
            this.updateHitRate();
            return undefined;
        }
    }
    set(key, value) {
        try {
            this.stats.sets++;
            const existingNode = this.cache.get(key);
            if (existingNode) {
                existingNode.value = value;
                this.updateAccess(existingNode);
                this.moveToHead(existingNode);
                return;
            }
            const newNode = {
                key,
                value,
                prev: undefined,
                next: undefined,
                frequency: 1,
                lastAccess: Date.now()
            };
            this.cache.set(key, newNode);
            this.addToHead(newNode);
            this.stats.size++;
            if (this.cache.size > this.maxSize) {
                this.removeTail();
            }
            this.updateHitRate();
        }
        catch (error) {
            console.warn('EnhancedLRUCache: Error in set:', error);
        }
    }
    delete(key) {
        try {
            const node = this.cache.get(key);
            if (node) {
                this.removeNode(node);
                this.cache.delete(key);
                this.stats.deletes++;
                this.stats.size--;
                this.updateHitRate();
                return true;
            }
            return false;
        }
        catch (error) {
            console.warn('EnhancedLRUCache: Error in delete:', error);
            return false;
        }
    }
    updateAccess(node) {
        try {
            node.frequency = (node.frequency || 0) + 1;
            node.lastAccess = Date.now();
        }
        catch (error) {
            console.warn('EnhancedLRUCache: Error updating access:', error);
        }
    }
    moveToHead(node) {
        try {
            if (!node)
                return;
            this.removeNode(node);
            this.addToHead(node);
        }
        catch (error) {
            console.warn('EnhancedLRUCache: Error moving to head:', error);
        }
    }
    addToHead(node) {
        try {
            if (!node)
                return;
            node.prev = undefined;
            node.next = this.head;
            if (this.head) {
                this.head.prev = node;
            }
            this.head = node;
            if (!this.tail) {
                this.tail = node;
            }
        }
        catch (error) {
            console.warn('EnhancedLRUCache: Error adding to head:', error);
        }
    }
    removeNode(node) {
        try {
            if (!node)
                return;
            if (node.prev) {
                node.prev.next = node.next;
            }
            else {
                this.head = node.next;
            }
            if (node.next) {
                node.next.prev = node.prev;
            }
            else {
                this.tail = node.prev;
            }
        }
        catch (error) {
            console.warn('EnhancedLRUCache: Error removing node:', error);
        }
    }
    removeTail() {
        try {
            if (this.tail) {
                this.cache.delete(this.tail.key);
                this.removeNode(this.tail);
                this.stats.evictions++;
                this.stats.size--;
            }
        }
        catch (error) {
            console.warn('EnhancedLRUCache: Error removing tail:', error);
        }
    }
    updateHitRate() {
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
    }
    getStats() {
        return { ...this.stats };
    }
    clear() {
        try {
            this.cache.clear();
            this.head = undefined;
            this.tail = undefined;
            this.stats.size = 0;
        }
        catch (error) {
            console.warn('EnhancedLRUCache: Error clearing cache:', error);
        }
    }
    get size() {
        return this.cache.size;
    }
}
class TieredCacheManager {
    l1Cache;
    l2Cache;
    promoteThreshold;
    accessCounts = new Map();
    constructor(options) {
        const l1Size = Math.max(1, options.l1CacheSize || 100);
        const l2Size = Math.max(1, options.l2CacheSize || 1000);
        const threshold = Math.max(1, options.promoteThreshold || 3);
        this.l1Cache = new EnhancedLRUCache(l1Size);
        this.l2Cache = new EnhancedLRUCache(l2Size);
        this.promoteThreshold = threshold;
    }
    get(key) {
        try {
            let value = this.l1Cache.get(key);
            if (value !== undefined) {
                return value;
            }
            value = this.l2Cache.get(key);
            if (value !== undefined) {
                this.trackAccess(key);
                return value;
            }
            return undefined;
        }
        catch (error) {
            console.warn('TieredCacheManager: Error in get:', error);
            return undefined;
        }
    }
    set(key, value) {
        try {
            this.l2Cache.set(key, value);
        }
        catch (error) {
            console.warn('TieredCacheManager: Error in set:', error);
        }
    }
    trackAccess(key) {
        try {
            const count = this.accessCounts.get(key) || 0;
            const newCount = count + 1;
            this.accessCounts.set(key, newCount);
            if (newCount >= this.promoteThreshold) {
                const value = this.l2Cache.get(key);
                if (value !== undefined) {
                    this.l1Cache.set(key, value);
                }
                this.accessCounts.delete(key);
            }
        }
        catch (error) {
            console.warn('TieredCacheManager: Error tracking access:', error);
        }
    }
    delete(key) {
        try {
            const l1Deleted = this.l1Cache.delete(key);
            const l2Deleted = this.l2Cache.delete(key);
            this.accessCounts.delete(key);
            return l1Deleted || l2Deleted;
        }
        catch (error) {
            console.warn('TieredCacheManager: Error in delete:', error);
            return false;
        }
    }
    getStats() {
        try {
            const l1Stats = this.l1Cache.getStats();
            const l2Stats = this.l2Cache.getStats();
            return {
                l1: l1Stats,
                l2: l2Stats,
                combined: {
                    hits: l1Stats.hits + l2Stats.hits,
                    misses: l1Stats.misses + l2Stats.misses,
                    hitRate: (l1Stats.hits + l2Stats.hits) /
                        (l1Stats.hits + l2Stats.hits + l1Stats.misses + l2Stats.misses),
                    totalSize: l1Stats.size + l2Stats.size,
                    pendingPromotions: this.accessCounts.size
                }
            };
        }
        catch (error) {
            console.warn('TieredCacheManager: Error getting stats:', error);
            return {
                l1: this.l1Cache.getStats(),
                l2: this.l2Cache.getStats(),
                combined: { hits: 0, misses: 0, hitRate: 0, totalSize: 0, pendingPromotions: 0 }
            };
        }
    }
    clear() {
        try {
            this.l1Cache.clear();
            this.l2Cache.clear();
            this.accessCounts.clear();
        }
        catch (error) {
            console.warn('TieredCacheManager: Error clearing:', error);
        }
    }
}

class AdaptiveSerializer {
    strategies = new Map();
    strategyStats = new Map();
    cache;
    enableMetrics;
    objectIdMap = new WeakMap();
    constructor(enableCache = true, enableMetrics = true) {
        this.cache = enableCache ? new TieredCacheManager({
            l1CacheSize: 1000,
            l2CacheSize: 5000,
            promoteThreshold: 3
        }) : undefined;
        this.enableMetrics = enableMetrics;
        this.initializeStrategies();
    }
    initializeStrategies() {
        this.addStrategy({
            name: 'primitive',
            priority: 100,
            canHandle: (obj) => TypeUtils.isPrimitive(obj),
            serialize: (obj) => {
                if (obj === null)
                    return 'null';
                if (obj === undefined)
                    return 'undefined';
                if (typeof obj === 'string')
                    return `"${obj}"`;
                if (typeof obj === 'symbol')
                    return this.serializeSymbol(obj);
                if (typeof obj === 'bigint')
                    return `${obj}n`;
                return String(obj);
            }
        });
        this.addStrategy({
            name: 'simpleObject',
            priority: 95,
            canHandle: (obj) => TypeUtils.isSimpleObject(obj),
            serialize: (obj, context) => {
                try {
                    const keys = Object.keys(obj).sort();
                    const pairs = keys.map(key => {
                        const value = obj[key];
                        const serializedValue = this.serializeValue(value, context);
                        return `"${key}":${serializedValue}`;
                    });
                    return `{${pairs.join(',')}}`;
                }
                catch {
                    return this.fallbackSerialize(obj);
                }
            }
        });
        this.addStrategy({
            name: 'simpleArray',
            priority: 90,
            canHandle: (obj) => {
                return Array.isArray(obj) &&
                    obj.length <= 10 &&
                    obj.every(item => TypeUtils.isPrimitive(item));
            },
            serialize: (obj) => {
                const items = obj.map((item) => {
                    if (item === null)
                        return 'null';
                    if (item === undefined)
                        return 'undefined';
                    if (typeof item === 'string')
                        return `"${item}"`;
                    return String(item);
                });
                return `[${items.join(',')}]`;
            }
        });
        this.addStrategy({
            name: 'date',
            priority: 85,
            canHandle: (obj) => obj instanceof Date,
            serialize: (obj) => `[Date:${obj.getTime()}]`
        });
        this.addStrategy({
            name: 'regexp',
            priority: 85,
            canHandle: (obj) => obj instanceof RegExp,
            serialize: (obj) => `[RegExp:${obj.toString()}]`
        });
        this.addStrategy({
            name: 'error',
            priority: 85,
            canHandle: (obj) => obj instanceof Error,
            serialize: (obj) => `[Error:${obj.name}:${obj.message}]`
        });
        this.addStrategy({
            name: 'function',
            priority: 80,
            canHandle: (obj) => typeof obj === 'function',
            serialize: (obj) => `[Function:${obj.name || 'anonymous'}:${obj.length}]`
        });
        this.addStrategy({
            name: 'complex',
            priority: 75,
            canHandle: () => true,
            serialize: (obj, context) => this.deepSerialize(obj, context)
        });
        this.addStrategy({
            name: 'fastHash',
            priority: 10,
            canHandle: (obj) => {
                const result = globalFastHasher.fastHash(obj);
                return result !== null;
            },
            serialize: (obj) => {
                const result = globalFastHasher.fastHash(obj);
                return result || this.fallbackSerialize(obj);
            }
        });
    }
    addStrategy(strategy) {
        try {
            this.strategies.set(strategy.name, strategy);
            this.strategyStats.set(strategy.name, { usage: 0, avgTime: 0 });
        }
        catch (error) {
            console.warn('AdaptiveSerializer: Error adding strategy:', error);
        }
    }
    serialize(obj) {
        try {
            if (this.cache && typeof obj === 'object' && obj !== null) {
                const cached = this.cache.get(this.getObjectId(obj));
                if (cached !== undefined) {
                    return cached;
                }
            }
            const context = {
                visited: new WeakSet(),
                cache: this.cache,
                depth: 0,
                maxDepth: 50
            };
            try {
                const result = this.serializeValue(obj, context);
                if (this.cache && typeof obj === 'object' && obj !== null) {
                    this.cache.set(this.getObjectId(obj), result);
                }
                return result;
            }
            finally {
            }
        }
        catch (error) {
            console.warn('AdaptiveSerializer: Serialization error:', error);
            return this.fallbackSerialize(obj);
        }
    }
    serializeValue(obj, context) {
        try {
            if (context.depth > context.maxDepth) {
                return '[MaxDepthExceeded]';
            }
            if (typeof obj === 'object' && obj !== null) {
                if (context.visited.has(obj)) {
                    const objectId = this.getObjectId(obj);
                    return `[Circular:${objectId}]`;
                }
            }
            const strategies = Array.from(this.strategies.values())
                .sort((a, b) => b.priority - a.priority);
            for (const strategy of strategies) {
                try {
                    if (strategy.canHandle(obj)) {
                        const startTime = this.enableMetrics ? performance.now() : 0;
                        if (typeof obj === 'object' && obj !== null) {
                            context.visited.add(obj);
                        }
                        const result = strategy.serialize(obj, {
                            ...context,
                            depth: context.depth + 1
                        });
                        if (this.enableMetrics) {
                            this.updateStrategyStats(strategy.name, performance.now() - startTime);
                        }
                        return result;
                    }
                }
                catch (strategyError) {
                    console.warn(`AdaptiveSerializer: Strategy ${strategy.name} failed:`, strategyError);
                    continue;
                }
            }
            return this.fallbackSerialize(obj);
        }
        catch (error) {
            console.warn('AdaptiveSerializer: Error in serializeValue:', error);
            return this.fallbackSerialize(obj);
        }
    }
    deepSerialize(obj, context) {
        try {
            if (Array.isArray(obj)) {
                const items = obj.map(item => this.serializeValue(item, context));
                return `[${items.join(',')}]`;
            }
            if (obj && typeof obj === 'object') {
                const keys = Object.keys(obj).sort();
                const pairs = keys.map(key => {
                    try {
                        const value = this.serializeValue(obj[key], context);
                        return `"${key}":${value}`;
                    }
                    catch {
                        return `"${key}":"[SerializationError]"`;
                    }
                });
                return `{${pairs.join(',')}}`;
            }
            return this.fallbackSerialize(obj);
        }
        catch {
            return this.fallbackSerialize(obj);
        }
    }
    fallbackSerialize(obj) {
        try {
            if (obj === null)
                return 'null';
            if (obj === undefined)
                return 'undefined';
            if (typeof obj === 'string')
                return `"${obj}"`;
            if (typeof obj === 'number')
                return String(obj);
            if (typeof obj === 'boolean')
                return String(obj);
            if (typeof obj === 'symbol')
                return this.serializeSymbol(obj);
            if (typeof obj === 'bigint')
                return `${obj}n`;
            try {
                return JSON.stringify(obj) || '[UnserializableObject]';
            }
            catch {
                return `[${typeof obj}:${Object.prototype.toString.call(obj)}]`;
            }
        }
        catch {
            return '[CriticalSerializationError]';
        }
    }
    serializeSymbol(sym) {
        try {
            const globalKey = Symbol.keyFor(sym);
            if (globalKey !== undefined) {
                return `Symbol.for("${globalKey}")`;
            }
            return 'Symbol()';
        }
        catch {
            return `Symbol(${sym.toString()})`;
        }
    }
    getObjectId(obj) {
        try {
            if (typeof obj === 'object' && obj !== null) {
                if (this.objectIdMap.has(obj)) {
                    return this.objectIdMap.get(obj);
                }
                const newId = `obj_${Math.random().toString(36).substr(2, 9)}`;
                this.objectIdMap.set(obj, newId);
                return newId;
            }
            return `obj_${TypeUtils.getObjectSignature(obj)}`;
        }
        catch {
            return `obj_unknown`;
        }
    }
    updateStrategyStats(strategyName, duration) {
        try {
            const stats = this.strategyStats.get(strategyName);
            if (stats) {
                stats.usage++;
                stats.avgTime = (stats.avgTime * (stats.usage - 1) + duration) / stats.usage;
            }
        }
        catch (error) {
            console.warn('AdaptiveSerializer: Error updating stats:', error);
        }
    }
    getStats() {
        try {
            const strategyStats = Object.fromEntries(this.strategyStats);
            const cacheStats = this.cache?.getStats();
            const fastHashStats = globalFastHasher.getStats();
            return {
                strategies: strategyStats,
                cache: cacheStats,
                fastHash: fastHashStats,
                totalStrategies: this.strategies.size
            };
        }
        catch (error) {
            console.warn('AdaptiveSerializer: Error getting stats:', error);
            return {
                strategies: {},
                cache: null,
                fastHash: null,
                totalStrategies: 0
            };
        }
    }
    resetStats() {
        try {
            this.strategyStats.forEach(stats => {
                stats.usage = 0;
                stats.avgTime = 0;
            });
            this.cache?.clear();
            globalFastHasher.resetStats();
        }
        catch (error) {
            console.warn('AdaptiveSerializer: Error resetting stats:', error);
        }
    }
    clearCache() {
        try {
            this.cache?.clear();
        }
        catch (error) {
            console.warn('AdaptiveSerializer: Error clearing cache:', error);
        }
    }
}
const globalSerializer = new AdaptiveSerializer();

class AsyncTurboMap {
    syncMap;
    options;
    constructor(syncMap, options = {}) {
        this.syncMap = syncMap;
        this.options = {
            batchSize: 100,
            delayBetweenBatches: 1,
            maxConcurrency: 10,
            timeoutMs: 30000,
            enableProgress: false,
            ...options
        };
    }
    async setAsync(key, value) {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            await this.nextTick();
            this.syncMap.set(key, value);
            return this;
        }, async () => {
            console.warn('AsyncTurboMap: Failed to set key, using fallback');
            return this;
        }, 'setAsync', exports.ErrorType.UNKNOWN);
    }
    async getAsync(key) {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            await this.nextTick();
            return this.syncMap.get(key);
        }, async () => {
            console.warn('AsyncTurboMap: Failed to get key, returning undefined');
            return undefined;
        }, 'getAsync', exports.ErrorType.UNKNOWN);
    }
    async hasAsync(key) {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            await this.nextTick();
            return this.syncMap.has(key);
        }, async () => {
            console.warn('AsyncTurboMap: Failed to check key, returning false');
            return false;
        }, 'hasAsync', exports.ErrorType.UNKNOWN);
    }
    async deleteAsync(key) {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            await this.nextTick();
            return this.syncMap.delete(key);
        }, async () => {
            console.warn('AsyncTurboMap: Failed to delete key, returning false');
            return false;
        }, 'deleteAsync', exports.ErrorType.UNKNOWN);
    }
    async clearAsync() {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            await this.nextTick();
            this.syncMap.clear();
        }, async () => {
            console.warn('AsyncTurboMap: Failed to clear map');
        }, 'clearAsync', exports.ErrorType.UNKNOWN);
    }
    async batchExecute(operations) {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            const results = [];
            const { batchSize = 100, delayBetweenBatches = 1 } = this.options;
            for (let i = 0; i < operations.length; i += batchSize) {
                const batch = operations.slice(i, i + batchSize);
                const batchResults = await this.processBatch(batch);
                results.push(...batchResults);
                if (i + batchSize < operations.length && delayBetweenBatches > 0) {
                    await this.delay(delayBetweenBatches);
                }
            }
            return results;
        }, async () => {
            console.warn('AsyncTurboMap: Batch execution failed, returning empty results');
            return [];
        }, 'batchExecute', exports.ErrorType.UNKNOWN);
    }
    async processBatch(operations) {
        const results = [];
        for (const operation of operations) {
            try {
                let data;
                let success = true;
                switch (operation.type) {
                    case 'set':
                        if (operation.value !== undefined) {
                            this.syncMap.set(operation.key, operation.value);
                            data = true;
                        }
                        else {
                            success = false;
                        }
                        break;
                    case 'get':
                        data = this.syncMap.get(operation.key);
                        break;
                    case 'delete':
                        data = this.syncMap.delete(operation.key);
                        break;
                    case 'has':
                        data = this.syncMap.has(operation.key);
                        break;
                    default:
                        success = false;
                        break;
                }
                results.push({
                    id: operation.id,
                    success,
                    data: data,
                    error: undefined
                });
            }
            catch (error) {
                results.push({
                    id: operation.id,
                    success: false,
                    data: undefined,
                    error: error
                });
            }
        }
        return results;
    }
    async setAllAsync(entries) {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            const operations = entries.map(([key, value], index) => ({
                type: 'set',
                key,
                value,
                id: index
            }));
            await this.batchExecute(operations);
            return this;
        }, async () => {
            console.warn('AsyncTurboMap: setAllAsync failed, using fallback');
            return this;
        }, 'setAllAsync', exports.ErrorType.UNKNOWN);
    }
    async getAllAsync(keys) {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            const operations = keys.map((key, index) => ({
                type: 'get',
                key,
                value: undefined,
                id: index
            }));
            const results = await this.batchExecute(operations);
            return results.map(result => result.data);
        }, async () => {
            console.warn('AsyncTurboMap: getAllAsync failed, returning empty array');
            return [];
        }, 'getAllAsync', exports.ErrorType.UNKNOWN);
    }
    async deleteAllAsync(keys) {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            const operations = keys.map((key, index) => ({
                type: 'delete',
                key,
                value: undefined,
                id: index
            }));
            const results = await this.batchExecute(operations);
            return results.map(result => result.data);
        }, async () => {
            console.warn('AsyncTurboMap: deleteAllAsync failed, returning empty array');
            return [];
        }, 'deleteAllAsync', exports.ErrorType.UNKNOWN);
    }
    async sizeAsync() {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            await this.nextTick();
            return this.syncMap.size;
        }, async () => {
            console.warn('AsyncTurboMap: sizeAsync failed, returning 0');
            return 0;
        }, 'sizeAsync', exports.ErrorType.UNKNOWN);
    }
    stream() {
        return new TurboMapAsyncStream(this.syncMap, this.options);
    }
    async *entriesAsync() {
        try {
            const entries = Array.from(this.syncMap.entries());
            const { batchSize = 100, delayBetweenBatches = 1 } = this.options;
            for (let i = 0; i < entries.length; i += batchSize) {
                const batch = entries.slice(i, i + batchSize);
                for (const entry of batch) {
                    yield entry;
                }
                if (i + batchSize < entries.length && delayBetweenBatches > 0) {
                    await this.delay(delayBetweenBatches);
                }
            }
        }
        catch (error) {
            console.warn('AsyncTurboMap: entriesAsync failed:', error);
        }
    }
    async *keysAsync() {
        for await (const [key] of this.entriesAsync()) {
            yield key;
        }
    }
    async *valuesAsync() {
        for await (const [, value] of this.entriesAsync()) {
            yield value;
        }
    }
    async nextTick() {
        return new Promise(resolve => safeSetTimeout(resolve, 0));
    }
    async delay(ms) {
        return new Promise(resolve => safeSetTimeout(resolve, ms));
    }
}
class TurboMapAsyncStream {
    entries;
    options;
    constructor(syncMap, options) {
        this.entries = Array.from(syncMap.entries());
        this.options = options;
    }
    filter(predicate) {
        const newStream = new TurboMapAsyncStream(new Map(), this.options);
        newStream.filterPredicate = predicate;
        newStream.sourceEntries = this.entries;
        return newStream;
    }
    map(transform) {
        const newStream = new TurboMapAsyncStream(new Map(), this.options);
        newStream.mapTransform = transform;
        newStream.sourceEntries = this.entries;
        return newStream;
    }
    async forEach(callback) {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            const { batchSize = 100, delayBetweenBatches = 1 } = this.options;
            for (let i = 0; i < this.entries.length; i += batchSize) {
                const batch = this.entries.slice(i, i + batchSize);
                for (const entry of batch) {
                    await callback(entry);
                }
                if (i + batchSize < this.entries.length && delayBetweenBatches > 0) {
                    await this.delay(delayBetweenBatches);
                }
            }
        }, async () => {
            console.warn('AsyncTurboMapStream: forEach failed');
        }, 'streamForEach', exports.ErrorType.ITERATION);
    }
    async collect() {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            return new Map(this.entries);
        }, async () => {
            console.warn('AsyncTurboMapStream: collect failed, returning empty Map');
            return new Map();
        }, 'streamCollect', exports.ErrorType.UNKNOWN);
    }
    async toArray() {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            return [...this.entries];
        }, async () => {
            console.warn('AsyncTurboMapStream: toArray failed, returning empty array');
            return [];
        }, 'streamToArray', exports.ErrorType.UNKNOWN);
    }
    async reduce(callback, initialValue) {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            let accumulator = initialValue;
            const { batchSize = 100, delayBetweenBatches = 1 } = this.options;
            for (let i = 0; i < this.entries.length; i += batchSize) {
                const batch = this.entries.slice(i, i + batchSize);
                for (const entry of batch) {
                    accumulator = await callback(accumulator, entry);
                }
                if (i + batchSize < this.entries.length && delayBetweenBatches > 0) {
                    await this.delay(delayBetweenBatches);
                }
            }
            return accumulator;
        }, async () => {
            console.warn('AsyncTurboMapStream: reduce failed, returning initial value');
            return initialValue;
        }, 'streamReduce', exports.ErrorType.UNKNOWN);
    }
    async delay(ms) {
        return new Promise(resolve => safeSetTimeout(resolve, ms));
    }
}

class PluginManager {
    plugins = new Map();
    pluginStats = new Map();
    options;
    globalEnabled = true;
    constructor(options = {}) {
        this.options = {
            enableStats: true,
            maxExecutionTime: 100,
            enableErrorRecovery: true,
            pluginTimeout: 5000,
            ...options
        };
    }
    async addPlugin(plugin) {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            if (!plugin || typeof plugin !== 'object') {
                throw new Error('Invalid plugin: must be an object');
            }
            if (!plugin.name || typeof plugin.name !== 'string') {
                throw new Error('Invalid plugin: must have a string name property');
            }
            if (this.plugins.has(plugin.name)) {
                console.warn(`Plugin ${plugin.name} already exists, replacing...`);
            }
            if (plugin.onInstall) {
                await this.executeWithTimeout(() => plugin.onInstall(), this.options.pluginTimeout, `install:${plugin.name}`);
            }
            plugin.enabled = plugin.enabled !== false;
            plugin.priority = plugin.priority || 0;
            this.plugins.set(plugin.name, plugin);
            this.pluginStats.set(plugin.name, {
                name: plugin.name,
                executions: 0,
                errors: 0,
                totalTime: 0,
                averageTime: 0,
                enabled: plugin.enabled
            });
            if (plugin.enabled && plugin.onEnable) {
                await this.executeWithTimeout(() => plugin.onEnable(), this.options.pluginTimeout, `enable:${plugin.name}`);
            }
            return true;
        }, async () => {
            console.error(`Failed to add plugin: ${plugin?.name || 'unknown'}`);
            return false;
        }, 'addPlugin', exports.ErrorType.PLUGIN);
    }
    async removePlugin(pluginName) {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            if (typeof pluginName !== 'string') {
                throw new Error('Plugin name must be a string');
            }
            const plugin = this.plugins.get(pluginName);
            if (!plugin) {
                return false;
            }
            if (plugin.enabled && plugin.onDisable) {
                await this.executeWithTimeout(() => plugin.onDisable(), this.options.pluginTimeout, `disable:${pluginName}`);
            }
            if (plugin.onUninstall) {
                await this.executeWithTimeout(() => plugin.onUninstall(), this.options.pluginTimeout, `uninstall:${pluginName}`);
            }
            this.plugins.delete(pluginName);
            this.pluginStats.delete(pluginName);
            return true;
        }, async () => {
            console.error(`Failed to remove plugin: ${pluginName}`);
            return false;
        }, 'removePlugin', exports.ErrorType.PLUGIN);
    }
    async enablePlugin(pluginName) {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            const plugin = this.plugins.get(pluginName);
            if (!plugin) {
                return false;
            }
            if (plugin.enabled) {
                return true;
            }
            plugin.enabled = true;
            if (plugin.onEnable) {
                await this.executeWithTimeout(() => plugin.onEnable(), this.options.pluginTimeout, `enable:${pluginName}`);
            }
            const stats = this.pluginStats.get(pluginName);
            if (stats) {
                stats.enabled = true;
            }
            return true;
        }, async () => {
            console.error(`Failed to enable plugin: ${pluginName}`);
            return false;
        }, 'enablePlugin', exports.ErrorType.PLUGIN);
    }
    async disablePlugin(pluginName) {
        return globalErrorRecovery.executeAsyncWithRecovery(async () => {
            const plugin = this.plugins.get(pluginName);
            if (!plugin) {
                return false;
            }
            if (!plugin.enabled) {
                return true;
            }
            plugin.enabled = false;
            if (plugin.onDisable) {
                await this.executeWithTimeout(() => plugin.onDisable(), this.options.pluginTimeout, `disable:${pluginName}`);
            }
            const stats = this.pluginStats.get(pluginName);
            if (stats) {
                stats.enabled = false;
            }
            return true;
        }, async () => {
            console.error(`Failed to disable plugin: ${pluginName}`);
            return false;
        }, 'disablePlugin', exports.ErrorType.PLUGIN);
    }
    executeBefore(hookName, context, ...args) {
        if (!this.globalEnabled) {
            return args[0];
        }
        const plugins = this.getActivePlugins();
        let result = args[0];
        for (const plugin of plugins) {
            try {
                const hook = plugin[hookName];
                if (typeof hook === 'function') {
                    const startTime = performance.now();
                    const hookResult = hook.apply(plugin, args);
                    if (hookResult !== undefined && hookResult !== null) {
                        result = hookResult;
                    }
                    if (this.options.enableStats) {
                        this.updateStats(plugin.name, performance.now() - startTime, false);
                    }
                }
            }
            catch (error) {
                this.handlePluginError(plugin, error, context);
            }
        }
        return result;
    }
    executeAfter(hookName, context, ...args) {
        if (!this.globalEnabled) {
            return args[0];
        }
        const plugins = this.getActivePlugins();
        let result = args[0];
        for (const plugin of plugins) {
            try {
                const hook = plugin[hookName];
                if (typeof hook === 'function') {
                    const startTime = performance.now();
                    const hookResult = hook.apply(plugin, args);
                    if (hookResult !== undefined && hookResult !== null) {
                        result = hookResult;
                    }
                    if (this.options.enableStats) {
                        this.updateStats(plugin.name, performance.now() - startTime, false);
                    }
                }
            }
            catch (error) {
                this.handlePluginError(plugin, error, context);
            }
        }
        return result;
    }
    getActivePlugins() {
        return Array.from(this.plugins.values())
            .filter(plugin => plugin.enabled !== false)
            .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }
    handlePluginError(plugin, error, context) {
        if (this.options.enableStats) {
            this.updateStats(plugin.name, 0, true);
        }
        if (this.options.enableErrorRecovery) {
            const action = globalErrorRecovery.handleError(error, `plugin:${plugin.name}:${context.operation}`, exports.ErrorType.PLUGIN);
            if (action === globalErrorRecovery.constructor.name) {
                plugin.enabled = false;
                console.warn(`Auto-disabled problematic plugin: ${plugin.name}`);
            }
        }
        try {
            if (plugin.onError) {
                plugin.onError(error, context.operation, context.key);
            }
        }
        catch (handlerError) {
            console.error(`Plugin ${plugin.name} error handler failed:`, handlerError);
        }
    }
    updateStats(pluginName, duration, isError) {
        try {
            const stats = this.pluginStats.get(pluginName);
            if (stats) {
                stats.executions++;
                if (isError) {
                    stats.errors++;
                }
                else {
                    stats.totalTime += duration;
                    stats.averageTime = stats.totalTime / (stats.executions - stats.errors);
                }
                stats.lastExecution = Date.now();
            }
        }
        catch (error) {
            console.warn('PluginManager: Error updating stats:', error);
        }
    }
    async executeWithTimeout(fn, timeout, operation) {
        return new Promise((resolve, reject) => {
            const timer = safeSetTimeout(() => {
                reject(new Error(`Plugin operation timed out: ${operation}`));
            }, timeout);
            try {
                const result = fn();
                if (result instanceof Promise) {
                    result
                        .then(value => {
                        safeClearTimeout(timer);
                        resolve(value);
                    })
                        .catch(error => {
                        safeClearTimeout(timer);
                        reject(error);
                    });
                }
                else {
                    safeClearTimeout(timer);
                    resolve(result);
                }
            }
            catch (error) {
                safeClearTimeout(timer);
                reject(error);
            }
        });
    }
    getPlugin(name) {
        return this.plugins.get(name);
    }
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }
    getPluginStats(name) {
        if (name) {
            const stats = this.pluginStats.get(name);
            return stats ? { ...stats } : {
                name,
                executions: 0,
                errors: 0,
                totalTime: 0,
                averageTime: 0,
                enabled: false
            };
        }
        return Array.from(this.pluginStats.values()).map(stats => ({ ...stats }));
    }
    clearStats() {
        for (const stats of this.pluginStats.values()) {
            stats.executions = 0;
            stats.errors = 0;
            stats.totalTime = 0;
            stats.averageTime = 0;
            delete stats.lastExecution;
        }
    }
    setGlobalEnabled(enabled) {
        this.globalEnabled = enabled;
    }
    isGlobalEnabled() {
        return this.globalEnabled;
    }
    getStatus() {
        const plugins = Array.from(this.plugins.values());
        const stats = Array.from(this.pluginStats.values());
        return {
            totalPlugins: plugins.length,
            enabledPlugins: plugins.filter(p => p.enabled !== false).length,
            totalExecutions: stats.reduce((sum, s) => sum + s.executions, 0),
            totalErrors: stats.reduce((sum, s) => sum + s.errors, 0),
            globalEnabled: this.globalEnabled,
            averageExecutionTime: this.calculateAverageExecutionTime(),
            errorRate: this.calculateErrorRate()
        };
    }
    calculateAverageExecutionTime() {
        const stats = Array.from(this.pluginStats.values());
        const totalTime = stats.reduce((sum, s) => sum + s.totalTime, 0);
        const totalExecutions = stats.reduce((sum, s) => sum + (s.executions - s.errors), 0);
        return totalExecutions > 0 ? totalTime / totalExecutions : 0;
    }
    calculateErrorRate() {
        const stats = Array.from(this.pluginStats.values());
        const totalErrors = stats.reduce((sum, s) => sum + s.errors, 0);
        const totalExecutions = stats.reduce((sum, s) => sum + s.executions, 0);
        return totalExecutions > 0 ? totalErrors / totalExecutions : 0;
    }
}

class PerformanceMonitor {
    operations = new Map();
    trends = [];
    maxTrendEntries = 1000;
    trackOperation(operation, duration) {
        try {
            const existing = this.operations.get(operation);
            const now = Date.now();
            if (existing) {
                existing.count++;
                existing.totalTime += duration;
                existing.minTime = Math.min(existing.minTime, duration);
                existing.maxTime = Math.max(existing.maxTime, duration);
                existing.lastExecuted = now;
            }
            else {
                this.operations.set(operation, {
                    count: 1,
                    totalTime: duration,
                    minTime: duration,
                    maxTime: duration,
                    lastExecuted: now
                });
            }
            this.trends.push({ timestamp: now, operation, duration });
            if (this.trends.length > this.maxTrendEntries) {
                this.trends = this.trends.slice(-this.maxTrendEntries);
            }
        }
        catch (error) {
            console.warn('PerformanceMonitor: Error tracking operation:', error);
        }
    }
    getProfile() {
        try {
            const operations = {};
            for (const [name, data] of this.operations) {
                operations[name] = {
                    count: data.count,
                    totalTime: data.totalTime,
                    averageTime: data.totalTime / data.count,
                    minTime: data.minTime,
                    maxTime: data.maxTime,
                    lastExecuted: data.lastExecuted
                };
            }
            const hotspots = Array.from(this.operations.entries())
                .map(([operation, data]) => ({
                operation,
                averageTime: data.totalTime / data.count,
                count: data.count
            }))
                .sort((a, b) => b.averageTime - a.averageTime)
                .slice(0, 10);
            return {
                operations,
                hotspots,
                trends: [...this.trends]
            };
        }
        catch (error) {
            console.warn('PerformanceMonitor: Error getting profile:', error);
            return {
                operations: {},
                hotspots: [],
                trends: []
            };
        }
    }
    reset() {
        this.operations.clear();
        this.trends.length = 0;
    }
    getOperationStats(operation) {
        const data = this.operations.get(operation);
        if (!data) {
            return null;
        }
        return {
            count: data.count,
            totalTime: data.totalTime,
            averageTime: data.totalTime / data.count,
            minTime: data.minTime,
            maxTime: data.maxTime,
            lastExecuted: data.lastExecuted
        };
    }
}
class MemoryAnalyzer {
    memoryTrend = [];
    maxTrendEntries = 500;
    analyzeMap(map) {
        try {
            const nodeMemory = this.getNodeMemoryUsage();
            const estimatedSize = this.estimateMapSize(map);
            const keyDistribution = this.analyzeKeyDistribution(map);
            const largestKeys = this.findLargestKeys(map);
            this.updateMemoryTrend(nodeMemory.heapUsed);
            return {
                heapUsed: nodeMemory.heapUsed,
                heapTotal: nodeMemory.heapTotal,
                external: nodeMemory.external,
                estimatedMapSize: estimatedSize,
                keyDistribution,
                largestKeys,
                memoryTrend: [...this.memoryTrend]
            };
        }
        catch (error) {
            console.warn('MemoryAnalyzer: Error analyzing map:', error);
            return {
                heapUsed: 0,
                heapTotal: 0,
                external: 0,
                estimatedMapSize: 0,
                keyDistribution: {},
                largestKeys: [],
                memoryTrend: []
            };
        }
    }
    getNodeMemoryUsage() {
        try {
            const nodeGlobal = globalThis;
            if (typeof nodeGlobal.process !== 'undefined' && nodeGlobal.process.memoryUsage) {
                return nodeGlobal.process.memoryUsage();
            }
        }
        catch {
        }
        return {
            heapUsed: 0,
            heapTotal: 0,
            external: 0,
            rss: 0
        };
    }
    estimateMapSize(map) {
        try {
            if (map.size === 0)
                return 0;
            const sampleSize = Math.min(10, map.size);
            let totalEstimate = 0;
            let count = 0;
            for (const [key, value] of map) {
                if (count >= sampleSize)
                    break;
                const keySize = this.estimateObjectSize(key);
                const valueSize = this.estimateObjectSize(value);
                totalEstimate += keySize + valueSize;
                count++;
            }
            const averageEntrySize = count > 0 ? totalEstimate / count : 0;
            return averageEntrySize * map.size;
        }
        catch (error) {
            console.warn('MemoryAnalyzer: Error estimating map size:', error);
            return 0;
        }
    }
    estimateObjectSize(obj) {
        try {
            if (obj === null || obj === undefined)
                return 8;
            const type = typeof obj;
            switch (type) {
                case 'string':
                    return obj.length * 2 + 24;
                case 'number':
                    return 8;
                case 'boolean':
                    return 8;
                case 'bigint':
                    return 16;
                case 'symbol':
                    return 24;
                case 'object':
                    if (Array.isArray(obj)) {
                        return 24 + obj.length * 8 + obj.reduce((sum, item) => sum + this.estimateObjectSize(item), 0);
                    }
                    try {
                        return JSON.stringify(obj).length * 2 + 64;
                    }
                    catch {
                        return 256;
                    }
                case 'function':
                    return obj.toString().length * 2 + 64;
                default:
                    return 64;
            }
        }
        catch {
            return 64;
        }
    }
    analyzeKeyDistribution(map) {
        try {
            const distribution = {};
            for (const key of map.keys()) {
                const type = this.getDetailedType(key);
                distribution[type] = (distribution[type] || 0) + 1;
            }
            return distribution;
        }
        catch (error) {
            console.warn('MemoryAnalyzer: Error analyzing key distribution:', error);
            return {};
        }
    }
    getDetailedType(obj) {
        if (obj === null)
            return 'null';
        if (obj === undefined)
            return 'undefined';
        const type = typeof obj;
        if (type !== 'object')
            return type;
        if (Array.isArray(obj))
            return 'array';
        if (obj instanceof Date)
            return 'date';
        if (obj instanceof RegExp)
            return 'regexp';
        if (obj instanceof Error)
            return 'error';
        return 'object';
    }
    findLargestKeys(map) {
        try {
            const keySizes = [];
            for (const key of map.keys()) {
                const size = this.estimateObjectSize(key);
                const keyStr = this.keyToString(key);
                keySizes.push({ key: keyStr, size });
            }
            return keySizes
                .sort((a, b) => b.size - a.size)
                .slice(0, 10);
        }
        catch (error) {
            console.warn('MemoryAnalyzer: Error finding largest keys:', error);
            return [];
        }
    }
    keyToString(key) {
        try {
            if (typeof key === 'string')
                return key;
            if (typeof key === 'number' || typeof key === 'boolean')
                return String(key);
            if (key === null)
                return 'null';
            if (key === undefined)
                return 'undefined';
            try {
                const str = JSON.stringify(key);
                return str.length > 100 ? str.substring(0, 97) + '...' : str;
            }
            catch {
                return Object.prototype.toString.call(key);
            }
        }
        catch {
            return '[UnknownKey]';
        }
    }
    updateMemoryTrend(usage) {
        try {
            this.memoryTrend.push({
                timestamp: Date.now(),
                usage
            });
            if (this.memoryTrend.length > this.maxTrendEntries) {
                this.memoryTrend = this.memoryTrend.slice(-this.maxTrendEntries);
            }
        }
        catch (error) {
            console.warn('MemoryAnalyzer: Error updating memory trend:', error);
        }
    }
}
class DiagnosticAnalyzer {
    performanceMonitor = new PerformanceMonitor();
    memoryAnalyzer = new MemoryAnalyzer();
    generateReport(map, errorStats, cacheStats, _pluginStats) {
        try {
            const performanceProfile = this.performanceMonitor.getProfile();
            const memoryUsage = this.memoryAnalyzer.analyzeMap(map);
            const errorAnalysis = this.generateErrorAnalysis(errorStats);
            const optimizationSuggestions = this.generateOptimizationSuggestions(performanceProfile, memoryUsage, errorAnalysis, cacheStats, _pluginStats);
            const healthScore = this.calculateHealthScore(performanceProfile, memoryUsage, errorAnalysis);
            const recommendations = this.generateRecommendations(optimizationSuggestions);
            return {
                performanceProfile,
                memoryUsage,
                errorAnalysis,
                optimizationSuggestions,
                healthScore,
                recommendations
            };
        }
        catch (error) {
            console.warn('DiagnosticAnalyzer: Error generating report:', error);
            return this.getEmptyReport();
        }
    }
    trackOperation(operation, duration) {
        this.performanceMonitor.trackOperation(operation, duration);
    }
    generateErrorAnalysis(errorStats) {
        if (!errorStats) {
            return {
                totalErrors: 0,
                errorsByType: {},
                errorsByOperation: {},
                recentErrors: [],
                errorTrends: []
            };
        }
        return {
            totalErrors: errorStats.total || 0,
            errorsByType: errorStats.byType || {},
            errorsByOperation: errorStats.byOperation || {},
            recentErrors: errorStats.recentErrors || [],
            errorTrends: errorStats.trends || []
        };
    }
    generateOptimizationSuggestions(performance, memory, errors, cacheStats, _pluginStats) {
        const suggestions = [];
        if (performance.hotspots.length > 0) {
            const slowestOp = performance.hotspots[0];
            if (slowestOp && slowestOp.averageTime > 10) {
                suggestions.push({
                    type: 'performance',
                    priority: 'high',
                    title: '慢操作优化',
                    description: `操作 "${slowestOp.operation}" 平均执行时间为 ${slowestOp.averageTime.toFixed(2)}ms`,
                    action: '考虑优化此操作的实现或添加缓存',
                    impact: '可显著提高整体性能',
                    effort: 'medium'
                });
            }
        }
        if (memory.estimatedMapSize > 50 * 1024 * 1024) {
            suggestions.push({
                type: 'memory',
                priority: 'high',
                title: '内存使用过高',
                description: `估计内存使用量为 ${(memory.estimatedMapSize / 1024 / 1024).toFixed(2)}MB`,
                action: '考虑实现LRU缓存或数据压缩',
                impact: '减少内存占用，提高系统稳定性',
                effort: 'high'
            });
        }
        if (errors.totalErrors > 100) {
            suggestions.push({
                type: 'error',
                priority: 'high',
                title: '错误频率过高',
                description: `总错误数为 ${errors.totalErrors}`,
                action: '检查错误日志，修复主要错误源',
                impact: '提高系统稳定性和可靠性',
                effort: 'medium'
            });
        }
        if (cacheStats && cacheStats.hitRate < 0.5) {
            suggestions.push({
                type: 'performance',
                priority: 'medium',
                title: '缓存命中率低',
                description: `缓存命中率为 ${(cacheStats.hitRate * 100).toFixed(1)}%`,
                action: '调整缓存策略或增加缓存大小',
                impact: '提高数据访问速度',
                effort: 'low'
            });
        }
        return suggestions;
    }
    calculateHealthScore(performance, memory, errors) {
        try {
            let score = 100;
            const avgPerformance = Object.values(performance.operations)
                .reduce((sum, op) => sum + op.averageTime, 0) / Object.keys(performance.operations).length;
            if (avgPerformance > 10)
                score -= 20;
            else if (avgPerformance > 5)
                score -= 10;
            const memoryMB = memory.estimatedMapSize / 1024 / 1024;
            if (memoryMB > 100)
                score -= 30;
            else if (memoryMB > 50)
                score -= 15;
            const totalOps = Object.values(performance.operations).reduce((sum, op) => sum + op.count, 0);
            const errorRate = totalOps > 0 ? errors.totalErrors / totalOps : 0;
            if (errorRate > 0.1)
                score -= 25;
            else if (errorRate > 0.05)
                score -= 15;
            else if (errorRate > 0.01)
                score -= 5;
            return Math.max(0, Math.min(100, score));
        }
        catch {
            return 50;
        }
    }
    generateRecommendations(suggestions) {
        const highPriority = suggestions.filter(s => s.priority === 'high');
        const recommendations = [];
        if (highPriority.length === 0) {
            recommendations.push('系统运行状况良好，无需立即优化');
        }
        else {
            recommendations.push(`发现 ${highPriority.length} 个高优先级优化机会`);
            recommendations.push(...highPriority.slice(0, 3).map(s => s.title));
        }
        return recommendations;
    }
    getEmptyReport() {
        return {
            performanceProfile: { operations: {}, hotspots: [], trends: [] },
            memoryUsage: {
                heapUsed: 0,
                heapTotal: 0,
                external: 0,
                estimatedMapSize: 0,
                keyDistribution: {},
                largestKeys: [],
                memoryTrend: []
            },
            errorAnalysis: {
                totalErrors: 0,
                errorsByType: {},
                errorsByOperation: {},
                recentErrors: [],
                errorTrends: []
            },
            optimizationSuggestions: [],
            healthScore: 0,
            recommendations: ['无法生成诊断报告']
        };
    }
    reset() {
        this.performanceMonitor.reset();
    }
}
const globalDiagnostic = new DiagnosticAnalyzer();

function createEnhancedTurboMap(entriesOrOptions, optionsParam) {
    let entries = null;
    let options = {};
    if (entriesOrOptions && (Symbol.iterator in Object(entriesOrOptions))) {
        entries = entriesOrOptions;
        options = optionsParam || {};
    }
    else if (entriesOrOptions && typeof entriesOrOptions === 'object') {
        options = entriesOrOptions;
    }
    const config = {
        enableCache: true,
        cacheMaxSize: 10000,
        enableAdaptiveSerialization: true,
        enableMetrics: true,
        enableAutoCleanup: true,
        cleanupInterval: 300000,
        enableTieredCache: true,
        l1CacheSize: 1000,
        l2CacheSize: 5000,
        promoteThreshold: 3,
        enableErrorRecovery: true,
        maxRetries: 3,
        fallbackMode: true,
        enablePlugins: true,
        pluginTimeout: 5000,
        enableDiagnostics: true,
        trackPerformance: true,
        enableAsync: true,
        batchSize: 100,
        maxConcurrency: 10,
        ...options
    };
    return globalErrorRecovery.executeWithRecovery(() => createEnhancedTurboMapInternal(entries, config), () => createFallbackEnhancedTurboMap(), 'createEnhancedTurboMap', exports.ErrorType.UNKNOWN);
}
function createEnhancedTurboMapInternal(entries, config) {
    const internalMap = new Map();
    const keyMap = new Map();
    const pluginManager = config.enablePlugins ? new PluginManager({
        enableStats: config.enableDiagnostics,
        maxExecutionTime: 100,
        enableErrorRecovery: config.enableErrorRecovery,
        pluginTimeout: config.pluginTimeout
    }) : null;
    const cache = config.enableTieredCache ? new TieredCacheManager({
        l1CacheSize: config.l1CacheSize,
        l2CacheSize: config.l2CacheSize,
        promoteThreshold: config.promoteThreshold
    }) : null;
    let operationCount = 0;
    let cacheHits = 0;
    let cacheMisses = 0;
    let errorCount = 0;
    const serialize = (key) => {
        return globalErrorRecovery.executeWithRecovery(() => {
            const startTime = config.trackPerformance ? performance.now() : 0;
            if (cache) {
                let cacheKey;
                if (typeof key === 'object' && key !== null) {
                    cacheKey = `obj_${globalFastHasher.fastHash(key) || Date.now()}_${Math.random()}`;
                }
                else if (typeof key === 'symbol') {
                    cacheKey = `symbol_skip_${Math.random()}`;
                }
                else {
                    cacheKey = String(key);
                }
                if (typeof key !== 'symbol') {
                    const cached = cache.get(cacheKey);
                    if (cached !== undefined) {
                        cacheHits++;
                        return cached;
                    }
                }
                cacheMisses++;
            }
            const result = config.enableAdaptiveSerialization
                ? globalSerializer.serialize(key)
                : JSON.stringify(key);
            if (cache && typeof key !== 'symbol') {
                const cacheKey = typeof key === 'object' && key !== null
                    ? `obj_${globalFastHasher.fastHash(key) || Date.now()}_${Math.random()}`
                    : String(key);
                cache.set(cacheKey, result);
            }
            if (config.trackPerformance) {
                globalDiagnostic.trackOperation('serialize', performance.now() - startTime);
            }
            return result;
        }, () => {
            errorCount++;
            try {
                return JSON.stringify(key);
            }
            catch {
                return `[SerializationError:${typeof key}:${Date.now()}]`;
            }
        }, 'serialize', exports.ErrorType.SERIALIZATION);
    };
    const enhancedMap = {
        [Symbol.toStringTag]: 'EnhancedTurboMap',
        get size() {
            return internalMap.size;
        },
        set(key, value) {
            return globalErrorRecovery.executeWithRecovery(() => {
                operationCount++;
                const startTime = config.trackPerformance ? performance.now() : 0;
                const beforeResult = pluginManager?.executeBefore('beforeSet', {
                    operation: 'set',
                    key,
                    value,
                    metadata: undefined,
                    timestamp: Date.now()
                }, key, value);
                const finalKey = beforeResult?.key ?? key;
                const finalValue = beforeResult?.value ?? value;
                const serializedKey = serialize(finalKey);
                internalMap.set(serializedKey, finalValue);
                keyMap.set(serializedKey, finalKey);
                pluginManager?.executeAfter('afterSet', {
                    operation: 'set',
                    key: finalKey,
                    value: finalValue,
                    metadata: undefined,
                    timestamp: Date.now()
                }, finalKey, finalValue);
                if (config.trackPerformance) {
                    globalDiagnostic.trackOperation('set', performance.now() - startTime);
                }
                return enhancedMap;
            }, () => {
                errorCount++;
                console.warn('EnhancedTurboMap: Set operation failed, skipping');
                return enhancedMap;
            }, 'set', exports.ErrorType.UNKNOWN);
        },
        get(key) {
            return globalErrorRecovery.executeWithRecovery(() => {
                operationCount++;
                const startTime = config.trackPerformance ? performance.now() : 0;
                const beforeResult = pluginManager?.executeBefore('beforeGet', {
                    operation: 'get',
                    key,
                    value: undefined,
                    metadata: undefined,
                    timestamp: Date.now()
                }, key);
                const finalKey = beforeResult ?? key;
                const serializedKey = serialize(finalKey);
                const value = internalMap.get(serializedKey);
                let finalValue = value;
                if (pluginManager && pluginManager.getAllPlugins().length > 0) {
                    const pluginResult = pluginManager.executeAfter('afterGet', {
                        operation: 'get',
                        key: finalKey,
                        value,
                        metadata: undefined,
                        timestamp: Date.now()
                    }, finalKey, value);
                    finalValue = pluginResult ?? value;
                }
                if (config.trackPerformance) {
                    globalDiagnostic.trackOperation('get', performance.now() - startTime);
                }
                return finalValue;
            }, () => {
                errorCount++;
                console.warn('EnhancedTurboMap: Get operation failed, returning undefined');
                return undefined;
            }, 'get', exports.ErrorType.UNKNOWN);
        },
        has(key) {
            return globalErrorRecovery.executeWithRecovery(() => {
                operationCount++;
                const serializedKey = serialize(key);
                return internalMap.has(serializedKey);
            }, () => {
                errorCount++;
                console.warn('EnhancedTurboMap: Has operation failed, returning false');
                return false;
            }, 'has', exports.ErrorType.UNKNOWN);
        },
        delete(key) {
            return globalErrorRecovery.executeWithRecovery(() => {
                operationCount++;
                const startTime = config.trackPerformance ? performance.now() : 0;
                const beforeResult = pluginManager?.executeBefore('beforeDelete', {
                    operation: 'delete',
                    key,
                    value: undefined,
                    metadata: undefined,
                    timestamp: Date.now()
                }, key);
                const finalKey = beforeResult ?? key;
                const serializedKey = serialize(finalKey);
                const deleted = internalMap.delete(serializedKey);
                if (deleted) {
                    keyMap.delete(serializedKey);
                }
                pluginManager?.executeAfter('afterDelete', {
                    operation: 'delete',
                    key: finalKey,
                    value: undefined,
                    metadata: undefined,
                    timestamp: Date.now()
                }, finalKey, deleted);
                if (config.trackPerformance) {
                    globalDiagnostic.trackOperation('delete', performance.now() - startTime);
                }
                return deleted;
            }, () => {
                errorCount++;
                console.warn('EnhancedTurboMap: Delete operation failed, returning false');
                return false;
            }, 'delete', exports.ErrorType.UNKNOWN);
        },
        clear() {
            globalErrorRecovery.executeWithRecovery(() => {
                operationCount++;
                const shouldClear = pluginManager?.executeBefore('beforeClear', {
                    operation: 'clear',
                    key: undefined,
                    value: undefined,
                    metadata: undefined,
                    timestamp: Date.now()
                }) !== false;
                if (shouldClear) {
                    internalMap.clear();
                    keyMap.clear();
                    pluginManager?.executeAfter('afterClear', {
                        operation: 'clear',
                        key: undefined,
                        value: undefined,
                        metadata: undefined,
                        timestamp: Date.now()
                    });
                }
            }, () => {
                errorCount++;
                console.warn('EnhancedTurboMap: Clear operation failed');
            }, 'clear', exports.ErrorType.UNKNOWN);
        },
        getSerializedKey(key) {
            return serialize(key);
        },
        setAll(entries) {
            return globalErrorRecovery.executeWithRecovery(() => {
                if (!Array.isArray(entries)) {
                    throw new Error('setAll requires an array of entries');
                }
                for (const [key, value] of entries) {
                    this.set(key, value);
                }
                return enhancedMap;
            }, () => {
                errorCount++;
                console.warn('EnhancedTurboMap: setAll operation failed');
                return enhancedMap;
            }, 'setAll', exports.ErrorType.UNKNOWN);
        },
        getAll(keys) {
            return globalErrorRecovery.executeWithRecovery(() => {
                if (!Array.isArray(keys)) {
                    throw new Error('getAll requires an array of keys');
                }
                return keys.map(key => this.get(key));
            }, () => {
                errorCount++;
                console.warn('EnhancedTurboMap: getAll operation failed');
                return [];
            }, 'getAll', exports.ErrorType.UNKNOWN);
        },
        deleteAll(keys) {
            return globalErrorRecovery.executeWithRecovery(() => {
                if (!Array.isArray(keys)) {
                    throw new Error('deleteAll requires an array of keys');
                }
                return keys.map(key => this.delete(key));
            }, () => {
                errorCount++;
                console.warn('EnhancedTurboMap: deleteAll operation failed');
                return [];
            }, 'deleteAll', exports.ErrorType.UNKNOWN);
        },
        findByValue(predicate) {
            return globalErrorRecovery.executeWithRecovery(() => {
                if (typeof predicate !== 'function') {
                    throw new Error('findByValue requires a function predicate');
                }
                for (const [key, value] of this.entries()) {
                    if (predicate(value, key)) {
                        return [key, value];
                    }
                }
                return undefined;
            }, () => {
                errorCount++;
                console.warn('EnhancedTurboMap: findByValue operation failed');
                return undefined;
            }, 'findByValue', exports.ErrorType.UNKNOWN);
        },
        filter(predicate) {
            return globalErrorRecovery.executeWithRecovery(() => {
                const result = [];
                for (const [key, value] of this.entries()) {
                    if (predicate(value, key)) {
                        result.push([key, value]);
                    }
                }
                return result;
            }, () => {
                errorCount++;
                console.warn('EnhancedTurboMap: filter operation failed');
                return [];
            }, 'filter', exports.ErrorType.UNKNOWN);
        },
        mapValues(transform) {
            return globalErrorRecovery.executeWithRecovery(() => {
                const result = createEnhancedTurboMap([], config);
                for (const [key, value] of this.entries()) {
                    result.set(key, transform(value, key));
                }
                return result;
            }, () => {
                errorCount++;
                console.warn('EnhancedTurboMap: mapValues operation failed');
                return createEnhancedTurboMap([], config);
            }, 'mapValues', exports.ErrorType.UNKNOWN);
        },
        *entries() {
            try {
                for (const [serializedKey, value] of internalMap.entries()) {
                    const originalKey = keyMap.get(serializedKey);
                    if (originalKey !== undefined) {
                        yield [originalKey, value];
                    }
                }
            }
            catch (error) {
                errorCount++;
                console.warn('EnhancedTurboMap: entries iteration failed:', error);
            }
        },
        *keys() {
            for (const [key] of this.entries()) {
                yield key;
            }
        },
        *values() {
            for (const [, value] of this.entries()) {
                yield value;
            }
        },
        forEach(callback) {
            try {
                for (const [key, value] of this.entries()) {
                    callback(value, key, enhancedMap);
                }
            }
            catch (error) {
                errorCount++;
                console.warn('EnhancedTurboMap: forEach failed:', error);
            }
        },
        [Symbol.iterator]() {
            return this.entries();
        },
        getMetrics() {
            return {
                size: this.size,
                operationCount,
                cacheHits,
                cacheMisses,
                cacheHitRate: operationCount > 0 ? cacheHits / operationCount : 0,
                errorCount,
                errorRate: operationCount > 0 ? errorCount / operationCount : 0,
                pluginStats: pluginManager?.getStatus(),
                cacheStats: cache?.getStats(),
                serializerStats: config.enableAdaptiveSerialization ? globalSerializer.getStats() : null
            };
        },
        debug() {
            return {
                size: this.size,
                internalMapSize: internalMap.size,
                keyMapSize: keyMap.size,
                config,
                health: this.getHealthStatus(),
                diagnostics: this.getDiagnostics()
            };
        },
        getDiagnostics() {
            if (!config.enableDiagnostics) {
                return null;
            }
            const cacheStats = cache?.getStats();
            return globalDiagnostic.generateReport(internalMap, globalErrorRecovery.getStats(), cacheStats?.combined ? {
                hits: cacheStats.combined.hits,
                misses: cacheStats.combined.misses,
                hitRate: cacheStats.combined.hitRate,
                size: cacheStats.combined.totalSize
            } : undefined, pluginManager?.getStatus());
        },
        getHealthStatus() {
            const errorRate = operationCount > 0 ? errorCount / operationCount : 0;
            const cacheHitRate = operationCount > 0 ? cacheHits / operationCount : 0;
            return {
                healthy: errorRate < 0.05 && !globalErrorRecovery.isInFallbackMode(),
                errorRate,
                cacheHitRate,
                inFallbackMode: globalErrorRecovery.isInFallbackMode(),
                score: this.getDiagnostics()?.healthScore || 0
            };
        },
        async addPlugin(plugin) {
            if (!pluginManager) {
                console.warn('EnhancedTurboMap: Plugins not enabled');
                return false;
            }
            return pluginManager.addPlugin(plugin);
        },
        async removePlugin(pluginName) {
            if (!pluginManager)
                return false;
            return pluginManager.removePlugin(pluginName);
        },
        async enablePlugin(pluginName) {
            if (!pluginManager)
                return false;
            return pluginManager.enablePlugin(pluginName);
        },
        async disablePlugin(pluginName) {
            if (!pluginManager)
                return false;
            return pluginManager.disablePlugin(pluginName);
        },
        getPluginStats() {
            return pluginManager?.getStatus() || null;
        },
        toAsync() {
            if (!config.enableAsync) {
                throw new Error('Async operations not enabled');
            }
            const mapWrapper = new Map();
            for (const [key, value] of enhancedMap.entries()) {
                mapWrapper.set(key, value);
            }
            return new AsyncTurboMap(mapWrapper, {
                batchSize: config.batchSize,
                maxConcurrency: config.maxConcurrency
            });
        },
        optimize() {
            globalErrorRecovery.executeWithRecovery(() => {
                cache?.clear();
                globalSerializer.clearCache();
                globalErrorRecovery.resetErrorHistory();
                console.log('EnhancedTurboMap: Optimization completed');
            }, () => {
                console.warn('EnhancedTurboMap: Optimization failed');
            }, 'optimize', exports.ErrorType.UNKNOWN);
        },
        reset() {
            globalErrorRecovery.executeWithRecovery(() => {
                this.clear();
                operationCount = 0;
                cacheHits = 0;
                cacheMisses = 0;
                errorCount = 0;
                cache?.clear();
                globalSerializer.resetStats();
                globalDiagnostic.reset();
                globalErrorRecovery.resetErrorHistory();
                console.log('EnhancedTurboMap: Reset completed');
            }, () => {
                console.warn('EnhancedTurboMap: Reset failed');
            }, 'reset', exports.ErrorType.UNKNOWN);
        },
        serialize() {
            return globalErrorRecovery.executeWithRecovery(() => {
                const entries = Array.from(this.entries());
                return JSON.stringify(entries);
            }, () => {
                console.warn('EnhancedTurboMap: Serialization failed');
                return '[]';
            }, 'serialize', exports.ErrorType.SERIALIZATION);
        },
        clone() {
            return globalErrorRecovery.executeWithRecovery(() => {
                const entriesArray = [];
                for (const [key, value] of enhancedMap.entries()) {
                    entriesArray.push([key, value]);
                }
                const cloned = createEnhancedTurboMap(entriesArray, config);
                return cloned;
            }, () => {
                console.warn('EnhancedTurboMap: Clone failed, returning empty map');
                return createEnhancedTurboMap([], config);
            }, 'clone', exports.ErrorType.UNKNOWN);
        },
        cleanup() {
            globalErrorRecovery.executeWithRecovery(() => {
                cache?.clear();
                globalSerializer.clearCache();
                if (typeof globalThis.global !== 'undefined' && globalThis.global?.gc) {
                    globalThis.global.gc();
                }
                console.log('EnhancedTurboMap: Cleanup completed');
            }, () => {
                console.warn('EnhancedTurboMap: Cleanup failed');
            }, 'cleanup', exports.ErrorType.MEMORY);
        },
        compact() {
            globalErrorRecovery.executeWithRecovery(() => {
                const toDelete = [];
                for (const serializedKey of internalMap.keys()) {
                    if (!keyMap.has(serializedKey)) {
                        toDelete.push(serializedKey);
                    }
                }
                for (const key of toDelete) {
                    internalMap.delete(key);
                }
                console.log(`EnhancedTurboMap: Compacted, removed ${toDelete.length} orphaned entries`);
            }, () => {
                console.warn('EnhancedTurboMap: Compact failed');
            }, 'compact', exports.ErrorType.UNKNOWN);
        }
    };
    if (entries) {
        try {
            for (const [key, value] of entries) {
                enhancedMap.set(key, value);
            }
        }
        catch (error) {
            errorCount++;
            console.warn('EnhancedTurboMap: Failed to populate initial data:', error);
        }
    }
    if (config.enableAutoCleanup) {
        setInterval(() => {
            enhancedMap.cleanup();
        }, config.cleanupInterval);
    }
    return enhancedMap;
}
function createFallbackEnhancedTurboMap() {
    const fallbackMap = new Map();
    return {
        [Symbol.toStringTag]: 'EnhancedTurboMap',
        get size() { return fallbackMap.size; },
        set: function (key, value) { fallbackMap.set(key, value); return this; },
        get: (key) => fallbackMap.get(key),
        has: (key) => fallbackMap.has(key),
        delete: (key) => fallbackMap.delete(key),
        clear: () => fallbackMap.clear(),
        entries: () => fallbackMap.entries(),
        keys: () => fallbackMap.keys(),
        values: () => fallbackMap.values(),
        forEach: function (callback) {
            fallbackMap.forEach((value, key) => callback(value, key, this));
        },
        [Symbol.iterator]: () => fallbackMap[Symbol.iterator](),
        getSerializedKey: (key) => JSON.stringify(key),
        setAll: function (entries) { entries.forEach(([k, v]) => fallbackMap.set(k, v)); return this; },
        getAll: (keys) => keys.map(k => fallbackMap.get(k)),
        deleteAll: (keys) => keys.map(k => fallbackMap.delete(k)),
        findByValue: () => undefined,
        filter: () => [],
        mapValues: () => createFallbackEnhancedTurboMap(),
        getMetrics: () => ({
            size: fallbackMap.size,
            operationCount: 0,
            cacheHits: 0,
            cacheMisses: 0,
            cacheHitRate: 0,
            errorCount: 1,
            errorRate: 1,
            fallbackMode: true
        }),
        debug: () => ({
            size: fallbackMap.size,
            internalMapSize: fallbackMap.size,
            keyMapSize: fallbackMap.size,
            config: { fallbackMode: true },
            health: { healthy: false, fallbackMode: true },
            diagnostics: null,
            fallbackMode: true
        }),
        getDiagnostics: () => null,
        getHealthStatus: () => ({
            healthy: false,
            errorRate: 1,
            cacheHitRate: 0,
            inFallbackMode: true,
            score: 0,
            fallbackMode: true
        }),
        addPlugin: async () => false,
        removePlugin: async () => false,
        enablePlugin: async () => false,
        disablePlugin: async () => false,
        getPluginStats: () => null,
        toAsync: () => { throw new Error('Async not available in fallback mode'); },
        optimize: () => { },
        reset: () => fallbackMap.clear(),
        serialize: () => '[]',
        clone: () => createFallbackEnhancedTurboMap(),
        cleanup: () => { },
        compact: () => { }
    };
}

exports.AdaptiveSerializer = AdaptiveSerializer;
exports.AsyncTurboMap = AsyncTurboMap;
exports.DiagnosticAnalyzer = DiagnosticAnalyzer;
exports.EnhancedLRUCache = EnhancedLRUCache;
exports.EnhancedObjectPool = EnhancedObjectPool;
exports.ErrorRecoveryManager = ErrorRecoveryManager;
exports.FastHasher = FastHasher;
exports.MemoryAnalyzer = MemoryAnalyzer;
exports.ObjectPool = ObjectPool;
exports.PerformanceMonitor = PerformanceMonitor;
exports.PluginManager = PluginManager;
exports.TieredCacheManager = TieredCacheManager;
exports.TypeUtils = TypeUtils;
exports.createEnhancedTurboMap = createEnhancedTurboMap;
exports.createTurboMap = createEnhancedTurboMap;
exports.globalDiagnostic = globalDiagnostic;
exports.globalErrorRecovery = globalErrorRecovery;
exports.globalFastHasher = globalFastHasher;
exports.globalObjectPool = globalObjectPool;
exports.globalSerializer = globalSerializer;
//# sourceMappingURL=index.js.map
