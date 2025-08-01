import { createEnhancedTurboMap } from '../src/index';

describe('TurboMap Main Entry', () => {
  let turboMap: ReturnType<typeof createEnhancedTurboMap<any, any>>;

  beforeEach(() => {
    turboMap = createEnhancedTurboMap<any, any>();
  });

  afterEach(() => {
    turboMap.clear();
  });

  describe('Basic Map Operations', () => {
    test('should create empty map', () => {
      expect(turboMap.size).toBe(0);
      expect(turboMap.has('test')).toBe(false);
    });

    test('should set and get values', () => {
      turboMap.set('key1', 1);
      turboMap.set('key2', 2);

      expect(turboMap.get('key1')).toBe(1);
      expect(turboMap.get('key2')).toBe(2);
      expect(turboMap.size).toBe(2);
    });

    test('should handle complex object keys', () => {
      const key1 = { id: 1, name: 'test1' };
      const key2 = { id: 2, name: 'test2' };

      turboMap.set(key1, 100);
      turboMap.set(key2, 200);

      expect(turboMap.get(key1)).toBe(100);
      expect(turboMap.get(key2)).toBe(200);
    });

    test('should delete values', () => {
      turboMap.set('key1', 1);
      turboMap.set('key2', 2);

      expect(turboMap.delete('key1')).toBe(true);
      expect(turboMap.has('key1')).toBe(false);
      expect(turboMap.get('key1')).toBeUndefined();
      expect(turboMap.size).toBe(1);
    });

    test('should clear all values', () => {
      turboMap.set('key1', 1);
      turboMap.set('key2', 2);

      turboMap.clear();
      expect(turboMap.size).toBe(0);
      expect(turboMap.has('key1')).toBe(false);
      expect(turboMap.has('key2')).toBe(false);
    });

    test('should iterate over entries', () => {
      turboMap.set('key1', 1);
      turboMap.set('key2', 2);

      const entries = Array.from(turboMap.entries());
      expect(entries).toEqual([['key1', 1], ['key2', 2]]);
    });

    test('should iterate over keys', () => {
      turboMap.set('key1', 1);
      turboMap.set('key2', 2);

      const keys = Array.from(turboMap.keys());
      expect(keys).toEqual(['key1', 'key2']);
    });

    test('should iterate over values', () => {
      turboMap.set('key1', 1);
      turboMap.set('key2', 2);

      const values = Array.from(turboMap.values());
      expect(values).toEqual([1, 2]);
    });

    test('should support forEach', () => {
      turboMap.set('key1', 1);
      turboMap.set('key2', 2);

      const result: Array<[any, any]> = [];
      turboMap.forEach((value: any, key: any) => {
        result.push([key, value]);
      });

      expect(result).toEqual([['key1', 1], ['key2', 2]]);
    });
  });

  describe('Advanced Features', () => {
    test('should handle nested objects as keys', () => {
      const nestedKey = {
        level1: {
          level2: {
            id: 123,
            data: { name: 'test', tags: ['a', 'b'] }
          }
        }
      };

      turboMap.set(nestedKey, 999);
      expect(turboMap.get(nestedKey)).toBe(999);
    });

    test('should handle arrays as keys', () => {
      const arrayKey = [1, 2, 3, { nested: 'value' }];
      turboMap.set(arrayKey, 456);
      expect(turboMap.get(arrayKey)).toBe(456);
    });

    test('should handle functions as keys', () => {
      const funcKey = () => 'test';
      turboMap.set(funcKey, 789);
      expect(turboMap.get(funcKey)).toBe(789);
    });

    test('should handle null and undefined keys', () => {
      turboMap.set(null as any, 1);
      turboMap.set(undefined as any, 2);

      expect(turboMap.get(null as any)).toBe(1);
      expect(turboMap.get(undefined as any)).toBe(2);
    });
  });

  describe('Performance and Metrics', () => {
    test('should provide metrics', () => {
      turboMap.set('key1', 1);
      turboMap.set('key2', 2);

      const metrics = turboMap.getMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics.operationCount).toBe('number');
      expect(typeof metrics.cacheHitRate).toBe('number');
    });

    test('should provide debug information', () => {
      turboMap.set('key1', 1);
      const debug = turboMap.debug();
      expect(debug).toBeDefined();
      expect(typeof debug).toBe('object');
    });

    test('should provide diagnostics', () => {
      turboMap.set('key1', 1);
      const diagnostics = turboMap.getDiagnostics();
      expect(diagnostics).toBeDefined();
      expect(typeof diagnostics).toBe('object');
    });

    test('should provide health status', () => {
      const health = turboMap.getHealthStatus();
      expect(health).toBeDefined();
      expect(typeof health.healthy).toBe('boolean');
      expect(typeof health.errorRate).toBe('number');
    });

    test('should provide plugin stats', () => {
      const stats = turboMap.getPluginStats();
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid operations gracefully', () => {
      // Test with invalid keys
      const invalidKey = Symbol('test');
      turboMap.set(invalidKey as any, 1);
      expect(turboMap.get(invalidKey as any)).toBe(1);
    });

    test('should handle concurrent operations', async () => {
      const promises: Promise<void>[] = [];
      for (let i = 0; i < 10; i++) {
        promises.push(Promise.resolve().then(() => {
          turboMap.set(`key${i}`, i);
        }));
      }

      await Promise.all(promises);
      expect(turboMap.size).toBe(10);
    });
  });

  describe('Configuration Options', () => {
    test('should work with custom configuration', () => {
      const customTurboMap = createEnhancedTurboMap<any, any>({
        enableCache: true,
        enableAdaptiveSerialization: true
      });

      customTurboMap.set('key1', 1);
      expect(customTurboMap.get('key1')).toBe(1);
    });

    test('should handle different key types with configuration', () => {
      const customTurboMap = createEnhancedTurboMap<any, any>({
        enableAdaptiveSerialization: true,
        enableCache: true
      });

      const complexKey = {
        id: 1,
        data: [1, 2, 3],
        nested: { value: 'test' }
      };

      customTurboMap.set(complexKey, 'value');
      expect(customTurboMap.get(complexKey)).toBe('value');
    });
  });

  describe('Memory Management', () => {
    test('should handle large datasets', () => {
      const largeMap = createEnhancedTurboMap<string, number>();
      
      // Add many entries
      for (let i = 0; i < 1000; i++) {
        largeMap.set(`key${i}`, i);
      }

      expect(largeMap.size).toBe(1000);
      
      // Clear and verify memory cleanup
      largeMap.clear();
      expect(largeMap.size).toBe(0);
    });

    test('should handle memory pressure', () => {
      const memoryMap = createEnhancedTurboMap<string, any>();
      
      // Create objects that might cause memory pressure
      for (let i = 0; i < 100; i++) {
        memoryMap.set(`key${i}`, {
          data: new Array(1000).fill(i),
          metadata: { timestamp: Date.now() }
        });
      }

      expect(memoryMap.size).toBe(100);
      memoryMap.clear();
    });
  });

  describe('Serialization', () => {
    test('should handle serialization of complex objects', () => {
      const complexKey = {
        id: 1,
        data: [1, 2, 3],
        nested: { value: 'test' },
        func: () => 'test'
      };

      const complexValue = {
        timestamp: Date.now(),
        data: new Map([['a', 1], ['b', 2]]),
        metadata: { version: '1.0' }
      };

      turboMap.set(complexKey, complexValue);
      const retrieved = turboMap.get(complexKey);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.timestamp).toBe(complexValue.timestamp);
    });
  });

  describe('Plugin System', () => {
    test('should support plugin registration', async () => {
      const plugin = {
        name: 'test-plugin',
        version: '1.0.0',
        onInit: jest.fn(),
        onSet: jest.fn(),
        onGet: jest.fn(),
        onDelete: jest.fn()
      };

      const result = await turboMap.addPlugin(plugin as any);
      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle circular references', () => {
      const circular: any = { id: 1 };
      circular.self = circular;

      turboMap.set(circular, 'circular');
      expect(turboMap.get(circular)).toBe('circular');
    });

    test('should handle very deep nested objects', () => {
      let deep: any = { value: 'deep' };
      for (let i = 0; i < 10; i++) {
        deep = { nested: deep };
      }

      turboMap.set(deep, 'deep-value');
      expect(turboMap.get(deep)).toBe('deep-value');
    });

    test('should handle special characters in string keys', () => {
      const specialKeys = [
        'key with spaces',
        'key\nwith\nnewlines',
        'key\twith\ttabs',
        'key with emoji 🚀',
        'key with unicode 中文',
        'key with "quotes"',
        'key with \'single quotes\''
      ];

      specialKeys.forEach((key, index) => {
        turboMap.set(key, index);
      });

      specialKeys.forEach((key, index) => {
        expect(turboMap.get(key)).toBe(index);
      });
    });
  });
}); 
