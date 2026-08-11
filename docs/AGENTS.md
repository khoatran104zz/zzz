# AGENTS.md - TaskFlow AI Constitution & Engineering Standards

> **Notice to AI Coding Assistants**:  
> Đây là hiến pháp kỹ thuật tối cao cho dự án **TaskFlow**. Mọi trợ lý AI (Antigravity, Cursor AI, Claude Code, GitHub Copilot, ChatGPT, v.v.) hoạt động trong repository này **BẮT BUỘC** phải tuân thủ nghiêm ngặt các quy tắc, mô hình kiến trúc, nguyên tắc lập trình và hướng dẫn trong tài liệu này.

---

## 1. Project Overview (Tổng Quan Dự Án)

### What is TaskFlow?
**TaskFlow** là nền tảng quản lý công việc và không gian làm việc nhóm (Enterprise Productivity & Workspace Collaboration Platform) được xây dựng theo chuẩn Jira / Confluence. Hệ thống được thiết kế theo kiến trúc **Domain-Driven Design (DDD) Feature-First Monorepo**, kết hợp giữa Frontend hiện đại (**Next.js 15/16 App Router + React 19 + TypeScript**) và Backend RESTful API vững chắc (**Spring Boot 3.4+ + Java 21 + PostgreSQL / Neon Cloud**), hỗ trợ Đa ngôn ngữ (Tiếng Việt / Tiếng Anh) cùng hệ thống phân quyền 3 cấp chuẩn RBAC.

### Completed System Capabilities
- **22 Backend DDD Bounded Context Modules**: `auth`, `user`, `workspace`, `project`, `task`, `board`, `checklist`, `comment`, `attachment`, `reminder`, `calendar`, `notification`, `activity`, `tag`, `search`, `wiki`, `whiteboard`, `automation`, `analytics`, `dashboard`, `ai`, `realtime`.
- **34 Flyway SQL Migrations**: Quản lý lịch sử tiến hóa schema CSDL tự động, đã seed sẵn phân quyền RBAC 3-Role và tài khoản Admin mặc định (`admin@gmail.com` / `12345678`).
- **28 Frontend Feature Modules**: Tùy chỉnh đầy đủ từ Summary Overview, Sprint Backlog, Kanban Board, Gantt Timeline, Wiki, Whiteboard Canvas đến Automation Engine và i18n Đa ngôn ngữ.

---

## 2. Architecture & Folder Rules (Kiến Trúc & Giới Hạn Thư Mục)

### Monorepo Structure
```
code/
├── frontend/          # Next.js 15/16 App Router (TypeScript, React 19, Tailwind CSS)
└── backend/           # Spring Boot 3.4+ / Java 21 (DDD Maven Monorepo)
docs/                  # Architecture specs, SRS, OpenAPI contracts, ERDs
scripts/               # Development and operational scripts
```

### Module Boundaries
1. **Feature-First Organization**: Code bắt buộc nhóm theo miền nghiệp vụ:
   - Frontend: `code/frontend/src/features/<feature-name>/...`
   - Backend: `code/backend/src/main/java/com/taskflow/modules/<module-name>/...`
2. **Forbidden Directory Creation**:
   - ❌ **TUYỆT ĐỐI KHÔNG** tạo file outside module structure.
   - ❌ **TUYỆT ĐỐI KHÔNG** tạo các thư mục rác như `utils/helpers/`, `misc/`, `temp/` ở root.
   - ❌ **TUYỆT ĐỐI KHÔNG** tạo kiến trúc Layer-First như `src/controllers`, `src/services` ở root backend.

---

## 3. Tech Stack Standard (Chuẩn Công Nghệ)

### Frontend
- **Framework**: Next.js 15/16 App Router (React 19)
- **Language**: TypeScript (Strict Mode Enabled)
- **Styling**: Tailwind CSS, Dark Glassmorphism, `shadcn/ui` primitives
- **State & Data**: Zustand (UI State), TanStack Query v5 (Server State), React Hook Form + Zod (Form Validation)
- **HTTP Client**: Axios với global JWT refresh interceptors
- **Icons**: Lucide Icons

### Backend
- **Framework**: Spring Boot 3.4+ / Java 21
- **Security**: Spring Security với stateless JWT Authentication & Refresh Token
- **Persistence**: Spring Data JPA, Hibernate, PostgreSQL
- **Migrations**: Flyway Versioned SQL Migrations (34 Scripts)
- **API Specs**: OpenAPI 3.0 / Swagger UI (`/swagger-ui.html`)
- **Utilities**: Lombok, Jakarta Validation

---

## 4. Coding & AI Rules (Quy Tắc Lập Trình & AI)

1. **SOLID, DRY, KISS, YAGNI**: Áp dụng triệt để các nguyên tắc thiết kế phần mềm tiêu chuẩn.
2. **Never Expose JPA Entities**: ❌ Database Entities (`*Entity.java`) **KHÔNG BAO GIỜ** được trả về trực tiếp ở REST Controllers hay lộ ra ngoài API contracts. Luôn map sang DTOs.
3. **Constructor Injection Only**: ❌ `@Autowired` trên private field là **HOÀN TOÀN BỊ CẤM**. Dùng Constructor Injection với Lombok `@RequiredArgsConstructor`.
4. **Service Isolation**: ❌ Service thuộc `Module A` **KHÔNG BAO GIỜ** được gọi trực tiếp `Repository` của `Module B`. Phải giao tiếp qua `Service` interface hoặc Event Publisher.
5. **React Component Line Limit (< 200 Lines)**: Mỗi file React component MUST giữ dưới 200 dòng code.
6. **No Placeholders or TODOs**: ❌ **TUYỆT ĐỐI KHÔNG** tạo code dở dang kiểu `// TODO: implement later` hoặc return fake dummy data.
7. **Always Search Before Creating**: Sử dụng `grep_search` / `list_dir` kiểm tra mã nguồn hiện có trước khi tạo thêm helper hoặc component mới.
inal outputs.
- **No Fake Implementations**: ❌ **NEVER** return hardcoded fake data in production controllers or dummy service returns. Build complete, working, production-grade implementations.

---
