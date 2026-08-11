# TaskFlow Architecture Decision Records (`decision-log.md`)

Nhật ký ghi nhận các quyết định kiến trúc quan trọng (ADR) trong quá trình phát triển hệ thống **TaskFlow**. Mỗi bản ghi ADR trình bày bối cảnh, lý do lựa chọn, ưu/nhược điểm và hệ quả kỹ thuật.

---

## ADR-001: Selection of Monorepo Repository Structure

- **Status**: Accepted (Đã phê duyệt)
- **Date**: 2026-07-30
- **Context**: TaskFlow cần sự phối hợp chặt chẽ giữa Next.js Frontend, Spring Boot Backend API, CSDL Flyway SQL migrations và tài liệu kiến trúc `docs/`. Việc chia nhiều repository tạo ra sự lệch pha mã nguồn và phức tạp CI/CD.
- **Decision**: Áp dụng cấu trúc Monorepo duy nhất (`code/frontend`, `code/backend`, `docs/`, `scripts/`).
- **Consequences**: Single source of truth, commit đồng bộ tính năng giữa client và server, đơn giản hóa môi trường phát triển cục bộ.

---

## ADR-002: Next.js 15/16 (App Router) for Frontend Framework

- **Status**: Accepted (Đã phê duyệt)
- **Date**: 2026-07-30
- **Context**: Frontend cần tốc độ tải trang ban đầu nhanh, SEO tối ưu, hỗ trợ layout lồng nhau (nested layouts) cho bảng điều khiển Workspace phức tạp.
- **Decision**: Lựa chọn **Next.js 15/16** hỗ trợ React 19 và App Router Architecture.
- **Consequences**: Tối ưu dung lượng JavaScript nhờ React Server Components (RSC); tích hợp sẵn route handlers, font & image optimization.

---

## ADR-003: Spring Boot 3.4+ & Java 21 LTS for Backend Framework

- **Status**: Accepted (Đã phê duyệt)
- **Date**: 2026-07-30
- **Context**: Hệ thống Backend phải xử lý yêu cầu API với độ tin cậy chuẩn doanh nghiệp, bảo mật vững chắc và duy trì tính ổn định lâu dài.
- **Decision**: Chọn **Spring Boot 3.4+** trên môi trường runtime **Java 21 LTS**.
- **Consequences**: Hiệu năng cao nhờ Java 21 Virtual Threads (Project Loom); hệ sinh thái Spring Security, Spring Data JPA và OpenAPI tích hợp sẵn.

---

## ADR-004: PostgreSQL (Neon Serverless Cloud) for Relational Database

- **Status**: Accepted (Đã phê duyệt)
- **Date**: 2026-07-30
- **Context**: TaskFlow đòi hỏi tính toàn vẹn dữ liệu ACID cho quan hệ phân quyền, workspace, dự án và tác vụ.
- **Decision**: Sử dụng **PostgreSQL** kết hợp môi trường **Neon Serverless PostgreSQL** cho cloud staging/production và PostgreSQL local cho phát triển.
- **Consequences**: Hỗ trợ kiểu dữ liệu `UUID` bản địa, `JSONB` cho metadata động, cơ chế DB branching linh hoạt của Neon DB.

---

## ADR-005: Domain-Driven Design (DDD) Architecture

- **Status**: Accepted (Đã phê duyệt)
- **Date**: 2026-07-30
- **Context**: Khi dự án mở rộng với nhiều module (Wiki, Whiteboard, Timeline, Automation, AI), mã nguồn đơn khối không ranh giới sẽ dẫn đến coupling cao.
- **Decision**: Phân rã hệ thống thành 22 **DDD Bounded Context Modules** độc lập.
- **Consequences**: Tính đóng gói cao, giao tiếp strictly qua Service Interfaces/Events, sẵn sàng tách thành Microservices trong tương lai.

---

## ADR-006: Feature-First Folder Organization

- **Status**: Accepted (Đã phê duyệt)
- **Date**: 2026-07-30
- **Context**: Việc điều hướng file trong dự án lớn rất tốn thời gian nếu tách riêng các thư mục `controllers`, `services`, `components` ở thư mục gốc.
- **Decision**: Gom nhóm mã nguồn theo tính năng (**Feature-First**): `com.taskflow.modules.<module>` ở backend và `src/features/<feature>` ở frontend.
- **Consequences**: Giúp việc xem code, mở rộng và bảo trì tính năng trở nên vô cùng thuận tiện.

---

## ADR-007: Stateless JWT Authentication with Refresh Tokens

- **Status**: Accepted (Đã phê duyệt)
- **Date**: 2026-07-30
- **Context**: Cần cơ chế xác thực stateless hỗ trợ cả Web Dashboard hiện tại và ứng dụng di động trong tương lai.
- **Decision**: Áp dụng **JWT Authentication** với Access Token ngắn hạn (15 phút) và Refresh Token qua Cookie HttpOnly (7 ngày).
- **Consequences**: Kiến trúc server hoàn toàn stateless, dễ mở rộng scale ngang mà không phụ thuộc vào session storage.

---

## ADR-008: Flyway for Versioned Database Migrations (34 Scripts)

- **Status**: Accepted (Đã phê duyệt)
- **Date**: 2026-07-30
- **Context**: Schema CSDL cần được quản lý phiên bản nghiêm ngặt, lặp lại nhất quán giữa các môi trường dev và production.
- **Decision**: Sử dụng **Flyway SQL Migrations** (đã khởi tạo 34 scripts versioned migrations).
- **Consequences**: Quản lý lịch sử thay đổi schema CSDL tự động khi khởi chạy backend.

---

## ADR-009: TanStack Query (v5) for Async Server State Management

- **Status**: Accepted (Đã phê duyệt)
- **Date**: 2026-07-30
- **Context**: Client cần cơ chế fetch dữ liệu, caching, tự động refetch ngầm và optimistic updates mà không phải viết `useEffect` thủ công.
- **Decision**: Chọn **TanStack Query (v5)** quản lý bất đồng bộ dữ liệu server phía client.
- **Consequences**: Loại bỏ mã lặp quản lý loading/error state, tự động cache và làm mới dữ liệu thông minh.

---

## ADR-010: Zustand for Client UI State Management

- **Status**: Accepted (Đã phê duyệt)
- **Date**: 2026-07-30
- **Context**: Trạng thái UI tạm thời (như trạng thái đóng/mở sidebar, modal ID active, bộ lọc giao diện) cần nơi lưu trữ độc lập với server state.
- **Decision**: Chọn **Zustand** quản lý UI State toàn cục phía client.
- **Consequences**: Thư viện siêu nhẹ (~1KB), API đơn giản, không làm dư thừa render tree như React Context API.
