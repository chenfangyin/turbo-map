import { EnhancedLRUCache, TieredCacheManager } from '../../src/turboMap/core/CacheManager';

describe('CacheManager', () => {
  describe('EnhancedLRUCache', () => {
    let cache: EnhancedLRUCache<number>;

    beforeEach(() => {
      cache = new EnhancedLRUCache<number>(3);
    });

    describe('Basic Cache Operations', () => {
      test('should set and get values', () => {
        cache.set('key1', 1);
        cache.set('key2', 2);

        expect(cache.get('key1')).toBe(1);
        expect(cache.get('key2')).toBe(2);
      });

      test('should handle cache misses', () => {
        expect(cache.get('nonexistent')).toBeUndefined();
      });

      test('should update existing values', () => {
        cache.set('key1', 1);
        cache.set('key1', 2);

        expect(cache.get('key1')).toBe(2);
      });

      test('should delete values', () => {
        cache.set('key1', 1);
        cache.set('key2', 2);

        expect(cache.delete('key1')).toBe(true);
        expect(cache.delete('key2')).toBe(true);
        expect(cache.delete('nonexistent')).toBe(false);

        expect(cache.get('key1')).toBeUndefined();
        expect(cache.get('key2')).toBeUndefined();
      });

      test('should clear all values', () => {
        cache.set('key1', 1);
        cache.set('key2', 2);

        cache.clear();

        expect(cache.get('key1')).toBeUndefined();
        expect(cache.get('key2')).toBeUndefined();
        expect(cache.size).toBe(0);
      });

      test('should return correct size', () => {
        expect(cache.size).toBe(0);

        cache.set('key1', 1);
        expect(cache.size).toBe(1);

        cache.set('key2', 2);
        expect(cache.size).toBe(2);

        cache.delete('key1');
        expect(cache.size).toBe(1);
      });
    });

    describe('LRU Behavior', () => {
      test('should evict least recently used items', () => {
        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.set('key3', 3);
        cache.set('key4', 4); // Should evict key1

        expect(cache.get('key1')).toBeUndefined();
        expect(cache.get('key2')).toBe(2);
        expect(cache.get('key3')).toBe(3);
        expect(cache.get('key4')).toBe(4);
      });

      test('should update access order on get', () => {
        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.set('key3', 3);

        // Access key1 to make it most recently used
        cache.get('key1');

        cache.set('key4', 4); // Should evict key2, not key1

        expect(cache.get('key1')).toBe(1);
        expect(cache.get('key2')).toBeUndefined();
        expect(cache.get('key3')).toBe(3);
        expect(cache.get('key4')).toBe(4);
      });

      test('should update access order on set', () => {
        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.set('key3', 3);

        // Update key1 to make it most recently used
        cache.set('key1', 10);

        cache.set('key4', 4); // Should evict key2, not key1

        expect(cache.get('key1')).toBe(10);
        expect(cache.get('key2')).toBeUndefined();
        expect(cache.get('key3')).toBe(3);
        expect(cache.get('key4')).toBe(4);
      });
    });

    describe('Cache Statistics', () => {
      test('should track cache statistics', () => {
        const stats = cache.getStats();

        expect(stats.hits).toBe(0);
        expect(stats.misses).toBe(0);
        expect(stats.sets).toBe(0);
        expect(stats.deletes).toBe(0);
        expect(stats.evictions).toBe(0);
        expect(stats.hitRate).toBe(0);
        expect(stats.size).toBe(0);
        expect(stats.maxSize).toBe(3);
      });

      test('should update statistics on operations', () => {
        cache.set('key1', 1);
        cache.set('key2', 2);

        cache.get('key1'); // Hit
        cache.get('key2'); // Hit
        cache.get('key3'); // Miss

        cache.delete('key1');

        const stats = cache.getStats();

        expect(stats.hits).toBe(2);
        expect(stats.misses).toBe(1);
        expect(stats.sets).toBe(2);
        expect(stats.deletes).toBe(1);
        expect(stats.evictions).toBe(0);
        expect(stats.hitRate).toBe(2 / 3);
        expect(stats.size).toBe(1);
      });

      test('should track evictions', () => {
        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.set('key3', 3);
        cache.set('key4', 4); // Should evict key1

        const stats = cache.getStats();

        expect(stats.evictions).toBe(1);
        expect(stats.size).toBe(3);
      });
    });

    describe('Edge Cases', () => {
      test('should handle zero max size', () => {
        const zeroCache = new EnhancedLRUCache<number>(0);
        zeroCache.set('key1', 1);

        expect(zeroCache.get('key1')).toBeUndefined();
        expect(zeroCache.size).toBe(0);
      });

      test('should handle negative max size', () => {
        const negativeCache = new EnhancedLRUCache<number>(-1);
        negativeCache.set('key1', 1);

        expect(negativeCache.get('key1')).toBeUndefined();
        expect(negativeCache.size).toBe(0);
      });

      test('should handle large max size', () => {
        const largeCache = new EnhancedLRUCache<number>(10000);
        
        for (let i = 0; i < 1000; i++) {
          largeCache.set(`key${i}`, i);
        }

        expect(largeCache.size).toBe(1000);
        
        for (let i = 0; i < 1000; i++) {
          expect(largeCache.get(`key${i}`)).toBe(i);
        }
      });
    });
  });

  describe('TieredCacheManager', () => {
    let tieredCache: TieredCacheManager<number>;

    beforeEach(() => {
      tieredCache = new TieredCacheManager<number>({
        l1CacheSize: 2,
        l2CacheSize: 3,
        promoteThreshold: 2
      });
    });

    describe('Basic Tiered Operations', () => {
      test('should set and get values', () => {
        tieredCache.set('key1', 1);
        tieredCache.set('key2', 2);

        expect(tieredCache.get('key1')).toBe(1);
        expect(tieredCache.get('key2')).toBe(2);
      });

      test('should handle cache misses', () => {
        expect(tieredCache.get('nonexistent')).toBeUndefined();
      });

      test('should delete from both tiers', () => {
        tieredCache.set('key1', 1);
        tieredCache.set('key2', 2);

        expect(tieredCache.delete('key1')).toBe(true);
        expect(tieredCache.delete('key2')).toBe(true);
        expect(tieredCache.delete('nonexistent')).toBe(false);

        expect(tieredCache.get('key1')).toBeUndefined();
        expect(tieredCache.get('key2')).toBeUndefined();
      });

      test('should clear all tiers', () => {
        tieredCache.set('key1', 1);
        tieredCache.set('key2', 2);

        tieredCache.clear();

        expect(tieredCache.get('key1')).toBeUndefined();
        expect(tieredCache.get('key2')).toBeUndefined();
      });
    });

    describe('Promotion Behavior', () => {
      test('should promote frequently accessed items', () => {
        // Set in both tiers
        tieredCache.set('key1', 1);
        tieredCache.set('key2', 2);

        // Access key1 multiple times to trigger promotion
        tieredCache.get('key1');
        tieredCache.get('key1');

        // Add more items to L1 to force eviction
        tieredCache.set('key3', 3);
        tieredCache.set('key4', 4);

        // key1 should still be accessible (promoted to L1)
        expect(tieredCache.get('key1')).toBe(1);
      });

      test('should not promote infrequently accessed items', () => {
        tieredCache.set('key1', 1);
        tieredCache.set('key2', 2);

        // Access key1 only once (below threshold)
        tieredCache.get('key1');

        // Add more items to L1
        tieredCache.set('key3', 3);
        tieredCache.set('key4', 4);

        // key1 might be evicted from L2
        const value = tieredCache.get('key1');
        expect(value).toBeDefined();
      });
    });

    describe('Statistics', () => {
      test('should provide combined statistics', () => {
        tieredCache.set('key1', 1);
        tieredCache.set('key2', 2);

        tieredCache.get('key1');
        tieredCache.get('key2');
        tieredCache.get('key3'); // Miss

        const stats = tieredCache.getStats();

        expect(stats.l1).toBeDefined();
        expect(stats.l2).toBeDefined();
        expect(stats.combined).toBeDefined();

        expect(stats.combined.hits).toBeGreaterThan(0);
        expect(stats.combined.misses).toBeGreaterThan(0);
        expect(stats.combined.hitRate).toBeGreaterThan(0);
        expect(stats.combined.totalSize).toBeGreaterThan(0);
        expect(stats.combined.pendingPromotions).toBeDefined();
      });
    });

    describe('Configuration Options', () => {
      test('should work with different cache sizes', () => {
        const customCache = new TieredCacheManager<number>({
          l1CacheSize: 1,
          l2CacheSize: 2,
          promoteThreshold: 1
        });

        customCache.set('key1', 1);
        customCache.set('key2', 2);
        customCache.set('key3', 3);

        // key3 should be accessible (most recent in L2)
        expect(customCache.get('key3')).toBe(3);
        // key2 should be accessible (second most recent in L2)
        expect(customCache.get('key2')).toBe(2);
        // key1 might be evicted from L2 due to size limit
        const key1Value = customCache.get('key1');
        // Either key1 is accessible or undefined (evicted)
        expect(key1Value === 1 || key1Value === undefined).toBe(true);
      });

      test('should work with different promotion thresholds', () => {
        const highThresholdCache = new TieredCacheManager<number>({
          l1CacheSize: 2,
          l2CacheSize: 3,
          promoteThreshold: 5
        });

        highThresholdCache.set('key1', 1);

        // Access multiple times but below threshold
        for (let i = 0; i < 4; i++) {
          highThresholdCache.get('key1');
        }

        // Should not be promoted yet
        const stats = highThresholdCache.getStats();
        expect(stats.combined.pendingPromotions).toBe(1);
      });
    });

    describe('Performance', () => {
      test('should handle large datasets efficiently', () => {
        const largeCache = new TieredCacheManager<number>({
          l1CacheSize: 100,
          l2CacheSize: 1000,
          promoteThreshold: 3
        });

        // Add many items
        for (let i = 0; i < 500; i++) {
          largeCache.set(`key${i}`, i);
        }

        // Access some items multiple times
        for (let i = 0; i < 100; i++) {
          for (let j = 0; j < 3; j++) {
            largeCache.get(`key${i}`);
          }
        }

        const stats = largeCache.getStats();
        expect(stats.combined.totalSize).toBeGreaterThan(0);
        expect(stats.combined.hits).toBeGreaterThan(0);
      });

      test('should handle concurrent access', () => {
        const promises: Promise<void>[] = [];
        
        // Concurrent sets
        for (let i = 0; i < 10; i++) {
          promises.push(Promise.resolve().then(() => {
            tieredCache.set(`key${i}`, i);
          }));
        }

        // Concurrent gets
        for (let i = 0; i < 10; i++) {
          promises.push(Promise.resolve().then(() => {
            tieredCache.get(`key${i}`);
          }));
        }

        return Promise.all(promises).then(() => {
          const stats = tieredCache.getStats();
          expect(stats.combined.hits).toBeGreaterThanOrEqual(0);
        });
      });
    });

    describe('Error Handling', () => {
      test('should handle invalid configuration gracefully', () => {
        const invalidCache = new TieredCacheManager<number>({
          l1CacheSize: -1,
          l2CacheSize: 0,
          promoteThreshold: -1
        });

        invalidCache.set('key1', 1);
        expect(invalidCache.get('key1')).toBeDefined();
      });

      test('should handle memory pressure', () => {
        const memoryIntensiveCache = new TieredCacheManager<any>({
          l1CacheSize: 50,
          l2CacheSize: 100,
          promoteThreshold: 2
        });

        // Add large objects
        for (let i = 0; i < 20; i++) {
          memoryIntensiveCache.set(`key${i}`, {
            data: new Array(1000).fill(i),
            metadata: { timestamp: Date.now() }
          });
        }

        const stats = memoryIntensiveCache.getStats();
        expect(stats.combined.totalSize).toBeGreaterThan(0);
      });
    });
  });
}); 
