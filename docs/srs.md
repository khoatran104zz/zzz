# Software Requirements Specification (SRS) - TaskFlow Platform

## 1. Introduction (Giới Thiệu Tổng Quan)

### 1.1 Purpose (Mục Đích)
Tài liệu này xác định các yêu cầu phần mềm chi tiết cho **TaskFlow**, hệ thống quản lý công việc, lập kế hoạch dự án và không gian làm việc nhóm (Enterprise Productivity & Workspace Collaboration Platform). Tài liệu là cơ sở chuẩn mực để thiết kế kiến trúc, phát triển mã nguồn, kiểm thử phần mềm và làm tài liệu phục vụ báo cáo đồ án tốt nghiệp.

### 1.2 Scope (Phạm Vi Hệ Thống)
TaskFlow giải quyết bài toán quản trị công việc cá nhân và tổ chức theo chuẩn Agile/Scrum (Jira & Confluence alternative). Hệ thống mở rộng từ quản lý tác vụ đơn lẻ đến phân quyền đa cấp trong Workspace doanh nghiệp, hỗ trợ quản lý tiến độ (Kanban, Gantt Timeline, Sprint Backlog), kho tri thức (Wiki), bảng phác thảo (Whiteboard), tự động hóa (Automation) và hỗ trợ thông minh từ AI Assistant.

### 1.3 Core Business Functional Scope (17 Chức Năng Nghiệp Vụ Cốt Lõi)
Đề tài tập trung xây dựng 17 chức năng nghiệp vụ chính phục vụ quá trình quản lý công việc và cộng tác nhóm:

1. **Quản lý tài khoản & Xác thực người dùng (Auth & User Profile)**: Đăng ký, đăng nhập (JWT + Refresh Token), quản lý thông tin cá nhân và kiểm soát phiên đăng nhập.
2. **Workspace (Không gian quản lý & cộng tác chung)**: Cho phép tạo Workspace, quản lý thành viên, mời thành viên (Email/Token link) và kiểm soát quyền truy cập RBAC.
3. **Quản lý Project**: Cho phép tổ chức các dự án trong Workspace và quản lý các công việc thuộc từng dự án.
4. **Quy trình quản lý công việc theo cấu trúc `Project` → `Sprint/Backlog` → `Issue/Task` → `Checklist`**: Hỗ trợ tạo, cập nhật, phân công và theo dõi vòng đời của công việc.
5. **Hệ thống Status & Priority**: 
   - Vòng đời công việc theo trạng thái: `To Do` → `In Progress` → `In Review` → `Done`.
   - Mức độ ưu tiên: `Low` → `Medium` → `High` → `Urgent`.
6. **Sprint và Backlog**: Hỗ trợ lập kế hoạch Sprint, quản lý danh sách công việc tồn đọng (Backlog) và theo dõi tiến độ thực hiện trong từng Sprint.
7. **Kanban Board**: Trực quan hóa các Task theo từng Status và hỗ trợ thao tác kéo-thả (Drag & Drop) để cập nhật trạng thái công việc.
8. **Timeline / Gantt**: Theo dõi công việc theo thời gian và thể hiện mối quan hệ phụ thuộc giữa các Task như `BLOCKS`, `BLOCKED_BY`, `DUPLICATES` và `RELATES_TO`.
9. **Checklist, Comment và Attachment**: Chia nhỏ công việc thành các nhiệm vụ phụ (Checklist), trao đổi thông tin giữa các thành viên (Comment & Mention) và đính kèm tài liệu liên quan (Attachment).
10. **Calendar và Reminder**: Quản lý thời hạn (Due dates), lịch làm việc (Calendar events) và nhắc nhở tự động các công việc cần thực hiện (Reminders).
11. **Dashboard và Analytics**: Cung cấp các chỉ số và biểu đồ trực quan (Donut chart, Line chart) về số lượng công việc, trạng thái, mức độ ưu tiên, tiến độ và danh sách công việc quá hạn (Overdue Alert List).
12. **Docs / Wiki**: Cho phép lưu trữ và tổ chức tài liệu, tri thức của Workspace theo cấu trúc phân cấp (Page Tree) và hỗ trợ lưu lịch sử chỉnh sửa thông qua `Page Revisions`.
13. **Whiteboard**: Cung cấp không gian trực quan (Canvas) để thành viên phác thảo ý tưởng, vẽ tư duy và cộng tác trực tiếp.
14. **Forms**: Hỗ trợ thu thập yêu cầu hoặc thông tin từ người dùng và tự động tạo Task từ dữ liệu biểu mẫu.
15. **Automation Rules**: Cho phép thiết lập các quy tắc tự động hóa theo mô hình `Trigger` → `Action`, nhằm giảm các thao tác thủ công trong quá trình quản lý công việc.
16. **Notification và Activity Log**: Giúp người dùng nhận biết các thay đổi liên quan đến công việc thời gian thực (Notification), đồng thời hỗ trợ theo dõi nhật ký lịch sử hoạt động trong hệ thống (Activity Log).
17. **Search và Tag**: Hỗ trợ tìm kiếm toàn cục (Global Search, Saved Filters) và phân loại các đối tượng bằng Thẻ Tag nhằm nâng cao khả năng quản lý và truy xuất thông tin.

---

## 2. Overall Description (Mô Tả Tổng Quan)

### 2.1 Product Evolution Roadmap (Lộ Trình Phát Triển 5 Phase)

- **Phase 1: Personal Task Management (Quản Lý Công Việc Cá Nhân)**
  - Quản lý công việc (Task), dự án (Project), không gian (Workspace), thẻ (Tag) và nhắc nhở (Reminder).
  - Quản lý danh sách việc phụ (Checklists), mức độ ưu tiên (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) và trạng thái công việc (`TO_DO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`).

- **Phase 2: Team Workspaces & Enterprise 3-Role Model (Phân Quyền Doanh Nghiệp 3 Vai Trò)**
  - Phân vùng dữ liệu đa người dùng (Multi-tenant Workspace Partitioning).
  - Phân quyền theo vai trò (Role-Based Access Control - RBAC) với 3 cấp độ tài khoản:
    1. **Quản trị viên (Admin - `ROLE_ADMIN` / `ADMIN`)**: Quản trị toàn bộ người dùng hệ thống, theo dõi nhật ký hoạt động (Audit Logs), xem biểu đồ báo cáo toàn thể, quản lý phân quyền và cấu hình hệ thống.
    2. **Quản lý (Manager - `ROLE_MANAGER` / `MANAGER`)**: Quản lý Workspace/Project, lập kế hoạch Sprint, điều phối danh sách tồn đọng (Backlog), phân công công việc cho nhân viên, quản lý biểu mẫu (Forms) và xem báo cáo hiệu suất team.
    3. **Nhân viên (Staff - `ROLE_USER` / `MEMBER`)**: Thực thi công việc cá nhân được giao, cập nhật tiến độ (To Do -> In Progress -> Done), thêm checklist phụ, thảo luận (Comment), tải tệp đính kèm và tạo tài liệu Wiki.

- **Phase 3: Productivity Extensions (Mở Rộng Năng Suất Tối Ưu)**
  - Bảng Kanban tương tác kéo thả linh hoạt, sơ đồ Gantt Timeline quản lý phụ thuộc (Task Dependencies), kho tri thức Docs/Wiki lưu vết phiên bản, Bảng vẽ tư duy Whiteboard và Tự động hóa quy trình (Automation Rules).

- **Phase 4: Intelligent AI Assistant (Trợ Lý AI Thông Minh)**
  - Tự động phân rã tác vụ (Task Breakdown), tóm tắt tiến độ dự án tự động và gợi ý lập lịch làm việc tối ưu qua mô hình ngôn ngữ lớn (LLM).

- **Phase 5: Native Cross-Platform Integration (Tích Hợp Đa Nền Tảng)**
  - Mở rộng ứng dụng di động (React Native) tái sử dụng 100% chuẩn payload RESTful API của hệ thống Backend.

---

### 2.2 Enterprise Permission Matrix (Ma Trận Phân Quyền 3 Role)

> [!NOTE]
> **Quyền hạn toàn năng của Admin**: Admin có quyền tối cao truy cập và quản trị toàn bộ dữ liệu, người dùng và thiết lập trong hệ thống.

| STT | Mã Use Case | Tên Use Case Kịch Bản | Admin (`ROLE_ADMIN`) | Manager (`ROLE_MANAGER`) | Staff (`ROLE_USER`) |
| :---: | :---: | :--- | :---: | :---: | :---: |
| 1 | UC-01 | Đăng ký & Đăng nhập tài khoản (Auth) | ✅ | ✅ | ✅ |
| 2 | UC-02 | Quản lý người dùng hệ thống (Admin Users) | ✅ | ❌ | ❌ |
| 3 | UC-03 | Quản lý Vai trò & Phân quyền (RBAC Matrix) | ✅ | ❌ | ❌ |
| 4 | UC-04 | Xem Nhật ký hệ thống (System Audit Logs) | ✅ | ❌ | ❌ |
| 5 | UC-05 | Tạo & Quản lý Workspace | ✅ | ✅ | ❌ |
| 6 | UC-06 | Mời & Quản lý thành viên Workspace | ✅ | ✅ | ❌ |
| 7 | UC-07 | Tạo & Quản lý Dự án (Project Management) | ✅ | ✅ | ❌ |
| 8 | UC-08 | Quản lý Biểu mẫu yêu cầu (Forms Builder) | ✅ | ✅ | ❌ |
| 9 | UC-09 | Lập kế hoạch Sprint & Backlog | ✅ | ✅ | 👁️ (Xem) |
| 10 | UC-10 | Tạo & Phân công Công việc (Task Assignment) | ✅ | ✅ | ✅ (Công việc mình tạo) |
| 11 | UC-11 | Cập nhật tiến độ & Trạng thái Task | ✅ | ✅ | ✅ (Công việc được giao) |
| 12 | UC-12 | Quản lý Checklist phụ & Comment | ✅ | ✅ | ✅ |
| 13 | UC-13 | Tương tác Bảng Kanban Drag-and-Drop | ✅ | ✅ | ✅ |
| 14 | UC-14 | Xem Sơ đồ Gantt Timeline & Phụ thuộc | ✅ | ✅ | ✅ |
| 15 | UC-15 | Xem Báo cáo Dashboard & Analytics | ✅ (Toàn hệ thống) | ✅ (Workspace team) | ✅ (Cá nhân) |
| 16 | UC-16 | Quản lý Tri thức Wiki & Whiteboard | ✅ | ✅ | ✅ |
| 17 | UC-17 | Cấu hình Quy tắc Tự động hóa (Automation) | ✅ | ✅ | ❌ |

---

## 3. Detailed Use Case Specifications (Mô Tả Chi Tiết Use Case)

### 3.1 USE CASE UC-15: XEM DASHBOARD (DASHBOARD OVERVIEW)

- **Actor**: Admin, Manager, Staff.
- **Mục đích**: Cung cấp giao diện tổng quan giúp theo dõi tình trạng Workspace, phân bổ trạng thái công việc, tiến độ thực hiện và cảnh báo công việc quá hạn.
- **Tiền điều kiện**: Người dùng đã xác thực JWT thành công.

#### **Luồng thực hiện chính (Main Flow)**:
1. Người dùng truy cập menu **Dashboard**.
2. Backend kiểm tra Token JWT và vai trò (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_USER`).
3. Hệ thống truy vấn dữ liệu thống kê phù hợp với scope phân quyền.
4. Hiển thị Widget số liệu tổng quan (Tổng số Workspace, Project, Task hoàn thành).
5. Hiển thị Biểu đồ Donut phân bổ trạng thái Task (*To Do, In Progress, In Review, Done*).
6. Hiển thị Biểu đồ Phân bổ mức độ ưu tiên (*Low, Medium, High, Urgent*).
7. Hiển thị Biểu đồ đường (Line Chart) theo dõi năng suất làm việc 7 ngày gần nhất.
8. Hiển thị danh sách cảnh báo công việc quá hạn hoặc sắp đến hạn (Overdue Alert List).

#### **Luồng ngoại lệ & Kịch bản phụ (Alternative Flows)**:
- **Lọc theo thời gian**: Người dùng thay đổi mốc thời gian (7 ngày, 30 ngày) -> Hệ thống re-query dữ liệu biểu đồ.
- **Không có dữ liệu**: Hiển thị trạng thái Empty State rỗng kèm thông báo *"Chưa có dữ liệu thống kê trong khoảng thời gian này"*.

---

### 3.2 USE CASE UC-13: QUẢN LÝ BẢNG KANBAN (KANBAN BOARD INTERACTION)

- **Actor**: Admin, Manager, Staff.
- **Mục đích**: Cho phép kéo thả thẻ công việc giữa các cột trạng thái (*To Do -> In Progress -> In Review -> Done*) để cập nhật tiến độ công việc tức thì.
- **Tiền điều kiện**: Người dùng có quyền truy cập vào Project/Workspace tương ứng.

#### **Luồng thực hiện chính (Main Flow)**:
1. Người dùng mở tab **Board** trong Workspace.
2. Hệ thống tải danh sách các cột (Board Columns) và thẻ công việc (Task Cards) theo vị trí `position`.
3. Người dùng kéo thẻ Task từ cột *In Progress* thả sang cột *Done*.
4. Frontend cập nhật giao diện ngay lập tức (Optimistic Update).
5. Frontend gửi yêu cầu `PATCH /api/v1/tasks/{taskId}/status` lên Backend.
6. Backend ghi lại lịch sử thay đổi vào `activity_logs` và trả về `200 OK`.

---

### 3.3 USE CASE UC-16: QUẢN LÝ KHO TRI THỨC (DOCS & WIKI MANAGEMENT)

- **Actor**: Admin, Manager, Staff.
- **Mục đích**: Cho phép tạo, chỉnh sửa và quản lý các tài liệu kho tri thức dự án với khả năng lưu vết lịch sử phiên bản (Revisions).
- **Tiền điều kiện**: Người dùng thuộc Workspace tương ứng.

#### **Luồng thực hiện chính (Main Flow)**:
1. Người dùng chọn tab **Docs** trong Workspace.
2. Hiển thị danh mục tài liệu cây phân cấp (Wiki Page Tree).
3. Người dùng tạo bài viết mới hoặc chỉnh sửa nội dung bài viết hiện có.
4. Nhấn **Save / Lưu bài**: Hệ thống gửi payload `POST /api/v1/wiki/pages` lên Backend.
5. Backend lưu bản ghi mới vào bảng `wiki_pages` và tự động tạo bản ghi lịch sử trong `wiki_page_revisions`.

---

## 4. Non-Functional Requirements (Yêu Cầu Phi Chức Năng)

### 4.1 Performance (Hiệu Năng Systems)
- Thời gian phản hồi API (Latency p95) **< 200ms** cho các tác vụ CRUD thông thường.
- Hỗ trợ tải dữ liệu phân trang (Pagination offset/limit) tối đa 100 bản ghi mỗi request.
- Cơ chế React Server Components & TanStack Query caching giúp giảm 60% lưu lượng request dư thừa từ Client.

### 4.2 Security (Bảo Mật)
- Xác thực chuẩn **Stateless JWT** (HMAC-SHA512 key 256-bit).
- Mã hóa mật khẩu người dùng bằng thuật toán **BCrypt** (Strength factor 10).
- Chống các lỗ hổng bảo mậtOWASP Top 10 (SQL Injection via JPA Parametrized Queries, XSS Sanitization, CORS Configuration, Rate Limiting).

### 4.3 Scalability & Reliability (Khả Năng Mở Rộng & Độc Lập Module)
- Backend được thiết kế theo chuẩn Domain-Driven Design (DDD) giúp sẵn sàng tách thành các Spring Boot Microservices độc lập trong tương lai.
- Cơ sở dữ liệu PostgreSQL kết nối qua HikariCP connection pool, tương thích hoàn hảo với môi trường Serverless Neon DB.

