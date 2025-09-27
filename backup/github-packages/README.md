# GitHub Packages Backup

## 📦 Backup Contents:

### Workflows:
- `publish.yml` - Publish package to GitHub Packages when release is created
- `release.yml` - Create release and publish package when pushing tags

### GitHub Packages Configuration:
- Registry URL: `https://npm.pkg.github.com`
- Scope: `@koniz-dev`
- Authentication: `GITHUB_TOKEN`

## 🔄 How to Restore:

### 1. Restore workflows:
```bash
cp -r backup/github-packages/.github ./
```

### 2. Update package.json:
```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

### 3. Setup authentication:
```bash
# Create .npmrc file
echo "@koniz-dev:registry=https://npm.pkg.github.com" >> ~/.npmrc

# Or login
npm login --scope=@koniz-dev --auth-type=legacy --registry=https://npm.pkg.github.com
```

## 📋 Notes:

- GitHub Packages requires more complex authentication than npmjs.com
- Users need to configure `.npmrc` to use packages
- Suitable for private packages or internal teams
- Currently switched to npmjs.com for easier usage

## 🗓️ Backup Date:
$(date)
