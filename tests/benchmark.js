import { createTurboMap } from '../dist/index.esm.js';

console.log('🚀 TurboMap 性能基准测试\n');

// 测试数据生成
function generateTestData(size) {
  const data = [];
  for (let i = 0; i < size; i++) {
    data.push([
      { id: i, name: `User${i}`, config: { theme: 'dark', lang: 'zh' } },
      `value_${i}`
    ]);
  }
  return data;
}

// 生成不同类型的测试数据
function generateComplexTestData(size) {
  const data = [];
  for (let i = 0; i < size; i++) {
    data.push([
      {
        id: i,
        user: {
          name: `User${i}`,
          profile: {
            age: 20 + (i % 50),
            preferences: {
              theme: i % 2 === 0 ? 'dark' : 'light',
              language: i % 3 === 0 ? 'zh-CN' : i % 3 === 1 ? 'en-US' : 'ja-JP',
              notifications: i % 2 === 0
            }
          }
        },
        session: {
          id: `session_${i}`,
          timestamp: Date.now() + i,
          metadata: {
            ip: `192.168.1.${i % 255}`,
            userAgent: `Mozilla/5.0 (Test ${i})`
          }
        }
      },
      `complex_value_${i}`
    ]);
  }
  return data;
}

// 改进的性能测试函数
function benchmark(name, fn, iterations = 1000, warmup = 100) {
  // 预热
  for (let i = 0; i < warmup; i++) {
    fn();
  }
  
  // 实际测试
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  
  const end = performance.now();
  const duration = end - start;
  const avgDuration = duration / iterations;
  const opsPerSecond = iterations / (duration / 1000);
  
  console.log(`${name}:`);
  console.log(`  总时间: ${duration.toFixed(2)}ms`);
  console.log(`  平均时间: ${avgDuration.toFixed(4)}ms`);
  console.log(`  操作次数: ${iterations}`);
  console.log(`  每秒操作: ${opsPerSecond.toFixed(0)} ops/s\n`);
  
  return { duration, avgDuration, opsPerSecond };
}

// 测试用例
function testSetOperations() {
  const map = createTurboMap();
  const testData = generateTestData(100);
  
  return () => {
    testData.forEach(([key, value]) => {
      map.set(key, value);
    });
  };
}

function testGetOperations() {
  const map = createTurboMap();
  const testData = generateTestData(100);
  
  // 先设置数据
  testData.forEach(([key, value]) => {
    map.set(key, value);
  });
  
  return () => {
    testData.forEach(([key]) => {
      map.get(key);
    });
  };
}

function testComplexObjectKeys() {
  const map = createTurboMap();
  
  return () => {
    const complexKey = {
      user: {
        id: Math.floor(Math.random() * 1000),
        profile: {
          name: 'Test User',
          preferences: {
            theme: 'dark',
            language: 'zh-CN',
            notifications: true
          }
        }
      },
      session: {
        id: Math.random().toString(36),
        timestamp: Date.now()
      }
    };
    
    map.set(complexKey, 'complex value');
    map.get(complexKey);
  };
}

// 新增：批量操作测试
function testBatchOperations() {
  const map = createTurboMap();
  const testData = generateTestData(100);
  
  return () => {
    map.setAll(testData);
    const keys = testData.map(([key]) => key);
    map.getAll(keys);
  };
}

// 新增：条件查找测试
function testConditionalSearch() {
  const map = createTurboMap();
  const testData = generateComplexTestData(50);
  
  // 先设置数据
  testData.forEach(([key, value]) => {
    map.set(key, value);
  });
  
  return () => {
    map.findByValue((value, key) => 
      value.includes('complex') && key.user.profile.preferences.theme === 'dark'
    );
  };
}

// 新增：插件性能测试
function testPluginPerformance() {
  const map = createTurboMap();
  
  // 添加性能监控插件
  const performancePlugin = {
    name: 'performance-monitor',
    beforeSet: (key, value) => ({ key, value }),
    afterGet: (key, value) => value
  };
  
  map.addPlugin(performancePlugin);
  const testData = generateTestData(50);
  
  return () => {
    testData.forEach(([key, value]) => {
      map.set(key, value);
    });
    testData.forEach(([key]) => {
      map.get(key);
    });
  };
}

// 新增：内存压力测试
function testMemoryPressure() {
  const map = createTurboMap({ 
    enableCache: true, 
    cacheMaxSize: 100,
    enableAutoCleanup: true,
    cleanupInterval: 100
  });
  
  return () => {
    // 添加大量数据
    for (let i = 0; i < 200; i++) {
      const key = { 
        id: i, 
        data: Array.from({ length: 100 }, (_, j) => j),
        timestamp: Date.now()
      };
      map.set(key, `value_${i}`);
    }
    
    // 删除部分数据
    for (let i = 0; i < 100; i++) {
      map.delete({ id: i, data: Array.from({ length: 100 }, (_, j) => j), timestamp: Date.now() });
    }
    
    // 手动优化内存
    map.optimizeMemory();
  };
}

function testMemoryUsage() {
  const map = createTurboMap({ enableCache: true, cacheMaxSize: 1000 });
  const testData = generateTestData(500);
  
  // 填充数据
  testData.forEach(([key, value]) => {
    map.set(key, value);
  });
  
  const initialMemory = map.estimateMemoryUsage();
  console.log(`初始内存使用: ${(initialMemory / 1024).toFixed(2)}KB`);
  
  // 执行一些操作
  for (let i = 0; i < 1000; i++) {
    const randomKey = testData[Math.floor(Math.random() * testData.length)][0];
    map.get(randomKey);
  }
  
  const finalMemory = map.estimateMemoryUsage();
  console.log(`最终内存使用: ${(finalMemory / 1024).toFixed(2)}KB`);
  console.log(`内存增长: ${((finalMemory - initialMemory) / 1024).toFixed(2)}KB\n`);
  
  return { initialMemory, finalMemory, growth: finalMemory - initialMemory };
}

function testCachePerformance() {
  const mapWithCache = createTurboMap({ enableCache: true, cacheMaxSize: 1000 });
  const mapWithoutCache = createTurboMap({ enableCache: false });
  const testData = generateTestData(100);
  
  // 设置数据
  testData.forEach(([key, value]) => {
    mapWithCache.set(key, value);
    mapWithoutCache.set(key, value);
  });
  
  console.log('缓存性能对比:');
  
  // 测试有缓存的性能
  const withCache = benchmark('有缓存', () => {
    testData.forEach(([key]) => {
      mapWithCache.get(key);
    });
  }, 1000);
  
  // 测试无缓存的性能
  const withoutCache = benchmark('无缓存', () => {
    testData.forEach(([key]) => {
      mapWithoutCache.get(key);
    });
  }, 1000);
  
  const improvement = ((withoutCache.avgDuration - withCache.avgDuration) / withoutCache.avgDuration * 100);
  console.log(`性能提升: ${improvement.toFixed(2)}%\n`);
  
  return { withCache, withoutCache, improvement };
}

// 新增：错误处理性能测试
function testErrorHandlingPerformance() {
  const map = createTurboMap({ strictMode: false });
  
  return () => {
    // 测试包含函数的对象（宽松模式）
    const funcKey = { id: 1, func: () => {} };
    try {
      map.set(funcKey, 'test');
    } catch (error) {
      // 忽略错误
    }
    
    // 测试包含 Symbol 的对象
    const symbolKey = { id: 2, sym: Symbol('test') };
    try {
      map.set(symbolKey, 'test');
    } catch (error) {
      // 忽略错误
    }
  };
}

// 新增：并发性能测试
function testConcurrentPerformance() {
  const map = createTurboMap({ enableCache: true });
  const testData = generateTestData(100);
  
  // 先设置数据
  testData.forEach(([key, value]) => {
    map.set(key, value);
  });
  
  return () => {
    // 模拟并发访问
    const promises = testData.map(([key]) => 
      Promise.resolve().then(() => map.get(key))
    );
    return Promise.all(promises);
  };
}

// 运行基准测试
console.log('=== 基础操作性能测试 ===');
benchmark('设置操作', testSetOperations(), 1000);
benchmark('获取操作', testGetOperations(), 1000);
benchmark('复杂对象键操作', testComplexObjectKeys(), 500);

console.log('=== 高级功能性能测试 ===');
benchmark('批量操作', testBatchOperations(), 500);
benchmark('条件查找', testConditionalSearch(), 300);
benchmark('插件性能', testPluginPerformance(), 500);
benchmark('内存压力测试', testMemoryPressure(), 200);

console.log('=== 内存使用测试 ===');
testMemoryUsage();

console.log('=== 缓存性能测试 ===');
testCachePerformance();

console.log('=== 错误处理性能测试 ===');
benchmark('错误处理', testErrorHandlingPerformance(), 500);

console.log('=== 并发性能测试 ===');
benchmark('并发访问', testConcurrentPerformance(), 300);

console.log('✅ 基准测试完成！');
