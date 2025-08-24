# Testing

This directory contains all tests for the CanvasLens library.

## Directory Structure

```
test/
├── setup.ts                 # Test setup and global configurations
├── unit/                    # Unit tests
│   ├── coordinate.test.ts   # Tests for coordinate utilities
│   └── image.test.ts        # Tests for image utilities
├── integration/             # Integration tests
│   └── canvaslens.test.ts   # Tests for CanvasLens integration
├── functional/              # Functional tests
│   └── features.test.ts     # Tests for main features
└── README.md               # This file
```

## Test Types

### Unit Tests
- **Purpose**: Test individual functions/methods in isolation
- **Location**: `test/unit/`
- **Examples**: Tests for `screenToWorld`, `calculateFitDimensions`, etc.

### Integration Tests
- **Purpose**: Test interactions between modules
- **Location**: `test/integration/`
- **Examples**: Tests for CanvasLens initialization, event handling

### Functional Tests
- **Purpose**: Test main application features
- **Location**: `test/functional/`
- **Examples**: Tests for zoom/pan, touch support, performance

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests silently
npm run test:silent
```

## Test Configuration

### Dependencies
- **Jest**: Main testing framework
- **@testing-library/jest-dom**: Additional matchers
- **ts-jest**: TypeScript support for Jest

### Setup (`test/setup.ts`)
- Mock `getContext()` method to avoid errors when testing canvas operations
- Provide mock implementations for all canvas methods
- Mock `Image` constructor to test image loading
- Simulate `onload` and `onerror` events

## Test Coverage

Tests include:
- **Unit Tests**: 47 tests covering utilities and core functions
- **Integration Tests**: CanvasLens initialization and event handling
- **Functional Tests**: Main features like zoom, pan, annotations
- **Error Handling**: Edge cases and error conditions
- **Performance**: Memory usage and cleanup

## Test Guidelines

1. **Isolation**: Each test must be independent and not depend on other tests
2. **Cleanup**: Always cleanup resources after each test
3. **Mocking**: Use mocks for external dependencies
4. **Edge Cases**: Test edge cases and error conditions
