import { AsyncTurboMap } from '../../src/turboMap/core/AsyncTurboMap';

describe('AsyncTurboMap', () => {
  let asyncMap: AsyncTurboMap<any, any>;
  let syncMap: Map<any, any>;

  beforeEach(() => {
    syncMap = new Map<any, any>();
    asyncMap = new AsyncTurboMap(syncMap);
  });

  afterEach(() => {
    syncMap.clear();
  });

  describe('Basic Async Operations', () => {
    test('should set and get values asynchronously', async () => {
      await asyncMap.setAsync('key1', 1);
      await asyncMap.setAsync('key2', 2);

      const value1 = await asyncMap.getAsync('key1');
      const value2 = await asyncMap.getAsync('key2');

      expect(value1).toBe(1);
      expect(value2).toBe(2);
    });

    test('should check existence asynchronously', async () => {
      await asyncMap.setAsync('key1', 1);

      const hasKey1 = await asyncMap.hasAsync('key1');
      const hasKey2 = await asyncMap.hasAsync('key2');

      expect(hasKey1).toBe(true);
      expect(hasKey2).toBe(false);
    });

    test('should delete values asynchronously', async () => {
      await asyncMap.setAsync('key1', 1);
      await asyncMap.setAsync('key2', 2);

      const deleted1 = await asyncMap.deleteAsync('key1');
      const deleted2 = await asyncMap.deleteAsync('key2');
      const deleted3 = await asyncMap.deleteAsync('nonexistent');

      expect(deleted1).toBe(true);
      expect(deleted2).toBe(true);
      expect(deleted3).toBe(false);

      const hasKey1 = await asyncMap.hasAsync('key1');
      expect(hasKey1).toBe(false);
    });

    test('should clear all values asynchronously', async () => {
      await asyncMap.setAsync('key1', 1);
      await asyncMap.setAsync('key2', 2);

      await asyncMap.clearAsync();

      const hasKey1 = await asyncMap.hasAsync('key1');
      const hasKey2 = await asyncMap.hasAsync('key2');

      expect(hasKey1).toBe(false);
      expect(hasKey2).toBe(false);
    });

    test('should get size asynchronously', async () => {
      await asyncMap.setAsync('key1', 1);
      await asyncMap.setAsync('key2', 2);

      const size = await asyncMap.sizeAsync();
      expect(size).toBe(2);
    });
  });

  describe('Batch Operations', () => {
    test('should execute batch operations', async () => {
      const operations = [
        { type: 'set' as const, key: 'key1', value: 1 },
        { type: 'set' as const, key: 'key2', value: 2 },
        { type: 'get' as const, key: 'key1' },
        { type: 'has' as const, key: 'key2' },
        { type: 'delete' as const, key: 'key1' }
      ];

      const results = await asyncMap.batchExecute(operations);

      expect(results).toHaveLength(5);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[2].data).toBe(1);
      expect(results[3].data).toBe(true);
      expect(results[4].data).toBe(true);
    });

    test('should handle large batch operations', async () => {
      const operations: any[] = [];
      for (let i = 0; i < 100; i++) {
        operations.push({ type: 'set' as const, key: `key${i}`, value: i });
      }

      const results = await asyncMap.batchExecute(operations);

      expect(results).toHaveLength(100);
      expect(results.every(r => r.success)).toBe(true);
    });

    test('should handle mixed batch operations', async () => {
      // First set some values
      const setOperations = [
        { type: 'set' as const, key: 'key1', value: 1 },
        { type: 'set' as const, key: 'key2', value: 2 },
        { type: 'set' as const, key: 'key3', value: 3 }
      ];

      await asyncMap.batchExecute(setOperations);

      // Then perform mixed operations
      const mixedOperations = [
        { type: 'get' as const, key: 'key1' },
        { type: 'delete' as const, key: 'key2' },
        { type: 'has' as const, key: 'key3' },
        { type: 'set' as const, key: 'key4', value: 4 }
      ];

      const results = await asyncMap.batchExecute(mixedOperations);

      expect(results[0].data).toBe(1);
      expect(results[1].data).toBe(true);
      expect(results[2].data).toBe(true);
      expect(results[3].success).toBe(true);
    });
  });

  describe('Concurrent Operations', () => {
    test('should handle concurrent set operations', async () => {
      const promises: Promise<any>[] = [];
      for (let i = 0; i < 10; i++) {
        promises.push(asyncMap.setAsync(`key${i}`, i));
      }

      await Promise.all(promises);

      for (let i = 0; i < 10; i++) {
        const value = await asyncMap.getAsync(`key${i}`);
        expect(value).toBe(i);
      }
    });

    test('should handle concurrent get operations', async () => {
      await asyncMap.setAsync('key1', 1);
      await asyncMap.setAsync('key2', 2);

      const promises = [
        asyncMap.getAsync('key1'),
        asyncMap.getAsync('key2'),
        asyncMap.getAsync('key1'),
        asyncMap.getAsync('key2')
      ];

      const results = await Promise.all(promises);
      expect(results).toEqual([1, 2, 1, 2]);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid keys gracefully', async () => {
      const invalidKey = Symbol('test') as any;
      
      await asyncMap.setAsync(invalidKey, 1);
      const value = await asyncMap.getAsync(invalidKey);
      
      expect(value).toBe(1);
    });

    test('should handle serialization errors', async () => {
      const circular: any = { id: 1 };
      circular.self = circular;

      await asyncMap.setAsync(circular, 1);
      const value = await asyncMap.getAsync(circular);
      
      expect(value).toBe(1);
    });

    test('should handle timeouts', async () => {
      const slowMap = new AsyncTurboMap(syncMap, { timeoutMs: 1 });
      
      // This should complete quickly despite the short timeout
      await slowMap.setAsync('key1', 1);
      const value = await slowMap.getAsync('key1');
      
      expect(value).toBe(1);
    });
  });

  describe('Performance and Optimization', () => {
    test('should handle large batches efficiently', async () => {
      const operations: any[] = [];
      for (let i = 0; i < 1000; i++) {
        operations.push({ type: 'set' as const, key: `key${i}`, value: i });
      }

      const startTime = Date.now();
      const results = await asyncMap.batchExecute(operations);
      const endTime = Date.now();

      expect(results).toHaveLength(1000);
      expect(results.every(r => r.success)).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle complex objects efficiently', async () => {
      const largeObjects: any[] = [];
      for (let i = 0; i < 100; i++) {
        largeObjects.push({
          type: 'set' as const,
          key: `key${i}`,
          value: {
            data: new Array(1000).fill(i),
            timestamp: Date.now()
          }
        });
      }

      const results = await asyncMap.batchExecute(largeObjects);
      expect(results).toHaveLength(100);
      expect(results.every(r => r.success)).toBe(true);
    });
  });

  describe('Configuration Options', () => {
    test('should work with custom batch size', async () => {
      const customMap = new AsyncTurboMap(syncMap, { batchSize: 5 });
      
      const operations: any[] = [];
      for (let i = 0; i < 10; i++) {
        operations.push({ type: 'set' as const, key: `key${i}`, value: i });
      }

      const results = await customMap.batchExecute(operations);
      expect(results).toHaveLength(10);
    });

    test('should work with custom concurrency', async () => {
      const customMap = new AsyncTurboMap(syncMap, { maxConcurrency: 2 });
      
      const operations: any[] = [];
      for (let i = 0; i < 10; i++) {
        operations.push({ type: 'set' as const, key: `key${i}`, value: i });
      }

      const results = await customMap.batchExecute(operations);
      expect(results).toHaveLength(10);
    });
  });

  describe('Iterator Support', () => {
    test('should support async entries iteration', async () => {
      await asyncMap.setAsync('key1', 1);
      await asyncMap.setAsync('key2', 2);

      const entries: any[] = [];
      for await (const entry of asyncMap.entriesAsync()) {
        entries.push(entry);
      }

      expect(entries).toHaveLength(2);
      expect(entries).toContainEqual(['key1', 1]);
      expect(entries).toContainEqual(['key2', 2]);
    });

    test('should support async keys iteration', async () => {
      await asyncMap.setAsync('key1', 1);
      await asyncMap.setAsync('key2', 2);

      const keys: any[] = [];
      for await (const key of asyncMap.keysAsync()) {
        keys.push(key);
      }

      expect(keys).toHaveLength(2);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });

    test('should support async values iteration', async () => {
      await asyncMap.setAsync('key1', 1);
      await asyncMap.setAsync('key2', 2);

      const values: any[] = [];
      for await (const value of asyncMap.valuesAsync()) {
        values.push(value);
      }

      expect(values).toHaveLength(2);
      expect(values).toContain(1);
      expect(values).toContain(2);
    });
  });

  describe('Complex Data Types', () => {
    test('should handle complex object keys', async () => {
      const complexKey = {
        id: 1,
        data: [1, 2, 3],
        nested: { value: 'test' }
      };

      await asyncMap.setAsync(complexKey as any, 999);
      const value = await asyncMap.getAsync(complexKey as any);
      expect(value).toBe(999);
    });

    test('should handle function keys', async () => {
      const funcKey = () => 'test';
      
      await asyncMap.setAsync(funcKey as any, 123);
      const value = await asyncMap.getAsync(funcKey as any);
      expect(value).toBe(123);
    });

    test('should handle array keys', async () => {
      const arrayKey = [1, 2, 3, { nested: 'value' }];
      
      await asyncMap.setAsync(arrayKey as any, 456);
      const value = await asyncMap.getAsync(arrayKey as any);
      expect(value).toBe(456);
    });
  });
}); 
