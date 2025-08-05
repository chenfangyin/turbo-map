import { createEnhancedTurboMap } from '../src/index';

describe('Key Serialization Tests', () => {
  let turboMap: ReturnType<typeof createEnhancedTurboMap<any, any>>;

  beforeEach(() => {
    turboMap = createEnhancedTurboMap<any, any>();
  });

  afterEach(() => {
    turboMap.clear();
  });

  describe('Date Object Keys', () => {
    test('should treat Date objects with same timestamp as identical keys', () => {
      const timestamp = '2024-01-15T10:30:00.000Z';
      const date1 = new Date(timestamp);
      const date2 = new Date(timestamp);

      // Set value with first date instance
      turboMap.set(date1, 'date_value');

      // Should retrieve with different date instance having same timestamp
      expect(turboMap.get(date2)).toBe('date_value');
      expect(turboMap.get(date1)).toBe('date_value');
      
      // Verify they are treated as same key
      expect(turboMap.size).toBe(1);
    });

    test('should treat Date objects with different timestamps as different keys', () => {
      const date1 = new Date('2024-01-15T10:30:00.000Z');
      const date2 = new Date('2024-01-15T10:31:00.000Z'); // 1 minute later

      turboMap.set(date1, 'value1');
      turboMap.set(date2, 'value2');

      expect(turboMap.get(date1)).toBe('value1');
      expect(turboMap.get(date2)).toBe('value2');
      expect(turboMap.size).toBe(2);
    });

    test('should generate correct serialized keys for Date objects', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const expectedTimestamp = date.getTime(); // 1705314600000

      const serializedKey = turboMap.getSerializedKey(date);
      expect(serializedKey).toBe(`[Date:${expectedTimestamp}]`);
    });

    test('should handle edge case Date objects', () => {
      const invalidDate = new Date('invalid');
      const epoch = new Date(0);
      const futureDate = new Date('2099-12-31T23:59:59.999Z');

      // Invalid date
      turboMap.set(invalidDate, 'invalid');
      expect(turboMap.get(invalidDate)).toBe('invalid');

      // Epoch
      turboMap.set(epoch, 'epoch');
      expect(turboMap.get(epoch)).toBe('epoch');

      // Future date
      turboMap.set(futureDate, 'future');
      expect(turboMap.get(futureDate)).toBe('future');

      expect(turboMap.size).toBe(3);
    });
  });

  describe('Symbol Keys', () => {
    test('should treat different Symbol instances as unique keys even with same description', () => {
      const sym1 = Symbol('test');
      const sym2 = Symbol('test');

      turboMap.set(sym1, 'value1');
      turboMap.set(sym2, 'value2');

      expect(turboMap.get(sym1)).toBe('value1');
      expect(turboMap.get(sym2)).toBe('value2');
      expect(turboMap.size).toBe(2);
    });

    test('should treat global symbols with same key as identical', () => {
      const globalSym1 = Symbol.for('shared');
      const globalSym2 = Symbol.for('shared');

      turboMap.set(globalSym1, 'shared_value');

      expect(turboMap.get(globalSym2)).toBe('shared_value');
      expect(turboMap.get(globalSym1)).toBe('shared_value');
      expect(turboMap.size).toBe(1);
    });

    test('should generate unique serialized keys for different Symbol instances', () => {
      const sym1 = Symbol('test');
      const sym2 = Symbol('test');

      const key1 = turboMap.getSerializedKey(sym1);
      const key2 = turboMap.getSerializedKey(sym2);

      expect(key1).not.toBe(key2);
      expect(key1).toMatch(/^Symbol\.\d+\("test"\)$/);
      expect(key2).toMatch(/^Symbol\.\d+\("test"\)$/);
    });

    test('should generate identical serialized keys for global symbols', () => {
      const globalSym1 = Symbol.for('shared');
      const globalSym2 = Symbol.for('shared');

      const key1 = turboMap.getSerializedKey(globalSym1);
      const key2 = turboMap.getSerializedKey(globalSym2);

      expect(key1).toBe(key2);
      expect(key1).toBe('Symbol.for("shared")');
    });

    test('should handle symbols without description', () => {
      const sym1 = Symbol();
      const sym2 = Symbol();

      turboMap.set(sym1, 'value1');
      turboMap.set(sym2, 'value2');

      expect(turboMap.get(sym1)).toBe('value1');
      expect(turboMap.get(sym2)).toBe('value2');
      expect(turboMap.size).toBe(2);

      const key1 = turboMap.getSerializedKey(sym1);
      const key2 = turboMap.getSerializedKey(sym2);
      
      expect(key1).toMatch(/^Symbol\.\d+\("unnamed"\)$/);
      expect(key2).toMatch(/^Symbol\.\d+\("unnamed"\)$/);
      expect(key1).not.toBe(key2);
    });

    test('should handle mixed symbol types', () => {
      const regularSym = Symbol('regular');
      const globalSym = Symbol.for('global');
      const anotherRegularSym = Symbol('regular');
      const anotherGlobalSym = Symbol.for('global');

      turboMap.set(regularSym, 'regular1');
      turboMap.set(globalSym, 'global');
      turboMap.set(anotherRegularSym, 'regular2');

      // Regular symbols with same description should be different
      expect(turboMap.get(regularSym)).toBe('regular1');
      expect(turboMap.get(anotherRegularSym)).toBe('regular2');

      // Global symbols with same key should be identical
      expect(turboMap.get(globalSym)).toBe('global');
      expect(turboMap.get(anotherGlobalSym)).toBe('global');

      // Should have 3 unique keys total
      expect(turboMap.size).toBe(3);
    });
  });

  describe('Mixed Complex Keys', () => {
    test('should handle combination of Date and Symbol keys', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const sym = Symbol('test');
      const globalSym = Symbol.for('shared');

      turboMap.set(date, 'date_value');
      turboMap.set(sym, 'symbol_value');
      turboMap.set(globalSym, 'global_symbol_value');

      expect(turboMap.get(date)).toBe('date_value');
      expect(turboMap.get(sym)).toBe('symbol_value');
      expect(turboMap.get(globalSym)).toBe('global_symbol_value');
      expect(turboMap.size).toBe(3);
    });

    test('should maintain uniqueness across different key types', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const equivalentDate = new Date('2024-01-15T10:30:00.000Z');
      const sym1 = Symbol('test');
      const sym2 = Symbol('test');
      const globalSym1 = Symbol.for('shared');
      const globalSym2 = Symbol.for('shared');

      turboMap.set(date, 'date_value');
      turboMap.set(sym1, 'symbol1_value');
      turboMap.set(sym2, 'symbol2_value');
      turboMap.set(globalSym1, 'global_value');

      // Test equivalent instances
      expect(turboMap.get(equivalentDate)).toBe('date_value');
      expect(turboMap.get(globalSym2)).toBe('global_value');

      // Test unique instances
      expect(turboMap.get(sym1)).toBe('symbol1_value');
      expect(turboMap.get(sym2)).toBe('symbol2_value');

      // Should have 4 unique keys: 1 date + 2 regular symbols + 1 global symbol
      expect(turboMap.size).toBe(4);
    });
  });

  describe('Serialization Consistency', () => {
    test('should produce consistent serialization for same values', () => {
      const date1 = new Date('2024-01-15T10:30:00.000Z');
      const date2 = new Date('2024-01-15T10:30:00.000Z');
      const globalSym1 = Symbol.for('shared');
      const globalSym2 = Symbol.for('shared');

      // Multiple calls should produce same result
      expect(turboMap.getSerializedKey(date1)).toBe(turboMap.getSerializedKey(date1));
      expect(turboMap.getSerializedKey(date1)).toBe(turboMap.getSerializedKey(date2));
      expect(turboMap.getSerializedKey(globalSym1)).toBe(turboMap.getSerializedKey(globalSym2));
    });

    test('should increment symbol counter correctly', () => {
      const sym1 = Symbol('test');
      const sym2 = Symbol('test');
      const sym3 = Symbol('other');

      const key1 = turboMap.getSerializedKey(sym1);
      const key2 = turboMap.getSerializedKey(sym2);
      const key3 = turboMap.getSerializedKey(sym3);

      // Extract counter numbers from serialized keys
      const counter1 = parseInt(key1.match(/Symbol\.(\d+)/)?.[1] || '0');
      const counter2 = parseInt(key2.match(/Symbol\.(\d+)/)?.[1] || '0');
      const counter3 = parseInt(key3.match(/Symbol\.(\d+)/)?.[1] || '0');

      expect(counter2).toBe(counter1 + 1);
      expect(counter3).toBe(counter2 + 1);
    });
  });
});
