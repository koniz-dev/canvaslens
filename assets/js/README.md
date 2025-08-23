# Navigation Module

Module quản lý navigation bar cho các trang demo của CanvasLens.

## Cách sử dụng

### 1. Import module

```javascript
import { autoCreateNavigation, createNavigation, Navigation } from '../assets/js/navigation.js';
```

### 2. Tự động tạo navigation (Khuyến nghị)

```javascript
// Tự động phát hiện trang hiện tại và tạo navigation
autoCreateNavigation();
```

### 3. Tạo navigation thủ công

```javascript
// Tạo navigation cho trang cụ thể
createNavigation('basic'); // 'basic', 'zoom', 'annotation', 'comparison', 'editor'

// Hoặc sử dụng class Navigation
const nav = new Navigation({ currentPage: 'annotation' });
nav.mount();
```

## API

### `autoCreateNavigation()`
Tự động phát hiện trang hiện tại dựa trên URL và tạo navigation bar.

### `createNavigation(currentPage)`
Tạo navigation bar cho trang được chỉ định.

**Parameters:**
- `currentPage` (string): ID của trang hiện tại ('home', 'basic', 'zoom', 'annotation', 'comparison', 'editor')

### `Navigation` class

#### Constructor
```javascript
new Navigation(options)
```

**Options:**
- `currentPage` (string): ID của trang hiện tại

#### Methods

- `render()`: Trả về HTML của navigation bar
- `init()`: Khởi tạo các event listeners
- `mount()`: Chèn navigation vào trang và khởi tạo

## Cấu trúc trang

Navigation module sẽ tự động chèn navigation bar vào đầu `<body>` của trang. Bạn chỉ cần thêm comment để đánh dấu vị trí:

```html
<body>
    <!-- Navigation will be inserted here by JavaScript -->
    <div class="container">
        <!-- Nội dung trang -->
    </div>
</body>
```

## Tính năng

- ✅ Responsive design
- ✅ Mobile menu với hamburger button
- ✅ Tự động highlight trang hiện tại
- ✅ Auto-close menu khi click outside
- ✅ Smooth animations
- ✅ Tương thích với tất cả các trang demo

## Lợi ích

1. **DRY Principle**: Không cần lặp lại code navigation trong mỗi file
2. **Dễ bảo trì**: Chỉ cần sửa một file để cập nhật tất cả navigation
3. **Tự động**: Tự động phát hiện trang hiện tại
4. **Linh hoạt**: Có thể tùy chỉnh cho từng trang cụ thể
5. **Performance**: Code được tối ưu và tái sử dụng
