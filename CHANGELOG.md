# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
