import { AdaptiveSerializer } from '../../src/turboMap/core/Serializer';

describe('AdaptiveSerializer', () => {
  let serializer: AdaptiveSerializer;

  beforeEach(() => {
    serializer = new AdaptiveSerializer(false, false); // Disable cache and metrics for predictable testing
  });

  describe('Symbol Serialization', () => {
    test('should serialize different Symbol instances consistently (user requirement)', () => {
      const sym1 = Symbol('test');
      const sym2 = Symbol('test');

      const result1 = serializer.serialize(sym1);
      const result2 = serializer.serialize(sym2);

      // 用户需求：所有普通 Symbol() 都序列化为相同字符串
      expect(result1).toBe(result2);
      expect(result1).toBe('Symbol()');
      expect(result2).toBe('Symbol()');
    });

    test('should serialize global symbols consistently', () => {
      const globalSym1 = Symbol.for('shared');
      const globalSym2 = Symbol.for('shared');

      const result1 = serializer.serialize(globalSym1);
      const result2 = serializer.serialize(globalSym2);

      expect(result1).toBe(result2);
      expect(result1).toBe('Symbol.for("shared")');
    });

    test('should handle symbols without description', () => {
      const sym = Symbol();
      const result = serializer.serialize(sym);

      // 用户需求：所有普通 Symbol() 都序列化为相同字符串
      expect(result).toBe('Symbol()');
    });

    test('should serialize all regular symbols consistently', () => {
      const sym1 = Symbol('first');
      const sym2 = Symbol('second');
      const sym3 = Symbol('third');

      const result1 = serializer.serialize(sym1);
      const result2 = serializer.serialize(sym2);
      const result3 = serializer.serialize(sym3);

      // 用户需求：所有普通 Symbol() 都序列化为相同字符串
      expect(result1).toBe('Symbol()');
      expect(result2).toBe('Symbol()');
      expect(result3).toBe('Symbol()');
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    test('should return same serialization for same symbol instance', () => {
      const sym = Symbol('test');
      
      const result1 = serializer.serialize(sym);
      const result2 = serializer.serialize(sym);

      expect(result1).toBe(result2);
    });
  });

  describe('Date Serialization', () => {
    test('should serialize dates based on timestamp', () => {
      const date1 = new Date('2024-01-15T10:30:00.000Z');
      const date2 = new Date('2024-01-15T10:30:00.000Z');
      const timestamp = date1.getTime();

      const result1 = serializer.serialize(date1);
      const result2 = serializer.serialize(date2);

      expect(result1).toBe(result2);
      expect(result1).toBe(`[Date:${timestamp}]`);
    });

    test('should handle invalid dates', () => {
      const invalidDate = new Date('invalid');
      const result = serializer.serialize(invalidDate);

      expect(result).toMatch(/^\[Date:NaN\]$/);
    });

    test('should handle edge case dates', () => {
      const epoch = new Date(0);
      const futureDate = new Date('2099-12-31T23:59:59.999Z');

      const epochResult = serializer.serialize(epoch);
      const futureResult = serializer.serialize(futureDate);

      expect(epochResult).toBe('[Date:0]');
      expect(futureResult).toBe(`[Date:${futureDate.getTime()}]`);
    });
  });

  describe('Primitive Types', () => {
    test('should serialize null and undefined', () => {
      expect(serializer.serialize(null)).toBe('null');
      expect(serializer.serialize(undefined)).toBe('undefined');
    });

    test('should serialize strings', () => {
      expect(serializer.serialize('hello')).toBe('"hello"');
      expect(serializer.serialize('')).toBe('""');
    });

    test('should serialize numbers', () => {
      expect(serializer.serialize(42)).toBe('42');
      expect(serializer.serialize(0)).toBe('0');
      expect(serializer.serialize(-1)).toBe('-1');
      expect(serializer.serialize(3.14)).toBe('3.14');
      expect(serializer.serialize(NaN)).toBe('NaN');
      expect(serializer.serialize(Infinity)).toBe('Infinity');
      expect(serializer.serialize(-Infinity)).toBe('-Infinity');
    });

    test('should serialize booleans', () => {
      expect(serializer.serialize(true)).toBe('true');
      expect(serializer.serialize(false)).toBe('false');
    });

    test('should serialize bigint', () => {
      expect(serializer.serialize(123n)).toBe('123n');
      expect(serializer.serialize(0n)).toBe('0n');
    });
  });

  describe('Complex Objects', () => {
    test('should serialize simple objects', () => {
      const obj = { b: 2, a: 1 }; // Keys will be sorted
      const result = serializer.serialize(obj);
      expect(result).toBe('{"a":1,"b":2}');
    });

    test('should serialize arrays', () => {
      const arr = [1, 2, 'three'];
      const result = serializer.serialize(arr);
      expect(result).toBe('[1,2,"three"]');
    });

    test('should handle functions', () => {
      const func = function namedFunc() { return 42; };
      const result = serializer.serialize(func);
      expect(result).toMatch(/^\[Function:namedFunc:\d+\]$/);
    });

    test('should handle RegExp', () => {
      const regex = /test/gi;
      const result = serializer.serialize(regex);
      expect(result).toBe('[RegExp:/test/gi]');
    });

    test('should handle Error objects', () => {
      const error = new Error('Test error');
      const result = serializer.serialize(error);
      expect(result).toBe('[Error:Error:Test error]');
    });
  });

  describe('Cache Management', () => {
    test('should maintain consistent symbol serialization after cache clear', () => {
      const sym1 = Symbol('test');
      const result1 = serializer.serialize(sym1);
      
      // Clear cache
      serializer.clearCache();
      
      // After clearing, symbols should still serialize consistently
      const sym2 = Symbol('test');
      const result2 = serializer.serialize(sym2);
      
      // 用户需求：所有普通 Symbol() 都序列化为相同字符串
      expect(result1).toBe('Symbol()');
      expect(result2).toBe('Symbol()');
      expect(result1).toBe(result2);
    });
  });

  describe('Fallback Handling', () => {
    test('should use fallback serialization for complex circular objects', () => {
      const obj: any = { a: 1 };
      obj.self = obj; // Create circular reference

      const result = serializer.serialize(obj);
      
      // Should handle circular reference gracefully
      expect(result).toContain('Circular');
    });

    test('should handle deeply nested objects', () => {
      // Create a deeply nested object
      let deepObj: any = {};
      let current = deepObj;
      for (let i = 0; i < 100; i++) {
        current.next = {};
        current = current.next;
      }
      current.value = 'deep';

      const result = serializer.serialize(deepObj);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
