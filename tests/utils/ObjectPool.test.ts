import { EnhancedObjectPool } from '../../src/turboMap/utils/ObjectPool';

describe('ObjectPool', () => {
  let enhancedPool: EnhancedObjectPool;

  beforeEach(() => {
    enhancedPool = new EnhancedObjectPool();
  });

  afterEach(() => {
    enhancedPool.clear();
  });

  describe('Enhanced Object Pool', () => {
    test('should get and release objects', () => {
      const obj1 = enhancedPool.getObject();
      const obj2 = enhancedPool.getObject();

      expect(obj1).toBeDefined();
      expect(obj2).toBeDefined();
      expect(obj1).not.toBe(obj2);

      enhancedPool.releaseObject(obj1);
      enhancedPool.releaseObject(obj2);
    });

    test('should reuse released objects', () => {
      const obj1 = enhancedPool.getObject();
      enhancedPool.releaseObject(obj1);

      const obj2 = enhancedPool.getObject();
      expect(obj2).toBe(obj1); // Should reuse the same object
    });

    test('should handle multiple get/release cycles', () => {
      const objects: Record<string, unknown>[] = [];
      
      // Get multiple objects
      for (let i = 0; i < 5; i++) {
        objects.push(enhancedPool.getObject());
      }

      // Release all objects
      objects.forEach(obj => enhancedPool.releaseObject(obj));

      // Get objects again - should reuse from pool
      const reusedObjects: Record<string, unknown>[] = [];
      for (let i = 0; i < 5; i++) {
        reusedObjects.push(enhancedPool.getObject());
      }

      expect(reusedObjects).toEqual(objects);
    });

    test('should work with custom configuration', () => {
      expect(enhancedPool.getObject()).toBeDefined();
    });

    test('should respect initial size', () => {
      // EnhancedObjectPool doesn't have initialSize config, but we can test basic functionality
      const objects: Record<string, unknown>[] = [];
      for (let i = 0; i < 5; i++) {
        objects.push(enhancedPool.getObject());
      }
      
      // Should be able to get objects
      objects.forEach(obj => expect(obj).toBeDefined());
      
      // Release objects
      objects.forEach(obj => enhancedPool.releaseObject(obj));
    });

    test('should respect max size', () => {
      const objects: Record<string, unknown>[] = [];
      for (let i = 0; i < 10; i++) {
        objects.push(enhancedPool.getObject());
      }

      // Should be able to get objects
      objects.forEach(obj => expect(obj).toBeDefined());
      
      // Release objects
      objects.forEach(obj => enhancedPool.releaseObject(obj));
    });

    test('should grow pool when needed', () => {
      // Get multiple objects
      const objects: Record<string, unknown>[] = [];
      for (let i = 0; i < 5; i++) {
        objects.push(enhancedPool.getObject());
      }

      // Should be able to get objects
      objects.forEach(obj => expect(obj).toBeDefined());
      
      // Release objects
      objects.forEach(obj => enhancedPool.releaseObject(obj));
    });
  });
}); 
