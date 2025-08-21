# CanvasLens Testing

Thư mục này chứa tất cả các test cho thư viện CanvasLens.

## Cấu trúc thư mục

```
test/
├── setup.ts                 # Jest setup configuration
├── unit/                    # Unit tests
│   ├── coordinate.test.ts   # Tests cho coordinate utilities
│   └── image.test.ts        # Tests cho image utilities
├── integration/             # Integration tests
│   └── canvaslens.test.ts   # Tests cho CanvasLens class
├── functional/              # Functional tests
│   └── features.test.ts     # Tests cho các tính năng chính
└── README.md               # File này
```

## Các loại testing

### 1. Unit Testing
- **Mục đích**: Kiểm tra từng function/method riêng lẻ
- **Vị trí**: `test/unit/`
- **Ví dụ**: Tests cho `screenToWorld`, `calculateFitDimensions`, etc.

### 2. Integration Testing
- **Mục đích**: Kiểm tra sự tương tác giữa các module
- **Vị trí**: `test/integration/`
- **Ví dụ**: Tests cho việc khởi tạo CanvasLens, event handling

### 3. Functional Testing
- **Mục đích**: Kiểm tra các tính năng chính của ứng dụng
- **Vị trí**: `test/functional/`
- **Ví dụ**: Tests cho zoom/pan, touch support, performance

## Chạy tests

```bash
# Chạy tất cả tests
npm test

# Chạy tests với watch mode
npm run test:watch

# Chạy tests với coverage report
npm run test:coverage
```

## Testing Framework

- **Jest**: Testing framework chính
- **ts-jest**: TypeScript support cho Jest
- **jsdom**: DOM environment cho testing
- **@testing-library/jest-dom**: Additional matchers

## Mock Objects

### Canvas Mock
- Mock `getContext()` method để tránh lỗi khi test canvas operations
- Cung cấp mock implementations cho tất cả canvas methods

### Image Mock
- Mock `Image` constructor để test image loading
- Simulate `onload` và `onerror` events

## Test Coverage

Tests bao gồm:

### Unit Tests
- ✅ Coordinate transformations (screenToWorld, worldToScreen)
- ✅ Mathematical utilities (distance, centerPoint, clamp)
- ✅ Image utilities (calculateFitDimensions, loadImage, getImageData)
- ✅ Geometry utilities (isPointInRect)

### Integration Tests
- ✅ CanvasLens initialization
- ✅ Event handling (mouse, wheel, touch)
- ✅ Image loading integration
- ✅ Zoom and pan integration

### Functional Tests
- ✅ Image viewing features
- ✅ Zoom and pan functionality
- ✅ Touch support
- ✅ Performance testing
- ✅ Error handling

## Best Practices

1. **Isolation**: Mỗi test phải độc lập và không phụ thuộc vào test khác
2. **Cleanup**: Luôn cleanup resources sau mỗi test
3. **Mocking**: Sử dụng mocks cho external dependencies
4. **Edge Cases**: Test các edge cases và error conditions
5. **Performance**: Test performance cho các operations quan trọng

## Adding New Tests

1. Tạo file test mới trong thư mục phù hợp
2. Follow naming convention: `*.test.ts`
3. Import dependencies cần thiết
4. Viết test cases với descriptive names
5. Chạy tests để đảm bảo chúng pass

## Troubleshooting

### Common Issues

1. **Canvas not supported**: Đảm bảo đã setup canvas mock trong `setup.ts`
2. **Image loading errors**: Check Image mock implementation
3. **DOM not available**: Đảm bảo đã cấu hình jsdom environment

### Debug Tests

```bash
# Chạy test cụ thể
npm test -- --testNamePattern="should convert screen coordinates"

# Chạy với verbose output
npm test -- --verbose

# Chạy test file cụ thể
npm test -- coordinate.test.ts
```
