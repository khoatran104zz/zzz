# TaskFlow Engineering Standard: UI/UX Guidelines (`ui-style.md`)

Tài liệu này định nghĩa hệ thống thiết kế (Design System Tokens), quy tắc bố cục responsive, phong cách thẩm mỹ và tiêu chuẩn giao diện người dùng cho **TaskFlow**.

---

## 1. Design Principles (Triết Lý Thiết Kế)

1. **Dark Glassmorphic Aesthetics**: Phong cách thiết kế hiện đại trên nền tối (Dark mode), kết hợp các bề mặt kính mờ bán trong suốt (`backdrop-filter: blur(12px)`), viền kính mảnh và hiệu ứng phát sáng nhẹ (Indigo/Purple glow).
2. **Visual Hierarchy & Contrast**: Độ tương phản cao giữa nội dung chữ và nền, đảm bảo người dùng dễ dàng quét mắt (scan) nội dung trong các thao tác quản lý công việc phức tạp.
3. **Fluid Responsive Grid**: Giao diện thích ứng mượt mà trên nhiều thiết bị từ Mobile, Tablet đến Màn hình máy tính siêu rộng (Ultra-wide).
4. **i18n Multi-language Ready**: Hỗ trợ đầy đủ hiển thị đa ngôn ngữ (Tiếng Việt và Tiếng Anh) chuẩn xác mà không bị vỡ giao diện.

---

## 2. Color Palette & Design Tokens (Bảng Màu)

TaskFlow sử dụng bảng màu HSL và Tailwind CSS tokens chuẩn:

| Token | Giá Trị Hex / Alpha | Mục Đích |
| :--- | :--- | :--- |
| **Background Deep** | `#090d16` | Nền chính toàn bộ ứng dụng web |
| **Surface Dark** | `#111827` | Thẻ Card, Sidebar, container chính |
| **Surface Glass** | `rgba(17, 24, 39, 0.7)` | Khối kính mờ với `backdrop-blur-md` |
| **Border Glass** | `rgba(255, 255, 255, 0.08)`| Đường viền mỏng phân chia khung |
| **Accent Primary** | `#6366f1` (Indigo 500) | Nút bấm chính, trạng thái active, con trỏ focus |
| **Accent Secondary** | `#8b5cf6` (Purple 500) | Điểm nhấn phụ, tag badge, tab active |
| **Text Main** | `#f9fafb` | Tiêu đề chính và nội dung văn bản |
| **Text Muted** | `#9ca3af` | Văn bản phụ, chú thích, placeholder |
| **Destructive** | `#ef4444` (Red 500) | Nút xóa, cảnh báo lỗi nguy hiểm |
| **Success** | `#10b981` (Emerald 500)| Trạng thái công việc hoàn thành |

---

## 3. Typography & Spacing Grid

### Fonts System
- **Body Font**: `Inter`, sans-serif (Nội dung văn bản chính, bảng biểu).
- **Heading Font**: `Outfit`, sans-serif (Tiêu đề trang, widget chính).
- **Monospace Font**: `JetBrains Mono`, monospace (Cho mã code, mã định danh UUID).

### Base Grid 4px
Xây dựng trên hệ lưới cơ sở 4px: `4px`, `8px`, `12px`, `16px` (`space-4`), `24px`, `32px`, `48px`.

---

## 4. Responsive Breakpoints

```
sm: 640px    (Màn hình điện thoại ngang)
md: 768px    (Máy tính bảng Tablet)
lg: 1024px   (Laptop / Màn hình máy tính phổ thông)
xl: 1280px   (Màn hình Desktop làm việc)
2xl: 1536px  (Màn hình Siêu Rộng Ultra-wide)
```

---

## 5. UI Application States (Loading, Empty, Error)

1. **Loading State**:
   - Sử dụng Skeleton Loader (`@/components/ui/skeleton`) có kích thước tương đồng với dữ liệu sắp hiển thị.
   - Tuyệt đối không để màn hình trắng hoặc màn hình đen trống trong lúc đợi API response.
2. **Empty State**:
   - Hiển thị khối trung tâm gồm Lucide Icon trực quan, tiêu đề hướng dẫn, nội dung giải thích và nút bấm hành động tạo mới (Action CTA Button).
3. **Error State**:
   - Hiển thị hộp thông báo lỗi kèm nút bấm "Thử lại" (`Query.refetch()`) để khôi phục giao diện khi gặp sự cố mạng.
