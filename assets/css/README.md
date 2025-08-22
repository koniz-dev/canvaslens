# CanvasLens CSS Architecture

## Tổng quan

CSS của CanvasLens đã được tổ chức lại theo kiến trúc modular để dễ bảo trì và mở rộng. Tất cả styles được tổ chức thành các module riêng biệt và được import thông qua file `main.css`.

## Cấu trúc thư mục

```
assets/css/
├── base/                    # Base styles và variables
│   ├── variables.css        # CSS variables và theme
│   └── reset.css           # CSS reset và typography
├── layout/                  # Layout và grid system
│   ├── navigation.css      # Navigation styles
│   └── grid.css           # Layout components
├── components/              # Reusable components
│   ├── buttons.css         # Button styles
│   ├── forms.css           # Form elements
│   └── panels.css          # Info panels và containers
├── pages/                   # Page-specific styles
│   ├── home.css            # Home page
│   ├── basic.css           # Basic viewer page
│   ├── annotation.css      # Annotation page
│   ├── zoom.css            # Zoom page
│   └── comparison.css      # Comparison page
└── main.css                # Main import file
```

## CSS Variables

Tất cả colors, spacing, typography và các giá trị khác được định nghĩa trong `variables.css`:

- **Colors**: Primary, secondary, success, warning, error colors
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, xxl)
- **Typography**: Font sizes, font family
- **Layout**: Container widths, sidebar widths
- **Shadows**: Consistent shadow system
- **Transitions**: Standard transition durations

## Sử dụng

### Import CSS
Chỉ cần import file `main.css` trong HTML:

```html
<link rel="stylesheet" href="assets/css/main.css">
```

### Sử dụng CSS Variables
```css
.my-component {
    background: var(--primary-color);
    padding: var(--spacing-md);
    border-radius: var(--border-radius-sm);
    box-shadow: var(--shadow-md);
}
```

### Thêm styles mới

1. **Base styles**: Thêm vào `base/` nếu là global styles
2. **Layout**: Thêm vào `layout/` nếu liên quan đến layout
3. **Components**: Thêm vào `components/` nếu là reusable components
4. **Page-specific**: Thêm vào `pages/` nếu chỉ dành cho một trang cụ thể

## Lợi ích của cấu trúc mới

1. **Không trùng lặp**: Loại bỏ hoàn toàn các class trùng lặp
2. **Dễ bảo trì**: Mỗi component có file riêng
3. **Consistent**: Sử dụng CSS variables cho consistency
4. **Modular**: Dễ dàng thêm/sửa/xóa components
5. **Performance**: Chỉ load những gì cần thiết
6. **Scalable**: Dễ dàng mở rộng khi project phát triển

## Responsive Design

Tất cả components đều responsive với breakpoints nhất quán:
- Desktop: > 1024px
- Tablet: 768px - 1024px  
- Mobile: < 768px
- Small Mobile: < 480px

## Best Practices

1. Luôn sử dụng CSS variables thay vì hardcode values
2. Tổ chức styles theo chức năng, không theo page
3. Sử dụng BEM naming convention cho complex components
4. Test responsive design trên tất cả breakpoints
5. Comment rõ ràng cho complex CSS rules
