# CI/CD and Release Guide

This document explains how to set up and use the CI/CD pipeline for the Turbo Map project.

## Overview

The project includes the following automated processes:

- **CI/CD Pipeline** - Code quality checks and testing
- **Auto Release** - Publishing to npm and GitHub Releases
- **Documentation Deployment** - Auto-deploy docs to GitHub Pages
- **Dependency Updates** - Automatic dependency updates

## Workflow Files

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

This workflow runs on every push to `main` or `develop` branches, including:

- **Multi-version Testing** - Runs tests on Node.js 16, 18, 20
- **Code Quality Checks** - ESLint and TypeScript type checking
- **Security Audits** - npm security vulnerability checks
- **Build Testing** - Validates build output
- **Performance Testing** - Runs benchmarks
- **Bundle Size Checks** - Monitors package size

### 2. Release Workflow (`.github/workflows/release.yml`)

Automatically triggered when version tags are pushed:

- Runs complete test suite
- Builds the project
- Publishes to npm
- Creates GitHub Release
- Uploads release assets

### 3. Version Management (`.github/workflows/version.yml`)

Automatic version management:

- Supports manual version bump triggers
- Automatically creates tags and releases
- Generates release notes

### 4. Documentation Deployment (`.github/workflows/deploy-docs.yml`)

Auto-deploys documentation to GitHub Pages:

- Builds the project
- Creates documentation site
- Deploys to GitHub Pages

### 5. Dependabot Configuration (`.github/dependabot.yml`)

Automatic dependency updates:

- Weekly npm dependency update checks
- Weekly GitHub Actions update checks
- Automatic PR creation

## Setup Steps

### 1. Configure GitHub Secrets

Add the following secrets in your GitHub repository settings:

```bash
# NPM publish token
NPM_TOKEN=your_npm_token_here

# GitHub token (usually provided automatically)
GITHUB_TOKEN=your_github_token_here
```

### 2. Enable GitHub Pages

1. Go to repository settings
2. Find "Pages" option
3. Select "GitHub Actions" as source
4. Save settings

### 3. Configure Dependabot

Dependabot configuration is included in `.github/dependabot.yml` and will automatically:

- Check for dependency updates weekly
- Create update PRs
- Auto-merge patch version updates

## Release Process

### Automatic Release

1. **Create version tag**:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

2. **Use release script**:
   ```bash
   npm run release:patch  # Patch version
   npm run release:minor  # Minor version
   npm run release:major  # Major version
   ```

3. **Manual trigger release**:
   - Go to GitHub Actions
   - Select "Version Management" workflow
   - Click "Run workflow"
   - Choose version type

### Manual Release

```bash
# Run complete release process
npm run release

# Or specify version type
npm run release:patch
npm run release:minor
npm run release:major
```

## Monitoring and Debugging

### View Workflow Status

1. Go to GitHub repository
2. Click "Actions" tab
3. Check status of various workflows

### Common Issues

1. **Release failures**:
   - Check if NPM_TOKEN is set correctly
   - Ensure version numbers don't conflict
   - Verify all tests pass

2. **Build failures**:
   - Check TypeScript type errors
   - Verify ESLint rules
   - Ensure all dependencies are installed correctly

3. **Test failures**:
   - Check test logs
   - Verify test environment configuration
   - Check test coverage

## Best Practices

1. **Pre-commit checks**:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

2. **Version management**:
   - Use semantic versioning
   - Update CHANGELOG.md promptly
   - Add clear release notes for each version

3. **Dependency management**:
   - Regularly check for dependency updates
   - Address security vulnerabilities promptly
   - Test dependency updates

4. **Documentation maintenance**:
   - Keep documentation in sync with code
   - Update API documentation promptly
   - Add usage examples

## Troubleshooting

### Workflow Failures

1. Check GitHub Actions logs
2. Verify secrets configuration
3. Confirm permission settings

### Publishing Issues

1. Check npm account permissions
2. Verify package name uniqueness
3. Confirm version number format

### Documentation Deployment Issues

1. Check GitHub Pages settings
2. Verify build output
3. Confirm file paths are correct

## Getting Support

If you encounter issues:

1. Check GitHub Issues
2. Review workflow logs
3. Submit detailed error reports

---

For more information, refer to [GitHub Actions documentation](https://docs.github.com/en/actions) and [npm publish guide](https://docs.npmjs.com/cli/v8/commands/npm-publish). 
