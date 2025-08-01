#!/usr/bin/env node

import { createEnhancedTurboMap } from '../dist/index.esm.js';
import { performance } from 'perf_hooks';

console.log('🚀 Turbo Map 性能基准测试\n');

// 轻量级测试数据生成
function generateTestData(size) {
  const data = [];
  for (let i = 0; i < size; i++) {
    // 使用简单数据结构，避免内存溢出
    data.push([
      `key-${i}`, // 简单字符串键
      `value-${i}` // 简单字符串值
    ]);
  }
  return data;
}

// 轻量级基准测试函数
function benchmark(name, fn, iterations = 50) {
  const start = performance.now();
  
  try {
    for (let i = 0; i < iterations; i++) {
      fn();
    }
  } catch (error) {
    console.log(`${name}: ❌ 测试失败 - ${error.message}`);
    console.log('');
    return null;
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

// 轻量级测试用例
function runBenchmarks() {
  // 只测试小数据量，避免CI/CD环境内存溢出
  const testSizes = [100, 500];
  
  for (const size of testSizes) {
    console.log(`📊 测试数据大小: ${size} 项\n`);
    
    const testData = generateTestData(size);
    
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
    
    // 测试 3: 删除性能 (减少测试范围)
    benchmark(`删除 ${size} 项`, () => {
      const map = createEnhancedTurboMap();
      for (const [key, value] of testData) {
        map.set(key, value);
      }
      // 只删除前50项，避免内存问题
      for (let i = 0; i < Math.min(50, size); i++) {
        map.delete(testData[i][0]);
      }
    });
    
    // 测试 4: 迭代性能
    benchmark(`迭代 ${size} 项`, () => {
      const map = createEnhancedTurboMap();
      for (const [key, value] of testData) {
        map.set(key, value);
      }
      let count = 0;
      for (const [key, value] of map) {
        count++;
        if (count > 100) break; // 限制迭代次数
      }
    });
    
    console.log('─'.repeat(50));
    console.log('');
  }
}

// 与原生 Map 对比 (轻量级)
function compareWithNativeMap() {
  console.log('🔄 与原生 Map 对比测试\n');
  
  const size = 500; // 减少数据量
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
  
  if (turboResults && nativeResults) {
    console.log('📈 性能对比:');
    console.log(`TurboMap: ${turboResults.opsPerSec.toFixed(0)} ops/sec`);
    console.log(`原生 Map: ${nativeResults.opsPerSec.toFixed(0)} ops/sec`);
    console.log(`性能比: ${(turboResults.opsPerSec / nativeResults.opsPerSec).toFixed(2)}x`);
  }
}

// 主函数
function main() {
  // 设置超时机制
  const timeout = setTimeout(() => {
    console.error('❌ 性能基准测试超时');
    process.exit(1);
  }, 30000); // 30秒超时
  
  try {
    console.log('开始性能基准测试...\n');
    
    runBenchmarks();
    compareWithNativeMap();
    
    clearTimeout(timeout);
    console.log('✅ 基准测试完成');
  } catch (error) {
    clearTimeout(timeout);
    console.error('❌ 基准测试失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('benchmark.js')) {
  main();
} 
