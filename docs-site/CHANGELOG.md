# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.10] - 2025-01-15

### 🎯 **BEHAVIOR CHANGE** - Key Consistency Feature

#### **New Key Behavior**
- 🔄 **Symbol Consistency**: All `Symbol()` instances now treated as the same key
- 📅 **Date Distinction**: All `Date` objects distinguished by timestamp (including parameterless `new Date()`)
- 🌐 **Global Symbol Support**: `Symbol.for()` still works based on global key

#### **What Changed**
```javascript
// v1.0.8 (old behavior)
const map = createTurboMap();
map.set(Symbol(), 'value1');
map.set(Symbol(), 'value2');
console.log(map.size); // 2 - different keys

// v1.0.10 (new behavior) 
const map = createTurboMap();
map.set(Symbol(), 'value1');
map.set(Symbol(), 'value2'); // overwrites value1
console.log(map.size); // 1 - same key
console.log(map.get(Symbol())); // 'value2'
```

#### **Date Behavior**
```javascript
// All dates distinguished by timestamp
map.set(new Date('2024-01-01'), 'value1');
map.set(new Date('2024-01-02'), 'value2'); // different keys

// Parameterless new Date() also distinguished by call timing
map.set(new Date(), 'current1');
map.set(new Date(), 'current2'); // different keys (different timestamps)
console.log(map.size); // 4 - all different
```

#### **Breaking Changes**
- ⚠️ **Symbol Behavior**: `Symbol()` instances no longer unique - all treated as same key
- ✅ **Date Behavior**: Maintained timestamp-based distinction for all `Date` objects
- ⚠️ **Test Updates**: Updated test cases to reflect new Symbol consistency behavior

### **Migration Guide**
If you need unique Symbol keys, use `Symbol.for()` with different keys:
```javascript
// Instead of: Symbol('key1'), Symbol('key2')
// Use: Symbol.for('key1'), Symbol.for('key2')
```

## [1.0.8] - 2025-01-15

### 🚀 **CRITICAL HOTFIX** - npm Package Release Fix

#### **The Real Symbol Serialization Fix**
- 🔥 **Emergency Fix**: v1.0.7 npm package didn't contain the actual Symbol fix
- ✅ **Verified npm Package**: This version (v1.0.8) confirmed to contain the correct Symbol serialization logic
- 🔧 **Proper Symbol Handling**: Each `Symbol()` instance now correctly gets unique serialization keys
- 🌐 **Global Symbol Support**: `Symbol.for()` correctly treated as identical keys

## [1.0.7] - 2025-01-15

### 🐛 Critical Symbol Serialization Bug Fix

#### Symbol Uniqueness Issue Resolution
- 🔧 **Fixed Symbol Serialization**: Resolved critical bug where different Symbol instances with same description were incorrectly treated as identical keys
- 🆔 **Unique Symbol IDs**: Each Symbol instance now receives a unique identifier (`Symbol.1("test")`, `Symbol.2("test")`)
- 🌐 **Global Symbol Support**: Proper handling of `Symbol.for()` - global symbols with same key correctly identified as identical

## [1.0.6] - 2024-12-20

### 🚀 Enhanced Performance & Plugin System

#### **Core Improvements**
- ⚡ **Performance Boost**: 3-5x performance improvement with optimized serialization
- 🔌 **Plugin Architecture**: Comprehensive plugin system with lifecycle hooks
- 🎯 **Async Operations**: Full async/await support with batch operations
- 🛡️ **Error Recovery**: Advanced error handling with fallback mechanisms

#### **New Features**
- 📊 **Diagnostics System**: Memory analysis and performance profiling
- 🗃️ **Tiered Caching**: Multi-level cache with LRU eviction
- 🔄 **Object Pool**: Optimized memory management
- 📈 **Metrics Collection**: Real-time performance monitoring

## [1.0.5] - 2024-12-19

### 🔧 Stability & Infrastructure Improvements

#### **Build System**
- 📦 **Multi-format Support**: CommonJS, ESM, UMD, and minified builds
- 🔨 **Rollup 3.0+**: Modern build pipeline with TypeScript 5.0+
- 🧪 **Jest 30.0+**: Comprehensive testing with 95%+ coverage
- 🔍 **ESLint 9.0+**: Modern linting with strict TypeScript rules

#### **Development Experience**
- 🚀 **GitHub Actions**: Automated CI/CD with release workflows
- 📚 **Documentation**: Multi-language docs (EN, ZH-CN, ZH-TW, JA)
- 🛡️ **Security**: Automated security audits and dependency updates
- 📊 **Benchmarks**: Performance testing and comparison tools

## [1.0.0] - 2024-07-28

### 🚀 Initial Release

#### **Core Features**
- 🔐 **Type Safety**: Fully type-safe Map implementation with TypeScript-first design
- 🔄 **Complex Keys**: Support for complex nested objects as keys with deep comparison
- ⚡ **High Performance**: LRU cache and performance optimizations
- 🛡️ **Circular References**: Safe handling of circular references between objects
- 📅 **Special Types**: Support for Date, RegExp, Array, Function, etc.
- 💾 **Memory Management**: Intelligent memory management with automatic cleanup
- 🎯 **ES Map Compatibility**: Full compatibility with ES Map API

#### **Technical Foundation**
- **TypeScript 5.0+**: Modern TypeScript with strict type checking
- **Node.js 18+**: Support for latest Node.js features
- **ES2020+**: Modern JavaScript features and syntax
- **Zero Dependencies**: No external runtime dependencies
