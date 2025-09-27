# NPM GitHub Actions Integration

## 📦 Contents:

### Workflows:
- `publish.yml` - Auto-publish to NPM registry when GitHub release is created
- `ci.yml` - CI/CD pipeline for testing and building

### Features:
- **Auto-publish**: Automatically publishes to NPM when GitHub release is created
- **CI/CD**: Runs tests, builds, and security audits on every push/PR
- **NPM Integration**: Uses NPM_TOKEN for authentication
- **Quality Control**: Ensures code quality before publishing

## 🔄 How to Setup:

### 1. Create NPM Token:
```bash
# Login to npm
npm login

# Create access token
npm token create --read-only=false
```

### 2. Add NPM_TOKEN to GitHub Secrets:
1. Go to GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add new secret: `NPM_TOKEN` with your npm token

### 3. Restore workflows:
```bash
cp -r backup/npm-github-actions/.github ./
```

### 4. Update package.json (if needed):
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/koniz-dev/canvaslens.git"
  }
}
```

## 🚀 Workflow:

### Manual Release:
1. Run `npm run release patch` (or minor/major)
2. Create GitHub release for the new tag
3. GitHub Actions automatically publishes to NPM

### Automatic CI/CD:
- **Push to main**: Runs tests and builds
- **Pull Request**: Runs tests and builds
- **Release created**: Auto-publishes to NPM

## 📋 Benefits:

- ✅ **Automated publishing** - No manual npm publish needed
- ✅ **Quality assurance** - Tests run before every publish
- ✅ **Security** - NPM token stored securely in GitHub Secrets
- ✅ **Integration** - Seamless GitHub ↔ NPM integration
- ✅ **CI/CD** - Full pipeline for code quality

## 🗓️ Backup Date:
$(date)

## 📖 References:
- [NPM Token Management](https://docs.npmjs.com/creating-and-viewing-access-tokens)
- [GitHub Actions NPM Integration](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
