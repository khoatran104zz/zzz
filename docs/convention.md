# TaskFlow Engineering & Coding Standards (`convention.md`)

Tài liệu này tóm tắt các quy chuẩn lập trình bắt buộc và mô hình kiến trúc cốt lõi cho toàn bộ dự án **TaskFlow**.

---

## 1. Core Engineering Principles

- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
- **Clean Code & DDD**: Mã nguồn tự mô tả ý nghĩa, đóng gói theo 22 Domain Modules, không tạo magic numbers hay mã rác dư thừa.
- **DRY & KISS**: Tối ưu hóa tính tái sử dụng, không lặp lại logic nghiệp vụ, giữ giải pháp lập trình đơn giản và hiệu quả.

---

## 2. Backend Conventions (Java 21 / Spring Boot 3.4)

### 2.1 Package Hierarchy
```
com.taskflow.modules.<module_name>/
├── controller/        # REST Endpoints (@RestController)
├── service/           # Domain Service Interfaces
│   └── impl/          # Concrete Implementations
├── repository/        # Spring Data JPA Repositories
├── entity/            # JPA Entities (@Entity)
├── dto/               # Request & Response DTOs
├── mapper/            # DTO <-> Entity Mappers
├── validator/         # Domain Validation Rules
└── specification/     # Dynamic JPA Search Criteria
```

### 2.2 Entity & Database Standards
- Tất cả các thực thể CSDL MUST kế thừa audit fields từ `BaseEntity` (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`).
- Khóa chính MUST dùng kiểu `UUID` (`gen_random_uuid()`).
- Mối quan hệ JPA MUST đặt `fetch = FetchType.LAZY`.
- Schema CSDL được quản lý bởi 34 scripts Flyway Versioned Migrations.

### 2.3 API Response Wrapper
Tất cả REST Controllers MUST trả về `ApiResponse<T>`:
```json
{
  "code": 200,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": 1770000000000
}
```

---

## 3. Frontend Conventions (Next.js 15 / React 19 / TypeScript)

### 3.1 Directory Structure
- Logic tính năng đặt trong `src/features/<feature-name>`.
- Reusable UI primitives đặt trong `@/components/ui`.
- Trang và Layout thuộc Next.js App Router đặt trong `src/app/`.

### 3.2 Component Guidelines
- Render theo cơ chế React Server Components (`RSC`) mặc định.
- Chỉ thêm `'use client'` khi có tương tác state hoặc browser events.
- Form inputs sử dụng `react-hook-form` kết hợp validation qua `zod`.
- Quản lý bất đồng bộ server state qua `TanStack Query (v5)`, UI state qua `Zustand`.
- File React Component không vượt quá **200 dòng code**.
