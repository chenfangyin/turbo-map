# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.9] - 2025-01-15

### 🎯 **BEHAVIOR CHANGE** - Key Consistency Feature

#### **New Consistent Key Behavior**
- 🔄 **Symbol Consistency**: All `Symbol()` instances now treated as the same key
- 📅 **Date Consistency**: `new Date()` without parameters treated as the same key within 5-second time window
- 🌐 **Global Symbol Support**: `Symbol.for()` still works based on global key

#### **What Changed**
```javascript
// v1.0.8 (old behavior)
const map = createTurboMap();
map.set(Symbol(), 'value1');
map.set(Symbol(), 'value2');
console.log(map.size); // 2 - different keys

// v1.0.9 (new behavior) 
const map = createTurboMap();
map.set(Symbol(), 'value1');
map.set(Symbol(), 'value2'); // overwrites value1
console.log(map.size); // 1 - same key
console.log(map.get(Symbol())); // 'value2'
```

#### **Date Behavior**
```javascript
// Parameterized dates - distinct by timestamp
map.set(new Date('2024-01-01'), 'value1');
map.set(new Date('2024-01-02'), 'value2'); // different keys

// No-parameter dates - same key within time window
map.set(new Date(), 'current1');
map.set(new Date(), 'current2'); // overwrites current1 (if within 5s)
```

#### **Breaking Changes**
- ⚠️ **Symbol Behavior**: `Symbol()` instances no longer unique - all treated as same key
- ⚠️ **Test Updates**: Updated test cases to reflect new consistent behavior

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

#### **What was Wrong in v1.0.7 npm package**
- ❌ npm package still contained old buggy code: `Symbol(${obj.toString()})`
- ❌ Different Symbol instances incorrectly treated as identical
- ❌ `turboMap.get(Symbol())` returned same value (bug behavior)

#### **What's Fixed in v1.0.8**
- ✅ npm package contains correct code: `serializeSymbol()` method
- ✅ Different Symbol instances correctly treated as unique
- ✅ `turboMap.get(Symbol())` correctly returns `undefined`

### **Verification**
```javascript
import { createTurboMap } from 'turbo-map'; // v1.0.8
const turboMap = createTurboMap();
turboMap.set(Symbol(), 14);
console.log(turboMap.get(Symbol())); // ✅ undefined (correct)
```

## [1.0.7] - 2025-01-15

### 🐛 Critical Symbol Serialization Bug Fix

#### Symbol Uniqueness Issue Resolution
- 🔧 **Fixed Symbol Serialization**: Resolved critical bug where different Symbol instances with same description were incorrectly treated as identical keys
- 🆔 **Unique Symbol IDs**: Each Symbol instance now receives a unique identifier (`Symbol.1("test")`, `Symbol.2("test")`)
- 🌐 **Global Symbol Support**: Proper handling of `Symbol.for()` - global symbols with same key correctly identified as identical
- 🚫 **Cache Bypass**: Symbol keys now bypass caching to ensure proper uniqueness preservation

#### Technical Improvements
- **AdaptiveSerializer Enhancement**: Added dedicated `serializeSymbol()` method with counter-based uniqueness
- **Cache Logic Fix**: Modified main TurboMap cache logic to skip Symbol caching, preventing false matches
- **Symbol Counter Management**: Implemented proper symbol ID counter with reset capabilities

#### Test Coverage
- ✅ **Comprehensive Testing**: Added 35+ new test cases covering Symbol and Date object serialization
- 🔬 **Edge Cases**: Tests for symbols without description, global symbols, mixed symbol types
- 📊 **Serialization Tests**: Detailed validation of serialization key generation and uniqueness

### 🚀 Performance & Compatibility
- **Date Objects**: Confirmed Date objects work correctly (based on timestamp, not affected by bug)
- **Backward Compatible**: All existing functionality preserved, no breaking changes
- **Type Safety**: Maintained full TypeScript type safety and ES Map API compatibility

### Migration Notes
**For Users**: No action required - this is a bug fix with no API changes
**For Contributors**: Symbol behavior now correctly matches JavaScript semantics

## [1.0.4] - 2025-08-03

### 🔧 Critical Documentation & Deployment Fixes

#### GitHub Pages Deployment Resolution
- 🛠️ **Complete Fix**: Resolved persistent GitHub Pages deployment failures
- 🔑 **Permissions**: Enhanced workflow permissions from `contents: read` to `contents: write`
- ⚙️ **Git Authentication**: Fixed git exit code 128 permission errors
- 🌊 **Force Orphan**: Added `force_orphan: true` for clean gh-pages branch creation
- 👤 **User Identity**: Proper github-actions[bot] user configuration for commits

#### Workflow Optimization & Stability
- 📝 **YAML Syntax**: Completely resolved 55+ YAML syntax errors in deploy-docs.yml
- 🔄 **Action Versions**: Stabilized with peaceiris/actions-gh-pages@v3 (proven stable)
- 🧹 **Code Simplification**: Reduced workflow complexity from 300+ to 85 lines
- 🎯 **Error Handling**: Enhanced error handling with proper fallbacks
- 📊 **Logging**: Improved deployment logging and status reporting

#### Documentation Website Improvements
- 🎨 **Responsive Design**: Mobile-friendly documentation homepage
- 🔗 **Navigation**: Quick access to README, Changelog, build files, npm, GitHub
- ⚡ **Performance**: Lightweight HTML/CSS for fast loading
- 📱 **Cross-platform**: Compatible across all devices and browsers
- 🎯 **User Experience**: Clean, professional documentation presentation

#### Technical Infrastructure
- 🔒 **Security**: Proper workflow permissions and security practices
- 🚀 **Deployment**: Reliable automated documentation deployment
- 📦 **Build Process**: Streamlined documentation generation pipeline
- 🛡️ **Stability**: Multiple layers of error recovery and fallback mechanisms

### 🐛 Bug Fixes
- Fixed GitHub Actions workflow syntax errors preventing deployment
- Resolved git authentication and permission issues
- Fixed broken documentation links and navigation
- Corrected YAML parsing errors in CI/CD workflows
- Fixed responsive design issues on mobile devices

### 🚀 Performance Improvements
- Reduced deployment workflow execution time
- Optimized documentation site loading speed
- Streamlined build process with better caching
- Minimized external dependencies in workflows

### 📚 Documentation Enhancements
- Professional documentation homepage with quick start guide
- Clear navigation to all project resources
- Mobile-optimized responsive layout
- Enhanced visual design and user experience

### Migration Notes
**For Users**: No breaking changes - all APIs remain compatible
**For Contributors**: New documentation deployment workflow is more reliable and faster

## [1.0.3] - 2025-08-03

### 🐛 Bug Fixes & Release Process Improvements

#### Release Process Fixes
- 🔄 **npm Publishing**: Resolved version conflict issue where v1.0.2 already existed in npm registry
- ⚙️ **GitHub Actions**: Fixed npm publish workflow to handle version conflicts gracefully
- 🏷️ **Tag Management**: Improved release tag handling to prevent duplicate version publishing

#### GitHub Pages Deployment
- 🌐 **Pages Configuration**: Fixed GitHub Pages 404 deployment errors
- 🔧 **Environment Setup**: Added proper `github-pages` environment configuration
- 📚 **Documentation Site**: Ensured reliable deployment of documentation website

#### CI/CD Pipeline Stability
- ✅ **Action Versions**: Stabilized all GitHub Actions to working versions
- 🔒 **Security**: Maintained security checks and automated release processes
- 📦 **Build Process**: Verified compatibility with Node.js 18+ and all build targets

### Technical Details
- **Previous Issue**: npm registry already contained v1.0.2, causing publish failures
- **Solution**: Incremented to v1.0.3 to resolve version conflict
- **Benefit**: Maintains continuous deployment and release automation

## [1.0.2] - 2025-08-03

### 🚀 Major Infrastructure Modernization

#### System Requirements
- ⬆️ **Node.js Requirement**: Updated minimum Node.js version to **18.0.0+**
- 🔧 **TypeScript Enhancement**: Upgraded to strict type checking with ES2022 target
- 📦 **Build System**: Enhanced Rollup configuration with advanced tree shaking

#### 🔒 Security & CI/CD Enhancements
- 🔐 **Security Hardening**: Added sensitive data masking in configuration outputs
- ⚙️ **GitHub Actions Modernization**: Updated all CI/CD workflows to latest stable versions
  - `actions/checkout@v4`, `actions/setup-node@v4`, `codecov/codecov-action@v4`
  - Fixed deprecated actions and resolved version conflicts
- 🛡️ **Enhanced Security Checks**: Integrated comprehensive audit pipeline
- 🤖 **Automated Release**: Streamlined npm package publishing workflow

#### 📚 Documentation & Internationalization
- 🌐 **Multi-language Support**: Updated Simplified Chinese, Traditional Chinese documentation
- 📱 **Documentation Website**: Enhanced `docs-site` with modern design and navigation
- 🎨 **UI Improvements**: Added status badges, feature cards, and responsive design
- 📖 **API Consistency**: Synchronized all documentation versions with latest API

#### 🔧 Technical Improvements
- 📏 **Bundle Size Control**: Added `size-limit` configuration for build optimization
- 🎯 **Type Safety**: Enhanced TypeScript strict mode with `noUncheckedIndexedAccess`
- 🧹 **Code Quality**: Integrated Prettier, Husky, and lint-staged for consistency
- ⚡ **Performance**: Added bundle analysis and performance monitoring tools
- 🔄 **Development Experience**: Enhanced scripts for production builds and type checking

#### 🐛 Critical Bug Fixes
- 🛠️ **Cross-platform Support**: Fixed Windows environment variable issues with `cross-env`
- 🏗️ **Build Optimization**: Resolved package.json exports ordering for optimal module resolution
- 🔧 **GitHub Actions**: Fixed action version incompatibilities and deployment issues
- 📝 **Script Syntax**: Corrected release script syntax errors and error handling

#### 📦 Dependencies & Tooling
- ➕ **New Development Tools**: 
  - `cross-env` for cross-platform environment variables
  - `rollup-plugin-visualizer` for bundle analysis
  - `size-limit` for bundle size monitoring
  - `husky` and `lint-staged` for Git hooks
  - `prettier` for code formatting
- 🔄 **Updated Configurations**: Enhanced Rollup, TypeScript, and ESLint configurations

### Migration Guide
```bash
# Update Node.js to version 18 or higher
node --version  # Should be >= 18.0.0

# Reinstall dependencies with new configurations
npm install

# Verify build with new optimizations
npm run build:prod
npm run size
```

## [1.0.0] - 2025-07-28

### Added
- 🚀 Initial release
- 🔐 Fully type-safe Map implementation
- 🔄 Support for complex nested objects as keys
- ⚡ LRU cache and performance optimizations
- 🛡️ Circular reference handling
- 📅 Special type support (Date, RegExp, Array, etc.)
- 💾 Intelligent memory management
- 🔌 Plugin architecture
- 📊 Performance monitoring and debugging tools
- 🎯 ES Map full compatibility

### Features
- 3-5x performance boost
- Deep object comparison
- Batch operations support
- Memory optimization
- Error recovery mechanisms

### Technical Stack
- TypeScript 5.0+
- Rollup 3.0+
- Jest 30.0+
- Node.js 14.0+

### Development Tools
- ESLint configuration
- GitHub Actions CI/CD
- Performance benchmarks
- Comprehensive test coverage
- Multi-language documentation

## [1.0.1] - 2025-08-01

### Enhanced
- 📚 **Documentation Improvements**: Comprehensive API documentation with detailed examples
- 🔧 **Script Optimization**: Removed redundant scripts and enhanced existing ones
- 🚀 **CI/CD Enhancements**: Improved release workflow with better error handling
- 📊 **Performance Monitoring**: Added benchmark script and performance diagnostics
- 🔒 **Security Enhancements**: Integrated security checks into release process

### Added
- 📖 **Complete API Reference**: Detailed type definitions, plugin system, and async operations
- 💡 **Best Practices Guide**: 8 comprehensive best practice examples
- 🔍 **Advanced Examples**: Async operations, error recovery, memory management
- 🛠️ **Development Scripts**: `ci:test`, `config:validate`, `config:show`, `config:generate-env`
- 📈 **Performance Tools**: Enhanced benchmark and diagnostic utilities

### Fixed
- 🐛 **Missing Benchmark Script**: Created `tests/benchmark.js` for performance testing
- 🔧 **Script Redundancy**: Removed unused debugging scripts from root directory
- 📝 **Documentation Gaps**: Filled missing API documentation and usage examples
- ⚙️ **Configuration Issues**: Enhanced configuration management and validation

### Improved
- 🚀 **Release Process**: Added rollback mechanisms and better error handling
- 📦 **Package Management**: Enhanced npm publishing workflow with detailed logging
- 🔍 **Error Recovery**: Improved error handling with fallback mechanisms
- 📊 **Monitoring**: Enhanced performance monitoring and health checks

### Technical Improvements
- **Enhanced Type Definitions**: Complete API interface documentation
- **Plugin System Documentation**: Detailed plugin development guide
- **Async Operations Guide**: Comprehensive async usage examples
- **Memory Management**: Advanced memory optimization techniques
- **Error Handling**: Robust error recovery and fallback strategies
