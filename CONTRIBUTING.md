# Contributing Guide

Thank you for your interest in the TurboMap project! We welcome all forms of contributions.

## 🚀 Quick Start

### Environment Setup

1. Clone the repository
```bash
git clone https://github.com/chenfangyin/turbo-map.git
cd turbo-map
```

2. Install dependencies
```bash
npm install
```

3. Run tests
```bash
npm test
```

## 📝 Types of Contributions

### 🐛 Bug Reports

If you find a bug, please:

1. Check if there's already a related issue at [GitHub Issues](https://github.com/chenfangyin/turbo-map/issues)
2. Create a new issue with:
   - Detailed bug description
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment information (Node.js version, OS, etc.)

### 💡 Feature Suggestions

If you have a feature suggestion, please:

1. Check if there's already a related discussion at [GitHub Discussions](https://github.com/chenfangyin/turbo-map/discussions)
2. Create an issue describing your idea at [GitHub Issues](https://github.com/chenfangyin/turbo-map/issues)
3. Explain why this feature is needed
4. Provide usage scenario examples

### 🔧 Code Contributions

#### Development Process

1. Fork the repository
2. Create a feature branch
```bash
git checkout -b feature/your-feature-name
```

3. Develop
   - Follow code standards
   - Add test cases
   - Update documentation

4. Run checks
```bash
npm run lint          # Code linting
npm run type-check    # Type checking
npm test              # Run tests
npm run build         # Build project
```

5. Commit code
```bash
git add .
git commit -m "feat: add your feature description"
```

6. Push and create Pull Request

#### Code Standards

- Use TypeScript
- Follow ESLint rules
- Add appropriate comments
- Write test cases
- Update related documentation

#### Commit Message Standards

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation updates
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Test related
- `chore`: Build tools or auxiliary tools changes

Examples:
```
feat(core): add support for circular references
fix(serialization): handle undefined values correctly
docs(readme): update installation instructions
```

## 🧪 Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

### Writing Tests

- Test files go in `tests/` directory
- File names end with `.test.ts`
- Use descriptive test names
- Tests should cover normal cases and edge cases

### Performance Testing

```bash
npm run benchmark     # Run performance benchmarks
```

## 📚 Documentation

### Documentation Structure

- `README.md`: Project overview
- `docs/`: Multi-language documentation
  - `en/README.md`: English documentation
  - `zh-CN/README.md`: Simplified Chinese documentation
  - `zh-TW/README.md`: Traditional Chinese documentation
  - `ja/README.md`: Japanese documentation

### Updating Documentation

- Update related documentation when adding new features
- Update troubleshooting section when fixing bugs
- Keep multi-language documentation synchronized

## 🔧 Development Tools

### Available Scripts

```bash
npm run dev           # Development mode (watch file changes)
npm run build         # Build project
npm run clean         # Clean build files
npm run lint          # Code linting
npm run lint:fix      # Auto-fix code issues
npm run type-check    # TypeScript type checking
npm test              # Run tests
npm run test:coverage # Generate coverage report
npm run benchmark     # Performance benchmarks
```

### IDE Configuration

Recommended VS Code extensions:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier

## 🚀 Release Process

### Version Management

Using [Semantic Versioning](https://semver.org/):

- `MAJOR`: Incompatible API changes
- `MINOR`: Backward-compatible functionality additions
- `PATCH`: Backward-compatible bug fixes

### Release Steps

1. Update version number
2. Update CHANGELOG.md
3. Create release tag
4. Publish to npm

## 🤝 Community

### Discussions

- [GitHub Issues](https://github.com/chenfangyin/turbo-map/issues): For bug reports and feature discussions
- [GitHub Discussions](https://github.com/chenfangyin/turbo-map/discussions): For general discussions and questions

### Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for everyone. Please:

- Respect others
- Use inclusive language
- Accept constructive criticism
- Focus on community interests

## 📄 License

By contributing code, you agree that your contributions will be released under the MIT License.

## 🎯 Project Goals

### Performance
- Maintain 3-5x performance improvement over native Map
- Optimize memory usage
- Provide performance monitoring tools

### Type Safety
- Ensure full TypeScript support
- Maintain type inference capabilities
- Provide comprehensive type definitions

### Compatibility
- Maintain ES Map API compatibility
- Support all major browsers
- Provide multiple module formats

### Developer Experience
- Comprehensive documentation
- Extensive test coverage
- Clear error messages
- Performance benchmarks

---

Thank you for your contributions! 🎉
