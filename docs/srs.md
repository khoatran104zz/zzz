# Software Requirements Specification (SRS) - TaskFlow

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for **TaskFlow**, an enterprise-grade personal productivity and workspace platform designed to streamline task management, project execution, calendar scheduling, team collaboration, and AI-assisted workflows.

### 1.2 Scope
TaskFlow provides a multi-phase system architecture supporting single-user personal task organization up to multi-tenant workspace administration.

---

## 2. Overall Description

### 2.1 Product Phases

- **Phase 1: Personal Task Management**
  - Core Task, Project, Workspace, Tag, and Reminders modeling.
  - Subtask checklists, status tracking, and priority management.

- **Phase 2: Team Workspaces & Enterprise 3-Role Model**
  - Multi-tenant workspace partitioning.
  - Fine-grained Role-Based Access Control (RBAC) supporting 3 enterprise account roles:
    - **Quản trị viên (Admin - `ROLE_ADMIN` / `ADMIN`)**: Quản trị toàn bộ hệ thống & workspace, quản lý user, xem nhật ký hệ thống (Audit Logs), thống kê toàn thể.
    - **Quản lý (Manager - `ROLE_MANAGER` / `MANAGER`)**: Điều phối dự án, lập kế hoạch Sprint, giao việc cho nhân viên, quản lý Backlog & xem báo cáo hiệu suất team.
    - **Nhân viên (Staff - `ROLE_USER` / `MEMBER`)**: Thực thi công việc cá nhân được giao, cập nhật tiến độ task (To Do -> Done), thêm checklist, thảo luận và làm việc cá nhân.

### 2.2 Enterprise Permission Matrix (Ma trận phân quyền 3 Role)

### 2.2 MA TRẬN PHÂN QUYỀN VÀ USE CASE (USE CASE & ACTOR MATRIX)

> [!NOTE]
> **Quyền hạn toàn năng của Admin**: Admin có quyền quản lý đối với mọi tác vụ trong hệ thống.

| STT | Mục | Use Case chính | Actor Được Phép Thực Hiện |
| :---: | :---: | :--- | :--- |
| 1 | 3.3.3 | Đăng ký tài khoản | Admin / Manager / Staff |
| 2 | 3.3.4 | Đăng nhập | Admin / Manager / Staff |
| 3 | 3.3.5 | Tạo Workspace | Admin / Manager |
| 4 | 3.3.6 | Quản lý Workspace | Admin / Manager |
| 5 | 3.3.7 | Quản lý thành viên | Admin / Manager |
| 6 | 3.3.8 | Quản lý biểu mẫu yêu cầu | Admin / Manager |
| 7 | 3.3.9 | Tạo Task | Admin / Manager / Staff |
| 8 | 3.3.10 | Quản lý Task | Admin / Manager / Staff |
| 9 | 3.3.11 | Quản lý Sprint | Admin / Manager |
| 10 | 3.3.12 | Quản lý Backlog | Admin / Manager / Staff |
| 11 | 3.3.13 | Quản lý Kanban Board | Admin / Manager / Staff |
| 12 | 3.3.14 | Xem Timeline | Admin / Manager / Staff |
| 13 | 3.3.15 | Xem Dashboard | Admin / Manager / Staff |
| 14 | 3.3.16 | Quản lý Docs/Wiki | Admin / Manager / Staff |
| 15 | 3.3.17 | Quản lý thông báo | Admin / Manager / Staff |

- **Phase 3: Productivity Extensions**
  - Interactive Kanban boards, integrated Calendar views, rich Notes, and Habit Tracking.

- **Phase 4: Intelligent AI Assistant**
  - Contextual task breakdown, natural language scheduling, and smart daily summaries.

- **Phase 5: Native Mobile Client Integration**
  - Cross-platform mobile clients reusing identical backend REST API payloads.

---

## 3. Architecture & Domain Model

TaskFlow adopts Domain-Driven Design (DDD) with a Feature-First modular strategy.

```
com.taskflow.modules/
├── auth          # Authentication, token generation, credentials verification
├── user          # User profile state & security credentials
├── workspace     # Multi-tenant workspace container
├── project       # Logical groupings of work items
├── task          # Core task entity, checklists, status lifecycle
├── calendar      # Temporal events & synchronization placeholders
├── notification  # Real-time and scheduled notifications
├── reminder      # System and email notification alerts
├── attachment    # File asset meta storage
├── activity      # System audit trails and user activity logging
└── ai            # AI agent orchestration and prompt dispatching
```

---

## 4. Non-Functional Requirements

### 4.1 Performance
- API response times under 200ms for p95 requests.
- Statelss JWT authentication with sliding session refresh mechanisms.

### 4.2 Scalability
- Horizontal scaling capability for stateless Spring Boot backend nodes.
- PostgreSQL database partitioning and connection pooling managed via Neon Serverless.
