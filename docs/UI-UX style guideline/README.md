# TaskFlow UI/UX Design System Guidelines (`docs/UI-UX style guideline/README.md`)

**TaskFlow** mang lại trải nghiệm giao diện người dùng tối ưu năng suất (High-Productivity UX), ứng dụng ngôn ngữ thiết kế **Dark Glassmorphism** hiện đại, trực quan, tương tác mượt mà và tương thích đa ngôn ngữ.

---

## 1. Core Design Tokens

### Color Palette Tokens
- **Background Deep**: `#090d16` (Nền chiều sâu ứng dụng)
- **Surface Dark**: `#111827` (Card / Thẻ container chính)
- **Surface Glass**: `rgba(17, 24, 39, 0.7)` kết hợp `backdrop-filter: blur(12px)`
- **Accent Primary**: `#6366f1` (Indigo 500 - Điểm nhấn nút hành động chính)
- **Accent Secondary**: `#8b5cf6` (Purple 500 - Nút phụ & trạng thái active)
- **Text Main**: `#f9fafb` (Chữ tiêu đề & nội dung chính)
- **Text Muted**: `#9ca3af` (Chữ chú thích & placeholder)

### Typography Tokens
- **Primary Body Font**: `Inter`, sans-serif
- **Heading Font**: `Outfit`, sans-serif
- **Code & Identifier Font**: `JetBrains Mono`, monospace

### UI Micro-Animations
- Smooth hover elevation: `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`
- Nút bấm bấm xuống (Active scale): `active:scale-[0.98]`
- Framer Motion scale for modals & drawers.

---

## 2. Accessibility & i18n Rules

1. **Accessibility (WCAG 2.1 AA)**:
   - Tỷ lệ tương phản chữ/nền tối thiểu **4.5:1**.
   - Phím tắt bàn phím (`Tab`, `Enter`, `Escape`) chuyển trạng thái trực quan với focus ring `focus-visible:ring-indigo-500`.
2. **i18n Multi-language Layout**:
   - Sử dụng các chuỗi dịch thuật i18n (`vi`, `en`) linh hoạt mà không cố định chiều rộng pixel cứng (width) để tránh bị vỡ layout khi chuyển ngữ.
