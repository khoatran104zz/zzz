# TaskFlow Engineering Standard: Coding Guidelines (`coding-style.md`)

Tài liệu này quy định tiêu chuẩn lập trình sản xuất (Production-Ready Coding Standards) cho **TaskFlow** trên cả Frontend (TypeScript / Next.js 15) và Backend (Java 21 / Spring Boot 3.4).

---

## 1. General Principles (Nguyên Tắc Lập Trình)

### 1.1 SOLID Principles
- **Single Responsibility Principle (SRP)**: Mỗi class, module, function hoặc React component chỉ gánh vác duy nhất một trách nhiệm nghiệp vụ.
- **Open/Closed Principle (OCP)**: Mở rộng tính năng bằng cách thêm mới (interface, strategy), hạn chế chỉnh sửa mã nguồn cốt lõi đã chạy ổn định.
- **Liskov Substitution Principle (LSP)**: Lớp con phải thay thế hoàn hảo cho lớp cha mà không làm thay đổi tính đúng đắn của chương trình.
- **Interface Segregation Principle (ISP)**: Chia nhỏ interface thành các hợp đồng chuyên biệt.
- **Dependency Inversion Principle (DIP)**: Phụ thuộc vào abstraction (Interface), không phụ thuộc vào lớp triển khai cụ thể.

### 1.2 DRY (Don't Repeat Yourself) & KISS (Keep It Simple, Stupid)
- Không lặp lại logic nghiệp vụ. Trích xuất các hàm tiện ích dùng chung vào custom hooks hoặc domain services.
- Viết mã nguồn rõ ràng, dễ đọc cho người đến sau. Tránh việc "độ" code phức tạp không cần thiết.

### 1.3 YAGNI (You Aren't Gonna Need It) & Clean Code
- Chỉ triển khai đúng các tính năng theo yêu cầu hiện tại.
- Tên biến tự mô tả ý nghĩa (Self-documenting), phương thức ngắn gọn (< 20 dòng target, tối đa 50 dòng).

---

## 2. Naming Conventions (Quy Ước Đặt Tên)

| Đối Tượng | Ngôn Ngữ | Quy Ước | Ví Dụ |
| :--- | :--- | :--- | :--- |
| **Variables** | TS / Java | camelCase | `userStatus`, `activeWorkspaceId` |
| **Functions / Methods** | TS / Java | camelCase (Tiền tố động từ) | `findUserById()`, `calculateProgress()` |
| **Classes** | TS / Java | PascalCase | `WorkspaceService`, `TaskController` |
| **Interfaces (Backend)** | Java | PascalCase | `TaskService` (Impl: `TaskServiceImpl`) |
| **Interfaces (Frontend)**| TS | PascalCase | `WorkspaceProps`, `TaskItem` |
| **Enums** | TS / Java | PascalCase (Type), UPPER_SNAKE (Value) | `TaskStatus.IN_PROGRESS` |
| **DTOs** | Java | `[Domain][Action]Request` / `Response` | `CreateTaskRequest`, `UserDto` |
| **Entities** | Java | `[Domain]Entity` | `WorkspaceEntity`, `TaskEntity` |
| **Repositories** | Java | `[Domain]Repository` | `ProjectRepository` |
| **Controllers** | Java | `[Domain]Controller` | `WorkspaceController` |
| **Services** | Java | `[Domain]Service` / `[Domain]ServiceImpl` | `TaskService`, `TaskServiceImpl` |
| **React Components** | TSX | PascalCase | `WorkspaceBoardTab.tsx` |
| **React Hooks** | TS | camelCase bắt đầu bằng `use` | `useWorkspace.ts` |
| **Constants** | TS / Java | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS`, `JWT_SECRET` |

---

## 3. TypeScript & React 19 Rules

1. **Strict Mode**: `tsconfig.json` phải bật `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`.
2. **Cấm `any`**: Tuyệt đối KHÔNG dùng `any`. Hãy dùng type rõ ràng, Generics hoặc `unknown` kèm type guards.
3. **Zod Validation**: Mọi dữ liệu form đầu vào hoặc payload request API phải được kiểm tra qua Zod schema.
4. **React Server Components (RSC) First**:
   - Mặc định tất cả các trang và layout trong App Router là Server Components.
   - Chỉ thêm `'use client'` ở đầu file khi component cần dùng state hooks (`useState`, `useEffect`), event handlers hoặc browser APIs.
5. **Component Lines Limit (< 200 Lines)**: Mỗi file React component MUST giữ dưới 200 dòng code. Nếu vượt quá, phải tách nhỏ thành sub-components hoặc custom hooks.

```typescript
// Zod Schema & TypeScript Interface Example
import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
```

---

## 4. Java 21 & Spring Boot 3.4 Rules

1. **Constructor Injection Only (Cấm `@Autowired` trên field)**:
   - Các phụ thuộc MUST được tiêm qua Constructor Injection sử dụng Lombok `@RequiredArgsConstructor`.
   - ❌ **CẤM** dùng `@Autowired` trực tiếp trên private field.
2. **Sử Dụng Lombok Đóng Gói**:
   - Sử dụng `@Getter`, `@Setter` (khi cần), `@Builder`, `@RequiredArgsConstructor`, `@NoArgsConstructor(access = AccessLevel.PROTECTED)` cho JPA Entities.
   - ❌ **CẤM** dùng `@Data` trên JPA Entity để tránh lặp vô hạn `hashCode`/`toString`.
3. **Không Rò Rỉ JPA Entity Ra REST API**:
   - Database Entity (`*Entity.java`) **KHÔNG BAO GIỜ** được trả về trực tiếp ở REST Controller hoặc truyền qua public API contracts.
   - Luôn map Entity sang DTO (`*Dto.java`).
4. **Validation**: Annotate Request DTO với Jakarta validation (`@NotBlank`, `@NotNull`, `@Size`, `@Email`) và dùng `@Valid` ở Controller parameter.

```java
// Standard Spring Boot Controller Pattern
@RestController
@RequestMapping("/api/v1/workspaces")
@RequiredArgsConstructor
@Tag(name = "Workspace Management")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<ApiResponse<WorkspaceDto>> createWorkspace(
            @Valid @RequestBody CreateWorkspaceRequest request) {
        WorkspaceDto created = workspaceService.createWorkspace(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Workspace created successfully", created));
    }
}
```

---

## 5. Import Order Guidelines (TypeScript)

Import phải được sắp xếp theo các nhóm chuẩn:
1. Core packages (`react`, `next/*`)
2. External libraries (`lucide-react`, `@tanstack/react-query`, `zod`)
3. Alias paths (`@/components/ui`, `@/features/...`)
4. Relative paths (`./workspace-card`, `../types`)

```typescript
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/features/workspace/hooks/use-workspace';
```
