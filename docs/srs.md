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

---

### 2.3 MÔ TẢ CHI TIẾT USE CASE 3.3.15 - XEM DASHBOARD

#### **Hình 3.15 Biểu đồ Use Case Xem Dashboard**
- **Tên Use Case**: Xem Dashboard (Dashboard Overview)
- **Actor**: Admin, Manager, Staff
- **Mục đích**: Cung cấp giao diện tổng quan giúp Admin, Manager và Staff theo dõi tình trạng Workspace, Project và tiến độ công việc trong hệ thống (tùy chỉnh phù hợp theo từng vai trò).
- **Tiền điều kiện**:
  1. Người dùng đã đăng nhập vào hệ thống.
  2. Người dùng (Admin, Manager hoặc Staff) có quyền truy cập Dashboard.
  3. Hệ thống có dữ liệu Workspace, Project hoặc Task để thống kê.

#### **Quy trình thực hiện chuẩn (Main Flow)**:
- **Bước 1**: Người dùng truy cập chức năng “Dashboard”.
- **Bước 2**: Hệ thống kiểm tra quyền truy cập và phân loại dữ liệu hiển thị theo vai trò người dùng (Admin xem toàn hệ thống, Manager xem Workspace/Project team, Staff xem công việc cá nhân).
- **Bước 3**: Hệ thống tải dữ liệu thống kê từ các Workspace và Project mà người dùng có quyền truy cập.
- **Bước 4**: Hệ thống hiển thị tổng quan số lượng Workspace, Project và Task.
- **Bước 5**: Hệ thống hiển thị biểu đồ phân bổ trạng thái Task (*To Do, In Progress, In Review, Done*).
- **Bước 6**: Hệ thống hiển thị biểu đồ phân bổ mức độ ưu tiên của Task (*Low, Medium, High, Urgent*).
- **Bước 7**: Hệ thống hiển thị thống kê số lượng Task đã hoàn thành trong 7 ngày gần nhất (Productivity Chart).
- **Bước 8**: Hệ thống hiển thị danh sách Task sắp đến hạn hoặc đã quá hạn (Overdue Alert List).

#### **Kịch bản phụ (Alternative & Exception Flows)**:
- **Trường hợp 1 (Lọc Dashboard theo thời gian - extend)**:
  1. Người dùng lựa chọn khoảng thời gian muốn xem (*Hôm nay, 7 ngày, 30 ngày*).
  2. Hệ thống cập nhật dữ liệu thống kê theo khoảng thời gian được chọn.
  3. Dashboard hiển thị lại các biểu đồ và số liệu tương ứng.
- **Trường hợp 2 (Xem Task sắp đến hạn hoặc quá hạn - extend)**:
  1. Người dùng chọn khu vực cảnh báo trên Dashboard.
  2. Hệ thống hiển thị danh sách các Task sắp đến hạn hoặc đã quá hạn.
  3. Người dùng có thể chọn Task để xem chi tiết.
- **Trường hợp 3 (Không có dữ liệu thống kê)**:
  1. Hệ thống không tìm thấy dữ liệu trong khoảng thời gian được chọn.
  2. Dashboard hiển thị trạng thái không có dữ liệu (Empty State).
  3. Hệ thống thông báo: *“Không có dữ liệu thống kê trong khoảng thời gian đã chọn.”*
- **Trường hợp 4 (Người dùng không có quyền truy cập)**:
  1. Người dùng truy cập Dashboard nhưng không có quyền.
  2. Hệ thống từ chối yêu cầu.
  3. Hiển thị thông báo: *“Bạn không có quyền truy cập Dashboard.”*
- **Trường hợp 5 (Lỗi hệ thống)**:
  1. Hệ thống gặp lỗi khi tải dữ liệu thống kê.
  2. Dashboard không thể hiển thị đầy đủ dữ liệu.
  3. Hệ thống thông báo: *“Không thể tải dữ liệu Dashboard, vui lòng thử lại sau.”*

#### **Hậu điều kiện (Post-conditions)**:
- **Nếu thành công**: Dashboard hiển thị các số liệu và biểu đồ mới nhất. Admin, Manager và Staff có thể theo dõi tình hình hoạt động của hệ thống và công việc cá nhân. Không có dữ liệu nghiệp vụ bị thay đổi.
- **Nếu thất bại**: Dashboard không hiển thị đầy đủ dữ liệu. Dữ liệu Workspace, Project và Task không bị thay đổi. Người dùng có thể thử tải lại Dashboard sau.

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
