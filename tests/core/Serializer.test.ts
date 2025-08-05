import { AdaptiveSerializer } from '../../src/turboMap/core/Serializer';

describe('Serializer', () => {
  let serializer: AdaptiveSerializer;

  beforeEach(() => {
    serializer = new AdaptiveSerializer();
  });

  describe('Basic Serialization', () => {
    test('should serialize primitive values', () => {
      expect(serializer.serialize(42)).toBe('42');
      expect(serializer.serialize('hello')).toBe('"hello"');
      expect(serializer.serialize(true)).toBe('true');
      expect(serializer.serialize(false)).toBe('false');
      expect(serializer.serialize(null)).toBe('null');
      expect(serializer.serialize(undefined)).toBe('undefined');
    });

    test('should serialize simple objects', () => {
      const obj = { a: 1, b: 2 };
      const result = serializer.serialize(obj);
      expect(result).toContain('"a":1');
      expect(result).toContain('"b":2');
    });

    test('should serialize arrays', () => {
      const arr = [1, 2, 3];
      const result = serializer.serialize(arr);
      expect(result).toBe('[1,2,3]');
    });

    test('should serialize nested structures', () => {
      const nested = {
        a: 1,
        b: [2, 3, { c: 4 }],
        d: { e: 5 }
      };
      const result = serializer.serialize(nested);
      expect(result).toContain('"a":1');
      expect(result).toContain('[2,3,{"c":4}]');
      expect(result).toContain('{"e":5}');
    });
  });

  describe('Complex Object Handling', () => {
    test('should handle circular references', () => {
      const circular: any = { id: 1 };
      circular.self = circular;
      
      const result = serializer.serialize(circular);
      expect(result).toContain('[Circular:');
    });

    test('should handle functions', () => {
      const func = () => 'test';
      const result = serializer.serialize(func);
      expect(result).toContain('[Function:');
    });

    test('should handle symbols consistently (user requirement)', () => {
      const sym = Symbol('test');
      const result = serializer.serialize(sym);
      // 用户需求：所有普通 Symbol() 都序列化为相同字符串
      expect(result).toBe('Symbol()');
    });

    test('should handle dates', () => {
      const date = new Date('2023-01-01');
      const result = serializer.serialize(date);
      expect(result).toContain('[Date:');
    });

    test('should handle regex', () => {
      const regex = /test/g;
      const result = serializer.serialize(regex);
      expect(result).toContain('[RegExp:');
    });

    test('should handle errors', () => {
      const error = new Error('test error');
      const result = serializer.serialize(error);
      expect(result).toContain('[Error:');
    });
  });

  describe('Serialization Strategies', () => {
    test('should use fast hash for simple objects', () => {
      const simpleObj = { a: 1, b: 2 };
      const result = serializer.serialize(simpleObj);
      expect(result).toBeDefined();
    });

    test('should handle custom strategies', () => {
      const customStrategy = {
        name: 'custom',
        priority: 200,
        canHandle: (obj: unknown) => typeof obj === 'string' && obj.startsWith('custom:'),
        serialize: (obj: unknown) => `[Custom:${obj}]`
      };

      serializer.addStrategy(customStrategy);
      
      const result = serializer.serialize('custom:test');
      expect(result).toBe('[Custom:custom:test]');
    });
  });

  describe('Performance Optimization', () => {
    test('should cache serialization results', () => {
      const obj = { a: 1, b: 2 };
      
      const result1 = serializer.serialize(obj);
      const result2 = serializer.serialize(obj);
      
      expect(result1).toBe(result2);
    });

    test('should handle large objects efficiently', () => {
      const largeObj: any = {};
      for (let i = 0; i < 1000; i++) {
        largeObj[`key${i}`] = i;
      }
      
      const startTime = Date.now();
      const result = serializer.serialize(largeObj);
      const endTime = Date.now();
      
      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should handle repeated serialization', () => {
      const obj = { a: 1, b: 2 };
      
      for (let i = 0; i < 100; i++) {
        const result = serializer.serialize(obj);
        expect(result).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle serialization errors gracefully', () => {
      const problematicObj = {
        get circular() {
          return this;
        }
      };
      
      const result = serializer.serialize(problematicObj);
      expect(result).toBeDefined();
    });

    test('should handle undefined strategy', () => {
      const serializer = new AdaptiveSerializer(false, false);
      const result = serializer.serialize({ a: 1 });
      expect(result).toBeDefined();
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
        const result = serializer.serialize(obj);
        expect(result).toBeDefined();
      }
    });
  });

  describe('Configuration Options', () => {
    test('should work without cache', () => {
      const noCacheSerializer = new AdaptiveSerializer(false);
      const obj = { a: 1 };
      
      const result = noCacheSerializer.serialize(obj);
      expect(result).toBeDefined();
    });

    test('should work without metrics', () => {
      const noMetricsSerializer = new AdaptiveSerializer(true, false);
      const obj = { a: 1 };
      
      const result = noMetricsSerializer.serialize(obj);
      expect(result).toBeDefined();
    });
  });

  describe('Special Cases', () => {
    test('should handle empty objects and arrays', () => {
      expect(serializer.serialize({})).toBe('{}');
      expect(serializer.serialize([])).toBe('[]');
    });

    test('should handle objects with getters and setters', () => {
      const obj = {
        get computed() { return 'value'; },
        set computed(value: string) { /* setter */ }
      };
      
      const result = serializer.serialize(obj);
      expect(result).toBeDefined();
    });

    test('should handle non-enumerable properties', () => {
      const obj: any = { a: 1 };
      Object.defineProperty(obj, 'b', {
        value: 2,
        enumerable: false
      });
      
      const result = serializer.serialize(obj);
      expect(result).toBeDefined();
    });

    test('should handle deep nesting', () => {
      let deep: any = { value: 'deep' };
      for (let i = 0; i < 10; i++) {
        deep = { nested: deep };
      }
      
      const result = serializer.serialize(deep);
      expect(result).toBeDefined();
    });

    test('should handle prototype chains', () => {
      const proto = { inherited: 'value' };
      const obj = Object.create(proto);
      obj.own = 'property';
      
      const result = serializer.serialize(obj);
      expect(result).toBeDefined();
    });

    test('should handle symbol and numeric keys', () => {
      const obj: any = {
        [Symbol('sym')]: 'symbol value',
        123: 'numeric key'
      };
      
      const result = serializer.serialize(obj);
      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large strings', () => {
      const largeString = 'x'.repeat(10000);
      const result = serializer.serialize(largeString);
      expect(result).toBe(`"${largeString}"`);
    });

    test('should handle very large numbers', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      const result = serializer.serialize(largeNumber);
      expect(result).toBe(largeNumber.toString());
    });

    test('should handle very small numbers', () => {
      const smallNumber = Number.MIN_VALUE;
      const result = serializer.serialize(smallNumber);
      expect(result).toBe(smallNumber.toString());
    });

    test('should handle infinity and NaN', () => {
      expect(serializer.serialize(Infinity)).toBe('Infinity');
      expect(serializer.serialize(-Infinity)).toBe('-Infinity');
      expect(serializer.serialize(NaN)).toBe('NaN');
    });
  });
}); 
