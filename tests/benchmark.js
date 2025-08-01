#!/usr/bin/env node

import { createEnhancedTurboMap } from '../dist/index.esm.js';
import { performance } from 'perf_hooks';

console.log('🚀 Turbo Map 性能基准测试\n');

// 测试数据生成
function generateTestData(size) {
  const data = [];
  for (let i = 0; i < size; i++) {
    data.push([
      { id: i, name: `item-${i}`, nested: { value: i * 2 } },
      `value-${i}`
    ]);
  }
  return data;
}

// 基准测试函数
function benchmark(name, fn, iterations = 1000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  const duration = end - start;
  const avg = duration / iterations;
  
  console.log(`${name}:`);
  console.log(`  总时间: ${duration.toFixed(2)}ms`);
  console.log(`  平均时间: ${avg.toFixed(4)}ms`);
  console.log(`  操作/秒: ${(iterations / (duration / 1000)).toFixed(0)}`);
  console.log('');
  
  return { duration, avg, opsPerSec: iterations / (duration / 1000) };
}

// 测试用例
function runBenchmarks() {
  const testSizes = [100, 1000, 10000];
  
  for (const size of testSizes) {
    console.log(`📊 测试数据大小: ${size} 项\n`);
    
    const testData = generateTestData(size);
    
    // 创建 TurboMap
    const turboMap = createEnhancedTurboMap();
    
    // 测试 1: 插入性能
    benchmark(`插入 ${size} 项`, () => {
      const map = createEnhancedTurboMap();
      for (const [key, value] of testData) {
        map.set(key, value);
      }
    });
    
    // 测试 2: 查找性能
    const map = createEnhancedTurboMap();
    for (const [key, value] of testData) {
      map.set(key, value);
    }
    
    benchmark(`查找 ${size} 项`, () => {
      for (const [key] of testData) {
        map.get(key);
      }
    });
    
    // 测试 3: 删除性能
    benchmark(`删除 ${size} 项`, () => {
      const map = createEnhancedTurboMap();
      for (const [key, value] of testData) {
        map.set(key, value);
      }
      for (const [key] of testData) {
        map.delete(key);
      }
    });
    
    // 测试 4: 迭代性能
    benchmark(`迭代 ${size} 项`, () => {
      const map = createEnhancedTurboMap();
      for (const [key, value] of testData) {
        map.set(key, value);
      }
      for (const [key, value] of map) {
        // 模拟处理
        const _ = key.id + value.length;
      }
    });
    
    console.log('─'.repeat(50));
    console.log('');
  }
}

// 与原生 Map 对比
function compareWithNativeMap() {
  console.log('🔄 与原生 Map 对比测试\n');
  
  const size = 1000;
  const testData = generateTestData(size);
  
  // TurboMap 测试
  const turboResults = benchmark('TurboMap 插入', () => {
    const map = createEnhancedTurboMap();
    for (const [key, value] of testData) {
      map.set(key, value);
    }
  });
  
  // 原生 Map 测试
  const nativeResults = benchmark('原生 Map 插入', () => {
    const map = new Map();
    for (const [key, value] of testData) {
      map.set(key, value);
    }
  });
  
  console.log('📈 性能对比:');
  console.log(`TurboMap: ${turboResults.opsPerSec.toFixed(0)} ops/sec`);
  console.log(`原生 Map: ${nativeResults.opsPerSec.toFixed(0)} ops/sec`);
  console.log(`性能比: ${(turboResults.opsPerSec / nativeResults.opsPerSec).toFixed(2)}x`);
}

// 主函数
function main() {
  try {
    console.log('开始性能基准测试...\n');
    
    runBenchmarks();
    compareWithNativeMap();
    
    console.log('✅ 基准测试完成');
  } catch (error) {
    console.error('❌ 基准测试失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('benchmark.js')) {
  main();
} 
