# 🚀 Hướng Dẫn Deploy Dự Án TaskFlow (Production Deployment Guide)

Tài liệu này hướng dẫn chi tiết cách triển khai (deploy) dự án **TaskFlow** lên môi trường Production với 2 phương án phổ biến nhất: **Cloud Server (Vercel + Railway / Render)** và **Self-Hosted Docker Compose (VPS / Server riêng)**.

---

## 📋 1. Chuẩn Bị Biến Môi Trường (Environment Variables)

### 1.1 Backend Environment Variables (Spring Boot)
| Biến môi trường | Giá trị mẫu | Ghi chú |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | Kích hoạt profile Production |
| `DATABASE_URL` | `jdbc:postgresql://<host>:<port>/<dbname>` | Connection String CSDL PostgreSQL / Neon |
| `DATABASE_USERNAME` | `postgres` | Username CSDL |
| `DATABASE_PASSWORD` | `<your-db-password>` | Mật khẩu CSDL |
| `JWT_SECRET` | `<chuỗi_ngẫu_nhiên_dài_tối_thiểu_64_ký_tự>` | Chuỗi Secret mã hóa JWT |
| `JWT_EXPIRATION` | `86400000` | Thời gian sống JWT Access Token (ms) |
| `JWT_REFRESH_EXPIRATION` | `604800000` | Thời gian sống Refresh Token (ms) |
| `PORT` | `8080` | Cổng HTTP của Backend Server |
| `CORS_ALLOWED_ORIGINS` | `https://your-domain.vercel.app` | Domain Frontend được phép gọi API |

### 1.2 Frontend Environment Variables (Next.js)
| Biến môi trường | Giá trị mẫu | Ghi chú |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app/api/v1` | URL REST API Endpoint công khai của Backend |

---

## ☁️ 2. Phương Án 1: Triển Khai Cloud Server (Vercel + Railway / Render + Neon Postgres)

### 🔹 Bước 1: Tạo Database PostgreSQL Serverless (Neon Cloud / Supabase)
1. Truy cập [Neon.tech](https://neon.tech) hoặc [Supabase.com](https://supabase.com) tạo một Database mới (tên: `taskflow_db`).
2. Lấy đường dẫn kết nối JDBC:
   `jdbc:postgresql://ep-xyz.neon.tech/taskflow_db?sslmode=require`

### 🔹 Bước 2: Deploy Backend lên Railway.app / Render.com
1. **Trên Railway.app**:
   - Chọn **New Project** -> **Deploy from GitHub repo**.
   - Chọn repository dự án TaskFlow.
   - Chọn **Root Directory**: `code/backend`.
   - Vào **Variables**, thêm tất cả các biến môi trường Backend ở Mục 1.1.
   - Railway sẽ tự động phát hiện `railway.toml` hoặc Java environment và build ứng dụng Maven.
2. **Flyway Database Migration**:
   - Khi Backend khởi chạy lần đầu với `SPRING_PROFILES_ACTIVE=prod`, Flyway sẽ tự động chạy 34 migration script để tạo toàn bộ bảng, quyền RBAC và tài khoản Admin mặc định (`admin@gmail.com` / `12345678`).

### 🔹 Bước 3: Deploy Frontend lên Vercel.com
1. Truy cập [Vercel.com](https://vercel.com) -> Chọn **Add New Project**.
2. Import repository GitHub của dự án.
3. Cấu hình dự án:
   - **Framework Preset**: Next.js
   - **Root Directory**: `code/frontend`
4. Vào mục **Environment Variables**:
   - Thêm `NEXT_PUBLIC_API_URL` = URL Backend trên Railway vừa deploy ở Bước 2 (ví dụ: `https://taskflow-backend.up.railway.app/api/v1`).
5. Bấm **Deploy**. Vercel sẽ tự động build và cung cấp cho bạn Domain HTTPS.

---

## 🐳 3. Phương Án 2: Triển Khai Bằng Docker Compose (VPS / Server Riêng)

Dự án đã tích hợp sẵn file [docker-compose.yml](file:///docker-compose.yml), [Backend Dockerfile](file:///code/backend/Dockerfile) và [Frontend Dockerfile](file:///code/frontend/Dockerfile).

### Các bước thực hiện trên VPS (Ubuntu / Debian / CentOS):

1. **Cài đặt Docker & Docker Compose trên VPS**:
   ```bash
   sudo apt update && sudo apt install docker.io docker-compose -y
   ```

2. **Clone mã nguồn dự án**:
   ```bash
   git clone <URL_REPOSITORY_CUA_BAN>
   cd HVB_DATN
   ```

3. **Tùy chỉnh thông số trong `docker-compose.yml` (nếu cần)**:
   - Thay đổi mật khẩu PostgreSQL (`POSTGRES_PASSWORD`).
   - Cập nhật `JWT_SECRET` bí mật cho Production.
   - Thay đổi đường dẫn `NEXT_PUBLIC_API_URL` cho phù hợp với IP / Domain của VPS.

4. **Khởi chạy toàn bộ hệ thống bằng 1 lệnh**:
   ```bash
   docker-compose up -d --build
   ```

5. **Kiểm tra trạng thái Containers**:
   ```bash
   docker-compose ps
   ```

---

## 🔍 4. Kiểm Tra Sau Triển Khai (Post-Deployment Verification)

1. **Backend Health Check**:
   Gửi truy vấn HTTP GET tới: `https://<YOUR_BACKEND_DOMAIN>/actuator/health`
   Kết quả mong đợi: `{"status":"UP"}`

2. **Đăng nhập Tài khoản Admin Mặc Định**:
   - Truy cập Frontend Domain.
   - Đăng nhập bằng:
     - **Email**: `admin@gmail.com`
     - **Mật khẩu**: `12345678`
   - Đổi lại mật khẩu Admin sau lần đăng nhập đầu tiên để bảo mật.
