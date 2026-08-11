# TaskFlow Engineering Standard: Database Guidelines (`database-style.md`)

Tài liệu này quy định các tiêu chuẩn thiết kế cơ sở dữ liệu (Database Design Standards), quy ước đặt tên schema, thực thi Flyway migrations và tối ưu hóa hiệu năng truy vấn cho **TaskFlow** sử dụng **PostgreSQL** và **Flyway**.

---

## 1. Naming Conventions (Quy Ước Đặt Tên)

Tất cả các thành phần CSDL (bảng, cột, chỉ mục index, ràng buộc constraint) **BẮT BUỘC** dùng chuẩn **lowercase `snake_case`**.

| Thành Phần | Quy Ước | Ví Dụ |
| :--- | :--- | :--- |
| **Database Name** | `snake_case` | `taskflow_db`, `taskflow_dev` |
| **Table Name** | Danh từ số nhiều `snake_case` | `workspaces`, `tasks`, `users`, `wiki_pages` |
| **Column Name** | Danh từ số ít `snake_case` | `first_name`, `created_at`, `is_active` |
| **Primary Key Constraint** | `pk_<table_name>` | `pk_workspaces`, `pk_tasks` |
| **Foreign Key Constraint** | `fk_<source_table>_<target_table>` | `fk_projects_workspaces`, `fk_tasks_projects` |
| **Unique Constraint** | `uk_<table_name>_<column_names>` | `uk_users_email`, `uk_workspaces_slug` |
| **Check Constraint** | `ck_<table_name>_<condition>` | `ck_tasks_priority` |
| **Index Name** | `idx_<table_name>_<column_names>` | `idx_tasks_workspace_status` |

---

## 2. Primary Key & UUID Strategy (Chiến Lược Khóa Chính)

1. **UUIDv4 Primary Keys**:
   - Tất cả các khóa chính của các thực thể nghiệp vụ MUST sử dụng kiểu `UUID` của PostgreSQL được tạo tự động qua `gen_random_uuid()` hoặc Java `UUID.randomUUID()`.
   - **TUYỆT ĐỐI KHÔNG** dùng chuỗi số tăng tự động (`BIGSERIAL`) làm khóa chính công khai để tránh các cuộc tấn công quét số thứ tự (enumeration attacks) và hỗ trợ gộp dữ liệu phân tán.

```sql
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    owner_id UUID NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);
```

---

## 3. Audit Fields & BaseEntity (Trường Ghi Vết Kiểm Toán)

Mọi bảng nghiệp vụ trong hệ thống BẮT BUỘC phải kế thừa các trường kiểm toán tiêu chuẩn từ `BaseEntity`:

| Cột | Kiểu Dữ Liệu | Nullable | Mô Tả |
| :--- | :--- | :--- | :--- |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL` | Thời điểm bản ghi được tạo (Chuẩn UTC) |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL` | Thời điểm bản ghi cập nhật gần nhất (UTC) |
| `created_by` | `UUID` | `NULLABLE` | ID người dùng tạo bản ghi |
| `updated_by` | `UUID` | `NULLABLE` | ID người dùng cập nhật bản ghi gần nhất |

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private UUID createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private UUID updatedBy;
}
```

---

## 4. Soft Delete Policy (Chính Sách Xóa Mềm)

1. **Soft Delete**:
   - Tất cả các thực thể quan trọng (Workspace, Project, Task, Wiki Page, Comment) không bao giờ bị xóa cứng khỏi DB ngay lập tức.
   - Thêm các cột: `is_deleted BOOLEAN DEFAULT FALSE NOT NULL` và `deleted_at TIMESTAMPTZ NULL`.
   - Spring Data JPA Repository quản lý thực thể này sẽ dùng bộ lọc tự động hoặc `@Where(clause = "is_deleted = false")`.

---

## 5. Flyway Migration Rules & Scripts (34 Migration Versioned Scripts)

1. **Vị trí**: Tất cả các script migration được lưu trữ tại `code/backend/src/main/resources/db/migration/`.
2. **Quy tắc đặt tên**: `V<Version>__<Description>.sql` (Dùng 2 dấu gạch dưới `__`).
3. **Danh sách 34 Flyway Migrations đã triển khai**:
   - `V1__create_users_table.sql`
   - `V2__create_workspace_table.sql`
   - `V3__create_project_table.sql`
   - `V4__create_task_table.sql`
   - `V5__create_user_settings_table.sql`
   - `V6__create_checklist_table.sql`
   - `V7__create_comment_table.sql`
   - `V8__create_attachment_table.sql`
   - `V9__create_reminder_table.sql`
   - `V10__create_calendar_event_table.sql`
   - `V11__create_notification_table.sql`
   - `V12__create_activity_log_table.sql`
   - `V13__create_role_permission_table.sql`
   - `V14__create_ai_prompt_log_table.sql`
   - `V15__create_auth_tokens_table.sql`
   - `V16__add_checklist_position_and_fk.sql`
   - `V17__create_tags_table.sql`
   - `V18__add_comment_mentions_soft_delete_and_fk.sql`
   - `V19__enhance_reminders_table.sql`
   - `V20__enhance_notifications_table.sql`
   - `V21__enhance_calendar_events_table.sql`
   - `V22__enhance_activity_log_table.sql`
   - `V23__enhance_attachment_table.sql`
   - `V24__create_board_and_column_tables.sql`
   - `V25__create_timeline_and_dependencies_tables.sql`
   - `V26__create_team_collaboration_tables.sql`
   - `V27__seed_rbac_roles_and_permissions.sql`
   - `V28__create_wiki_tables.sql`
   - `V29__create_whiteboard_tables.sql`
   - `V30__create_search_tables.sql`
   - `V31__create_automation_tables.sql`
   - `V32__add_audit_columns_to_search_filters.sql`
   - `V33__seed_admin_account.sql`
   - `V34__add_workspace_and_reminder_to_calendar_events.sql`

4. **Bất Biến (Immutability)**:
   - Các file migration đã từng được commit/chạy trên bất kỳ môi trường nào **TUYỆT ĐỐI KHÔNG ĐƯỢC CHỈNH SỬA**.
   - Mọi thay đổi schema hay thêm index bắt buộc phải tạo file version mới (ví dụ: `V35__...sql`).

---

## 6. JPA Performance & Indexing Guidelines

1. **Bắt Buộc Lazy Fetching (`FetchType.LAZY`)**:
   - Tất cả các quan hệ JPA (`@ManyToOne`, `@OneToMany`, `@OneToOne`, `@ManyToMany`) MUST cấu hình `fetch = FetchType.LAZY`.
   - ❌ **CẤM** dùng `FetchType.EAGER` để tránh tràn N+1 query không kiểm soát.
2. **Foreign Key Indexing**: Tất cả các cột khóa ngoại (Foreign Key) đều phải được tạo Index trong SQL để tối ưu hóa phép JOIN.
3. **Chống N+1 Query**: Sử dụng `JOIN FETCH` trong JPQL hoặc `@EntityGraph` khi load thực thể cha kèm danh sách thực thể con.
