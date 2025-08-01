import { TypeUtils } from '../../src/turboMap/utils/TypeUtils';

describe('TypeUtils', () => {
  describe('isPrimitive', () => {
    test('should identify primitive values', () => {
      expect(TypeUtils.isPrimitive(42)).toBe(true);
      expect(TypeUtils.isPrimitive('hello')).toBe(true);
      expect(TypeUtils.isPrimitive(true)).toBe(true);
      expect(TypeUtils.isPrimitive(false)).toBe(true);
      expect(TypeUtils.isPrimitive(null)).toBe(true);
      expect(TypeUtils.isPrimitive(undefined)).toBe(true);
      expect(TypeUtils.isPrimitive(Symbol('test'))).toBe(true);
      expect(TypeUtils.isPrimitive(BigInt(123))).toBe(true);
    });

    test('should identify non-primitive values', () => {
      expect(TypeUtils.isPrimitive({})).toBe(false);
      expect(TypeUtils.isPrimitive([])).toBe(false);
      expect(TypeUtils.isPrimitive(() => {})).toBe(false);
      expect(TypeUtils.isPrimitive(new Date())).toBe(false);
      expect(TypeUtils.isPrimitive(new Map())).toBe(false);
      expect(TypeUtils.isPrimitive(new Set())).toBe(false);
    });
  });

  describe('isSimpleObject', () => {
    test('should identify simple objects', () => {
      expect(TypeUtils.isSimpleObject({})).toBe(true);
      expect(TypeUtils.isSimpleObject({ a: 1, b: 2 })).toBe(true);
      expect(TypeUtils.isSimpleObject({ nested: { value: 1 } })).toBe(true);
    });

    test('should identify non-simple objects', () => {
      expect(TypeUtils.isSimpleObject([])).toBe(false);
      expect(TypeUtils.isSimpleObject(() => {})).toBe(false);
      expect(TypeUtils.isSimpleObject(new Date())).toBe(false);
      expect(TypeUtils.isSimpleObject(new Map())).toBe(false);
      expect(TypeUtils.isSimpleObject(new Set())).toBe(false);
      expect(TypeUtils.isSimpleObject(null)).toBe(false);
      expect(TypeUtils.isSimpleObject(undefined)).toBe(false);
      expect(TypeUtils.isSimpleObject(42)).toBe(false);
      expect(TypeUtils.isSimpleObject('string')).toBe(false);
    });

    test('should handle objects with functions', () => {
      const objWithFunc = { a: 1, b: () => {} };
      expect(TypeUtils.isSimpleObject(objWithFunc)).toBe(false);
    });

    test('should handle objects with getters/setters', () => {
      const objWithGetter = {
        get value() { return 1; }
      };
      expect(TypeUtils.isSimpleObject(objWithGetter)).toBe(false);
    });
  });

  describe('getObjectSignature', () => {
    test('should generate signatures for simple objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 2, a: 1 };
      const obj3 = { a: 1, b: 3 };

      const sig1 = TypeUtils.getObjectSignature(obj1);
      const sig2 = TypeUtils.getObjectSignature(obj2);
      const sig3 = TypeUtils.getObjectSignature(obj3);

      expect(sig1).toBe(sig2); // Same properties, different order
      expect(sig1).not.toBe(sig3); // Different values
    });

    test('should handle nested objects', () => {
      const nested1 = { a: { b: 1, c: 2 } };
      const nested2 = { a: { c: 2, b: 1 } };
      const nested3 = { a: { b: 1, c: 3 } };

      const sig1 = TypeUtils.getObjectSignature(nested1);
      const sig2 = TypeUtils.getObjectSignature(nested2);
      const sig3 = TypeUtils.getObjectSignature(nested3);

      expect(sig1).toBe(sig2);
      expect(sig1).not.toBe(sig3);
    });

    test('should handle arrays', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const arr3 = [1, 2, 4];

      const sig1 = TypeUtils.getObjectSignature(arr1);
      const sig2 = TypeUtils.getObjectSignature(arr2);
      const sig3 = TypeUtils.getObjectSignature(arr3);

      expect(sig1).toBe(sig2);
      expect(sig1).not.toBe(sig3);
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

      const signature = TypeUtils.getObjectSignature(mixed);
      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
    });
  });

  describe('safeAccess', () => {
    test('should safely access object properties', () => {
      const obj = { a: { b: { c: 1 } } };
      
      expect(TypeUtils.safeAccess(obj, () => obj.a.b.c, undefined)).toBe(1);
      expect(TypeUtils.safeAccess(obj, () => (obj.a.b as any).d, 'default')).toBe('default');
      expect(TypeUtils.safeAccess(obj, () => (obj as any).x.y.z, 'fallback')).toBe('fallback');
    });

    test('should handle null and undefined objects', () => {
      expect(TypeUtils.safeAccess(null, () => (null as any).property, 'default')).toBe('default');
      expect(TypeUtils.safeAccess(undefined, () => (undefined as any).property, 'default')).toBe('default');
    });

    test('should handle non-objects', () => {
      expect(TypeUtils.safeAccess(42, () => (42 as any).property, 'default')).toBe('default');
      expect(TypeUtils.safeAccess('string', () => ('string' as any).property, 'default')).toBe('default');
      expect(TypeUtils.safeAccess(true, () => (true as any).property, 'default')).toBe('default');
    });

    test('should handle complex nested access', () => {
      const complex = {
        level1: {
          level2: {
            level3: {
              data: [1, 2, 3],
              metadata: { timestamp: Date.now() }
            }
          }
        }
      };

      expect(TypeUtils.safeAccess(complex, () => complex.level1.level2.level3.data, [])).toEqual([1, 2, 3]);
      expect(TypeUtils.safeAccess(complex, () => complex.level1.level2.level3.metadata.timestamp, 0)).toBeDefined();
    });

    test('should handle accessor functions that throw', () => {
      const obj = { a: 1 };
      
      expect(TypeUtils.safeAccess(obj, () => {
        throw new Error('Access error');
      }, 'fallback')).toBe('fallback');
    });
  });

  describe('isSerializable', () => {
    test('should identify serializable values', () => {
      expect(TypeUtils.isSerializable(42)).toBe(true);
      expect(TypeUtils.isSerializable('string')).toBe(true);
      expect(TypeUtils.isSerializable(true)).toBe(true);
      expect(TypeUtils.isSerializable(null)).toBe(true);
      expect(TypeUtils.isSerializable({ a: 1 })).toBe(true);
      expect(TypeUtils.isSerializable([1, 2, 3])).toBe(true);
    });

    test('should identify non-serializable values', () => {
      expect(TypeUtils.isSerializable(() => {})).toBe(false);
      expect(TypeUtils.isSerializable(Symbol('test'))).toBe(false);
      expect(TypeUtils.isSerializable(undefined)).toBe(false);
    });

    test('should handle circular references', () => {
      const circular: any = { a: 1 };
      circular.self = circular;
      
      expect(TypeUtils.isSerializable(circular)).toBe(false);
    });

    test('should handle nested structures', () => {
      const nested = {
        a: 1,
        b: [2, 3, { c: 4 }],
        d: { e: 5, f: [6, 7] }
      };
      
      expect(TypeUtils.isSerializable(nested)).toBe(true);
    });

    test('should handle objects with functions', () => {
      const withFunction = {
        a: 1,
        b: () => {}
      };
      
      expect(TypeUtils.isSerializable(withFunction)).toBe(false);
    });
  });
}); 
