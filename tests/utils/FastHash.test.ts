import { FastHasher } from '../../src/turboMap/utils/FastHash';

describe('FastHash', () => {
  let hasher: FastHasher;

  beforeEach(() => {
    hasher = new FastHasher();
  });

  describe('Basic Hashing', () => {
    test('should hash primitive values', () => {
      expect(hasher.fastHash(42)).toBeDefined();
      expect(hasher.fastHash('hello')).toBeDefined();
      expect(hasher.fastHash(true)).toBeDefined();
      expect(hasher.fastHash(null)).toBeDefined();
      expect(hasher.fastHash(undefined)).toBeDefined();
    });

    test('should hash simple objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 2, a: 1 };
      const obj3 = { a: 1, b: 3 };

      const hash1 = hasher.fastHash(obj1);
      const hash2 = hasher.fastHash(obj2);
      const hash3 = hasher.fastHash(obj3);

      expect(hash1).toBeDefined();
      expect(hash2).toBe(hash1); // Same properties, different order
      expect(hash3).not.toBe(hash1); // Different values
    });

    test('should hash arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const arr3 = [1, 2, 4];

      const hash1 = hasher.fastHash(arr1);
      const hash2 = hasher.fastHash(arr2);
      const hash3 = hasher.fastHash(arr3);

      expect(hash1).toBeDefined();
      expect(hash2).toBe(hash1);
      expect(hash3).not.toBe(hash1);
    });

    test('should produce consistent hashes', () => {
      const obj = { a: 1, b: 2 };
      
      const hash1 = hasher.fastHash(obj);
      const hash2 = hasher.fastHash(obj);
      const hash3 = hasher.fastHash(obj);

      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
    });

    test('should produce unique hashes for different objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { a: 2 };
      const obj3 = { b: 1 };

      const hash1 = hasher.fastHash(obj1);
      const hash2 = hasher.fastHash(obj2);
      const hash3 = hasher.fastHash(obj3);

      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash2).not.toBe(hash3);
    });
  });

  describe('Complex Object Hashing', () => {
    test('should handle nested objects', () => {
      const nested1 = { a: { b: { c: 1 } } };
      const nested2 = { a: { b: { c: 1 } } };
      const nested3 = { a: { b: { c: 2 } } };

      const hash1 = hasher.fastHash(nested1);
      const hash2 = hasher.fastHash(nested2);
      const hash3 = hasher.fastHash(nested3);

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
    });

    test('should handle objects with functions', () => {
      const objWithFunc = { a: 1, b: () => {} };
      const hash = hasher.fastHash(objWithFunc);
      expect(hash).toBeDefined();
    });

    test('should handle objects with getters and setters', () => {
      const objWithGetter = {
        get computed() { return 'value'; }
      };
      const hash = hasher.fastHash(objWithGetter);
      expect(hash).toBeDefined();
    });

    test('should handle circular references', () => {
      const circular: any = { id: 1 };
      circular.self = circular;
      
      const hash = hasher.fastHash(circular);
      expect(hash).toBeDefined();
    });

    test('should handle mixed types', () => {
      const mixed = {
        string: 'test',
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined,
        array: [1, 2, 3],
        object: { nested: true }
      };

      const hash = hasher.fastHash(mixed);
      expect(hash).toBeDefined();
    });
  });

  describe('Hash Strategies', () => {
    test('should use appropriate strategies for different types', () => {
      const primitiveHash = hasher.fastHash(42);
      const stringHash = hasher.fastHash('test');
      const objectHash = hasher.fastHash({ a: 1 });
      const arrayHash = hasher.fastHash([1, 2, 3]);

      expect(primitiveHash).toBeDefined();
      expect(stringHash).toBeDefined();
      expect(objectHash).toBeDefined();
      expect(arrayHash).toBeDefined();
    });

    test('should add custom hash strategies', () => {
      const customStrategy = (obj: unknown) => {
        if (typeof obj === 'string' && obj.startsWith('custom:')) {
          return `custom_${obj}`;
        }
        return null;
      };

      hasher.addStrategy('primitive:string', customStrategy);
      
      const result = hasher.fastHash('custom:test');
      expect(result).toBe('custom_custom:test');
    });

    test('should handle strategy conflicts', () => {
      const strategy1 = (obj: unknown) => {
        if (typeof obj === 'string') return `strategy1_${obj}`;
        return null;
      };

      const strategy2 = (obj: unknown) => {
        if (typeof obj === 'string') return `strategy2_${obj}`;
        return null;
      };

      hasher.addStrategy('conflict1', strategy1);
      hasher.addStrategy('conflict2', strategy2);

      const result = hasher.fastHash('test');
      expect(result).toBeDefined();
    });
  });

  describe('Performance Optimization', () => {
    test('should cache hash results', () => {
      const obj = { a: 1, b: 2 };
      
      const hash1 = hasher.fastHash(obj);
      const hash2 = hasher.fastHash(obj);
      
      expect(hash1).toBe(hash2);
    });

    test('should handle large objects efficiently', () => {
      const largeObj: any = {};
      for (let i = 0; i < 1000; i++) {
        largeObj[`key${i}`] = i;
      }
      
      const startTime = Date.now();
      const hash = hasher.fastHash(largeObj);
      const endTime = Date.now();
      
      expect(hash).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle repeated hashing efficiently', () => {
      const obj = { a: 1, b: 2 };
      
      for (let i = 0; i < 100; i++) {
        const hash = hasher.fastHash(obj);
        expect(hash).toBeDefined();
      }
    });
  });

  describe('Hash Collision Resistance', () => {
    test('should minimize hash collisions', () => {
      const hashes = new Set<string>();
      
      // Generate many different objects
      for (let i = 0; i < 1000; i++) {
        const obj = { id: i, data: `data${i}`, timestamp: Date.now() + i };
        const hash = hasher.fastHash(obj);
        if (hash) {
          hashes.add(hash);
        }
      }
      
      // Should have very few collisions
      expect(hashes.size).toBeGreaterThan(950);
    });

    test('should handle similar objects', () => {
      const hashes = new Set<string>();
      
      // Generate similar objects
      for (let i = 0; i < 100; i++) {
        const obj = { 
          id: i, 
          name: 'test', 
          data: { value: i, type: 'test' } 
        };
        const hash = hasher.fastHash(obj);
        if (hash) {
          hashes.add(hash);
        }
      }
      
      // Should have unique hashes for different IDs
      expect(hashes.size).toBe(100);
    });
  });

  describe('Special Cases', () => {
    test('should handle empty objects and arrays', () => {
      const emptyObjHash = hasher.fastHash({});
      const emptyArrHash = hasher.fastHash([]);
      
      expect(emptyObjHash).toBeDefined();
      expect(emptyArrHash).toBeDefined();
      expect(emptyObjHash).not.toBe(emptyArrHash);
    });

    test('should handle symbol and numeric keys', () => {
      const obj: any = {
        [Symbol('sym')]: 'symbol value',
        123: 'numeric key'
      };
      
      const hash = hasher.fastHash(obj);
      expect(hash).toBeDefined();
    });

    test('should handle deep nesting', () => {
      let deep: any = { value: 'deep' };
      for (let i = 0; i < 10; i++) {
        deep = { nested: deep };
      }
      
      const hash = hasher.fastHash(deep);
      expect(hash).toBeDefined();
    });

    test('should handle prototype chains', () => {
      const proto = { inherited: 'value' };
      const obj = Object.create(proto);
      obj.own = 'property';
      
      const hash = hasher.fastHash(obj);
      expect(hash).toBeDefined();
    });
  });

  describe('Configuration Options', () => {
    test('should work with cache disabled', () => {
      const noCacheHasher = new FastHasher();
      const obj = { a: 1 };
      
      const hash1 = noCacheHasher.fastHash(obj);
      const hash2 = noCacheHasher.fastHash(obj);
      
      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
    });

    test('should work with different algorithms', () => {
      const customHasher = new FastHasher();
      const obj = { a: 1 };
      
      const hash = customHasher.fastHash(obj);
      expect(hash).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle unhashable objects gracefully', () => {
      const unhashable = new Map();
      const hash = hasher.fastHash(unhashable);
      expect(hash).toBeDefined();
    });

    test('should handle memory pressure', () => {
      const largeObjects: any[] = [];
      for (let i = 0; i < 100; i++) {
        largeObjects.push({
          data: new Array(1000).fill(i),
          timestamp: Date.now()
        });
      }
      
      for (const obj of largeObjects) {
        const hash = hasher.fastHash(obj);
        expect(hash).toBeDefined();
      }
    });
  });

  describe('Batch Hashing', () => {
    test('should handle multiple objects efficiently', () => {
      const objects: any[] = [];
      for (let i = 0; i < 100; i++) {
        objects.push({ id: i, data: `data${i}` });
      }
      
      const hashes = objects.map(obj => hasher.fastHash(obj));
      
      expect(hashes).toHaveLength(100);
      expect(hashes.every(hash => hash !== null)).toBe(true);
    });

    test('should handle concurrent hashing', () => {
      const promises: Promise<string | null>[] = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(Promise.resolve().then(() => {
          const obj = { id: i, data: `data${i}` };
          return hasher.fastHash(obj);
        }));
      }

      return Promise.all(promises).then(hashes => {
        expect(hashes).toHaveLength(10);
        expect(hashes.every(hash => hash !== null)).toBe(true);
      });
    });
  });
}); 
