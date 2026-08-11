# TaskFlow API Contract Specification (`docs/api-contract/README.md`)

Tất cả các API Endpoints trong hệ thống **TaskFlow** được xây dựng theo chuẩn RESTful OpenAPI 3.0, tiền tố `/api/v1/` và truy cập thử nghiệm trực tiếp qua **Swagger UI** (`/swagger-ui.html`).

---

## 1. Standard Response Envelope

### Success Response Envelope (`ApiResponse<T>`)
```json
{
  "code": 200,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": 1770000000000
}
```

### Error Response Envelope
```json
{
  "code": 400,
  "message": "Validation Failed",
  "data": null,
  "errors": [
    {
      "field": "title",
      "message": "Title must not be empty"
    }
  ],
  "timestamp": 1770000000000
}
```

---

## 2. API Endpoints Map (Danh Sách Endpoints Triển Khai)

| Controller Class | Base Path | Phân Nhóm Business Domain & Mục Đích |
| :--- | :--- | :--- |
| `AuthController` | `/api/v1/auth` | Đăng ký, Đăng nhập JWT, Refresh Token, Logout |
| `UserController` | `/api/v1/users` | Quản lý thông tin profile cá nhân, cài đặt người dùng |
| `AdminUserController` | `/api/v1/admin/users` | [ROLE_ADMIN] Quản trị tài khoản, khóa/mở tài khoản |
| `RoleController` | `/api/v1/roles` | [ROLE_ADMIN] Xem ma trận quyền & phân vai trò RBAC |
| `WorkspaceController` | `/api/v1/workspaces` | CRUD Workspace, gán vai trò thành viên |
| `InvitationController` | `/api/v1/workspaces/invitations` | Tạo & chấp nhận lời mời gia nhập Workspace qua Token |
| `ProjectController` | `/api/v1/projects` | Tạo & quản lý Dự án, danh sách tồn đọng Backlog |
| `TaskController` | `/api/v1/tasks` | CRUD Task, chuyển trạng thái To Do -> Done, đổi ưu tiên |
| `BoardController` | `/api/v1/boards` | Quản lý Bảng Kanban & tùy chỉnh cột Kanban |
| `TimelineController` | `/api/v1/timelines` | Sơ đồ Gantt Timeline & quản lý phụ thuộc (Dependencies) |
| `ChecklistController` | `/api/v1/checklists` | Thêm/sửa/xóa việc phụ checklist trong Task |
| `CommentController` | `/api/v1/comments` | Thảo luận comment, mention thành viên trong Task |
| `AttachmentController` | `/api/v1/attachments` | Upload & quản lý tệp đính kèm trong công việc |
| `TagController` | `/api/v1/tags` | Quản lý nhãn thẻ Tag đa dự án |
| `WikiController` | `/api/v1/wiki` | Bài viết tri thức Wiki, theo dõi lịch sử chỉnh sửa (Revisions) |
| `WhiteboardController` | `/api/v1/whiteboards` | Bảng vẽ phác thảo tương tác Whiteboard canvas |
| `CalendarController` | `/api/v1/calendar` | Sự kiện thời gian & tích hợp lịch công việc |
| `ReminderController` | `/api/v1/reminders` | Đặt lịch nhắc nhở tự động theo thời gian |
| `NotificationController` | `/api/v1/notifications` | Trung tâm thông báo hệ thống, đánh giá đã đọc |
| `AutomationController` | `/api/v1/automations` | Thiết lập quy tắc tự động hóa (Trigger -> Action) |
| `SearchController` | `/api/v1/search` | Tìm kiếm toàn cục, lưu bộ lọc tìm kiếm |
| `DashboardController` | `/api/v1/dashboard` | Thống kê số liệu báo cáo Dashboard theo vai trò |
| `AnalyticsController` | `/api/v1/analytics` | Phân tích sâu hiệu suất làm việc & biểu đồ |
| `ActivityLogController` | `/api/v1/activities` | Xem nhật ký lịch sử kiểm toán hoạt động hệ thống |
| `AiController` | `/api/v1/ai` | Gửi prompt & nhận phân rã công việc từ AI Assistant |
