#!/bin/bash

# Release script for CanvasLens
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Get the release type
RELEASE_TYPE=${1:-patch}

if [[ ! "$RELEASE_TYPE" =~ ^(patch|minor|major)$ ]]; then
    print_error "Invalid release type. Use: patch, minor, or major"
    exit 1
fi

print_status "Starting release process for type: $RELEASE_TYPE"

# Run tests
print_status "Running tests..."
npm test

# Build the project
print_status "Building project..."
npm run build

# Update version
print_status "Updating version..."
npm version $RELEASE_TYPE --no-git-tag-version

# Get the new version
NEW_VERSION=$(node -p "require('./package.json').version")
print_status "New version: $NEW_VERSION"

# Create git tag
print_status "Creating git tag v$NEW_VERSION..."
git add package.json package-lock.json
git commit -m "chore: bump version to $NEW_VERSION"
git tag "v$NEW_VERSION"

# Push changes and tag
print_status "Pushing changes and tag..."
git push origin main
git push origin "v$NEW_VERSION"

print_status "Release process completed!"
print_status "Next steps:"
echo "1. Go to https://github.com/koniz-dev/canvaslens/releases"
echo "2. Create a new release for tag v$NEW_VERSION"
echo "3. Add release notes"
echo "4. Publish the release"
echo ""
print_status "You can now publish the package to npm registry using: npm publish"
