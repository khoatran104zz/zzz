# 📋 TaskFlow - Enterprise Productivity & Workspace Collaboration Platform

**TaskFlow** là hệ thống quản lý công việc, không gian làm việc nhóm (Workspace Collaboration) và kho tri thức tích hợp chuẩn doanh nghiệp (Jira / Confluence / Trello alternative). Hệ thống được thiết kế theo kiến trúc **Domain-Driven Design (DDD) Feature-First Monorepo**, kết hợp giữa Frontend hiện đại (**Next.js 15/16 App Router + React 19 + TypeScript**) và Backend RESTful API vững chắc (**Spring Boot 3.4+ + Java 21 + PostgreSQL / Neon Cloud**), hỗ trợ Đa ngôn ngữ (Tiếng Việt / Tiếng Anh) cùng hệ thống phân quyền 3 cấp chuẩn RBAC.

---

## 🚀 1. Các Tính Năng Nghiệp Vụ Cốt Lõi (17 Key Business Modules)

1. **🔐 Quản lý tài khoản & Xác thực người dùng (Auth & Profile)**: Đăng ký, đăng nhập (Stateless JWT + Refresh Token), quản lý thông tin cá nhân và kiểm soát phiên đăng nhập.
2. **🏢 Workspace (Không gian quản lý & cộng tác chung)**: Cho phép tạo Workspace, quản lý thành viên, mời thành viên qua Email/Link Token và kiểm soát quyền truy cập RBAC.
3. **📁 Quản lý Project**: Tổ chức các dự án trong Workspace và quản lý các công việc thuộc từng dự án.
4. **🔄 Quy trình quản lý công việc phân cấp `Project` → `Sprint/Backlog` → `Issue/Task` → `Checklist`**: Tạo, cập nhật, phân công và theo dõi toàn bộ vòng đời của công việc.
5. **🏷️ Hệ thống Status & Priority**:
   - Vòng đời trạng thái: `To Do` → `In Progress` → `In Review` → `Done`.
   - Mức độ ưu tiên: `Low` → `Medium` → `High` → `Urgent`.
6. **🎯 Sprint và Backlog**: Lập kế hoạch Sprint (Sprint 0, Sprint 1...), quản lý danh sách công việc tồn đọng (Backlog) và theo dõi tiến độ thực hiện từng Sprint.
7. **📊 Kanban Board**: Trực quan hóa các Task theo từng Status, hỗ trợ thao tác kéo-thả (Drag & Drop) để cập nhật trạng thái công việc thời gian thực.
8. **📅 Timeline / Gantt Chart**: Theo dõi công việc theo mốc thời gian và thể hiện mối quan hệ phụ thuộc giữa các Task (`BLOCKS`, `BLOCKED_BY`, `DUPLICATES`, `RELATES_TO`).
9. **☑️ Checklist, Comment & Attachment**: Chia nhỏ công việc thành các nhiệm vụ phụ (Checklist), trao đổi tin nhắn trực tiếp (Comment & Mention) và đính kèm tài liệu liên quan (Attachment).
10. **🔔 Calendar và Reminder**: Quản lý thời hạn (Due dates), lịch làm việc tích hợp (Calendar events) và tự động phát thông báo nhắc nhở (Reminders).
11. **📈 Dashboard và Analytics**: Cung cấp chỉ số và biểu đồ trực quan (Donut chart, Line chart) về số lượng công việc, trạng thái, mức độ ưu tiên, năng suất và danh sách cảnh báo công việc quá hạn (Overdue Alert List).
12. **📚 Docs / Wiki**: Lưu trữ và tổ chức kho tài liệu tri thức của Workspace theo cấu trúc cây phân cấp (Page Tree) và lưu vết lịch sử chỉnh sửa thông qua `Page Revisions`.
13. **🎨 Whiteboard**: Cung cấp không gian trực quan (Canvas) để các thành viên phác thảo ý tưởng, vẽ sơ đồ tư duy và cộng tác trực tiếp.
14. **📝 Forms**: Biểu mẫu thu thập yêu cầu hoặc thông tin từ người dùng và tự động chuyển đổi phản hồi thành Task mới trong Workspace.
15. **⚡ Automation Rules**: Thiết lập các quy tắc tự động hóa công việc theo mô hình `Trigger` → `Action` giúp giảm tối đa các thao tác thủ công.
16. **📢 Notification và Activity Log**: Phát thông báo thời gian thực khi có thay đổi liên quan đến công việc, đồng thời lưu vết toàn bộ nhật ký lịch sử hoạt động hệ thống (Audit Trail).
17. **🔍 Search và Tag**: Tìm kiếm đối tượng toàn cục (Global Search, Saved Filters) và phân loại đối tượng bằng Thẻ Tag nhằm nâng cao khả năng quản lý và truy xuất thông tin.

---

## 👥 2. Phân Quyền & Vai Trò Hệ Thống (Enterprise RBAC 3-Role Model)
- **Quản trị viên (Admin - `ROLE_ADMIN`)**: Quản trị toàn bộ người dùng, phân quyền, theo dõi nhật ký hoạt động hệ thống (Audit Logs), xem thống kê tổng thể và quản lý cấu hình hệ thống.
- **Quản lý (Manager - `ROLE_MANAGER`)**: Quản lý Workspace, tạo dự án (Project), lập kế hoạch Sprint, phân công công việc, mời thành viên, duy trì biểu mẫu và xem báo cáo hiệu suất team.
- **Nhân viên (Staff / User - `ROLE_USER`)**: Thực thi các công việc cá nhân được phân công, cập nhật tiến độ Task (To Do -> In Progress -> Done), thêm danh sách công việc phụ (Checklist), thảo luận (Comment) và tải lên tài liệu đính kèm.

---

## 🛠️ 2. Yêu Cầu Môi Trường (Prerequisites)

Để khởi chạy dự ánTaskFlow thành công trên máy cục bộ, hãy đảm bảo môi trường đã được cài đặt các công cụ sau:

1. **Node.js (v20.x trở lên)** & **npm (v10.x trở lên)**:
   - Kiểm tra: `node -v` và `npm -v`
2. **Java Development Kit (JDK 21 LTS)**:
   - Khuyên dùng: Eclipse Temurin JDK 21 hoặc Oracle JDK 21
   - Kiểm tra: `java -version` và `javac -version`
3. **Apache Maven (v3.9.x trở lên)**:
   - Kiểm tra: `mvn -v`
4. **Cơ Sở Dữ Liệu PostgreSQL (Local PostgreSQL v14+ hoặc Cloud Neon PostgreSQL)**:
   - **PostgreSQL Local**: Tạo Database tên `taskflow_db` (Port `5432`).
   - **Neon Serverless PostgreSQL (Khuyên dùng)**: Lấy Connection String có dạng `jdbc:postgresql://ep-xyz.neon.tech/taskflow_db?sslmode=require`.

---

## ⚙️ 3. Cấu Hình Biến Môi Trường (Environment Variables)

### 3.1 File `.env` tại thư mục gốc `HVB_DATN/` (Dùng cho Backend & Monorepo):

```env
# Database Credentials (PostgreSQL Local hoặc Neon Cloud)
DATABASE_URL=jdbc:postgresql://localhost:5432/taskflow_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres

# Security & JWT Credentials
JWT_SECRET=c2VjdXJlX2p3dF9zZWNyZXRfa2V5X2Zvcl90YXNrZmxvd19lbnRlcnByaXNlX2FwcGxpY2F0aW9uXzIwMjY=
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Backend Server Port
PORT=8080

# CORS Allowed Origins
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 3.2 File `.env.local` tại `code/frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

---

## 🚦 4. Hướng Dẫn Khởi Chạy Chi Tiết (Step-by-Step Guide)

### 🔴 Bước 1: Cài Đặt Thư viện Frontend
Mở Terminal tại thư mục gốc dự án và chạy:
```bash
npm --prefix code/frontend install
```

### 🟢 Bước 2: Khởi Chạy Backend Server (Spring Boot 3.4)
Hệ thống sử dụng **Flyway (34 scripts migration)** để tự động khởi tạo Bảng CSDL, phân quyền RBAC và Seed sẵn tài khoản Admin.

Mở Terminal và thực hiện:
```bash
cd code/backend
mvn clean compile
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

> **Sau khi Backend khởi chạy thành công:**
> - Backend REST Server chạy tại: `http://localhost:8080`
> - **Tài khoản Admin mặc định** (Auto-seeded):
>   - **Email**: `admin@gmail.com`
>   - **Mật khẩu**: `12345678`
>   - **Quyền**: `ROLE_ADMIN`, `ROLE_USER`
> - **Tài liệu Swagger UI API Spec**: `http://localhost:8080/swagger-ui.html`

### 🔵 Bước 3: Khởi Chạy Frontend Dev Server (Next.js 15)
Mở thêm một cửa sổ Terminal mới và thực hiện:
```bash
cd code/frontend
npm run dev
```

> **Sau khi Frontend khởi chạy thành công:**
> - Web Application truy cập tại: `http://localhost:3000`
> - Đăng nhập bằng tài khoản Admin `admin@gmail.com` / `12345678` để quản trị hệ thống hoặc tạo tài khoản mới.

---

## ⚡ 5. Bảng Lệnh Monorepo Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Khởi chạy đồng thời cả Frontend (Next.js) và Backend (Spring Boot) song song |
| `npm run frontend` | Khởi chạy riêng dịch vụ Frontend Next.js (`code/frontend`) |
| `npm run backend` | Khởi chạy riêng dịch vụ Backend Spring Boot (`code/backend`) |
| `npm run build` | Build bản sản phẩm Production cho Frontend |
| `npm run lint` | Kiểm tra cú pháp và chất lượng mã nguồn Frontend |

---

## 📁 6. Cấu Trúc Thư Mục Dự Án (Repository Structure)

```
HVB_DATN/
├── code/
│   ├── frontend/                  # Next.js 15 App Router (TypeScript, Tailwind CSS, Zustand, TanStack Query)
│   │   ├── src/app/               # Next.js App Router Pages & Layouts (App, Auth, Onboarding, Invite)
│   │   ├── src/features/          # Modular Feature Components (workspace, task, board, timeline, wiki, whiteboard...)
│   │   ├── src/components/ui/     # Atomic shadcn/ui components
│   │   └── src/locales/           # i18n JSON translations (vi, en)
│   └── backend/                   # Spring Boot 3.4 (Java 21, JPA, Flyway, JWT, OpenAPI Swagger)
│       ├── src/main/java/com/taskflow/
│       │   ├── common/            # Shared Infrastructure (BaseEntity, ApiResponse, GlobalExceptionHandler)
│       │   ├── config/            # Security, Web Cors, Swagger, Audit configurations
│       │   └── modules/           # 22 DDD Bounded Context Domain Modules
│       └── src/main/resources/
│           ├── application-dev.yml# Configuration profiles
│           └── db/migration/      # 34 Flyway Versioned Migration SQL Scripts
├── docs/                          # Specifications, SRS, ERD Diagram, API Contracts & Guidelines
├── scripts/                       # Startup & Helper utilities
└── README.md                      # Root documentation
```

---

## ☁️ 7. Hướng Dẫn Deployment Production

- **Frontend (Vercel)**:
  - Connect Repository -> Select `Root Directory: code/frontend`.
  - Set Environment Variable: `NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1`.
- **Backend (Railway.app / Render / AWS)**:
  - Select `Root Directory: code/backend`.
  - Add PostgreSQL Database (Neon DB or Railway Postgres).
  - Set Environment Variables: `SPRING_PROFILES_ACTIVE=prod`, `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET`.

