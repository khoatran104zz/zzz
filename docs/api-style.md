# TaskFlow Engineering Standard: REST API Guidelines (`api-style.md`)

Tài liệu này quy định các tiêu chuẩn thiết kế REST API, cấu trúc Endpoint, cơ chế xác thực JWT, định dạng phản hồi chuẩn hóa và tài liệu hóa qua Swagger OpenAPI cho **TaskFlow**.

---

## 1. REST Principles & URL Structure (Nguyên Tắc URL)

### 1.1 Architectural Style
Tất cả các Endpoint API trong TaskFlow tuân thủ chuẩn HTTP/1.1 và HTTP/2, chỉ sản xuất và tiêu thụ định dạng dữ liệu `application/json`.

### 1.2 URL Versioning Strategy
Tất cả các Endpoint BẮT BUỘC phải có tiền tố phiên bản API rõ ràng:
```http
/api/v1/{resource-name}
```

### 1.3 Resource Naming Rules
- **Danh từ số nhiều**: Tài nguyên URL BẮT BUỘC dùng danh từ số nhiều (ví dụ: `/api/v1/workspaces`, `/api/v1/tasks`, `/api/v1/projects`).
- **Kebab-Case**: URL nhiều từ phải dùng ký tự gạch nối chữ thường (ví dụ: `/api/v1/task-categories`, `/api/v1/user-profiles`).
- **Độ sâu phân cấp tối đa 2 cấp**:
  - ✅ `/api/v1/workspaces/{workspaceId}/projects`
  - ✅ `/api/v1/projects/{projectId}/tasks`
  - ❌ `/api/v1/workspaces/{wId}/projects/{pId}/tasks/{tId}/comments` (Quá sâu! Hãy dùng URL cấp 1: `/api/v1/tasks/{taskId}/comments`).

---

## 2. HTTP Methods & Standard Status Codes

### Sử Dụng Phương Thức HTTP

| Method | Mục Đích | Khả Đổi (Idempotent) | An Toàn (Safe) |
| :--- | :--- | :---: | :---: |
| **GET** | Truy vấn một bản ghi hoặc danh sách tài nguyên | Có | Có |
| **POST** | Tạo mới một tài nguyên hoặc kích hoạt một hành động | Không | Không |
| **PUT** | Thay thế toàn bộ nội dung một tài nguyên | Có | Không |
| **PATCH** | Cập nhật một phần thuộc tính tài nguyên | Không | Không |
| **DELETE** | Xóa một tài nguyên (Soft delete) | Có | Không |

### Mã Trạng Thái HTTP Tiêu Chuẩn (Status Codes)

| Mã | Trạng Thái | Kịch Bản Sử Dụng |
| :--- | :--- | :--- |
| **200** | `OK` | Truy vấn, cập nhật hoặc thực hiện hành động thành công. |
| **201** | `Created` | Tạo mới tài nguyên thành công. |
| **204** | `No Content` | Xóa tài nguyên thành công, không trả về payload body. |
| **400** | `Bad Request` | Payload request sai cú pháp hoặc vi phạm validation. |
| **401** | `Unauthorized` | Token JWT bị thiếu, hết hạn hoặc không hợp lệ. |
| **403** | `Forbidden` | Người dùng không đủ quyền truy cập (RBAC Matrix violation). |
| **404** | `Not Found` | Tài nguyên yêu cầu không tồn tại trong hệ thống. |
| **409** | `Conflict` | Vi phạm ràng buộc duy nhất (ví dụ: trùng email, trùng slug). |
| **422** | `Unprocessable Entity` | Vi phạm quy tắc logic nghiệp vụ. |
| **500** | `Internal Server Error` | Lỗi ngoại lệ hệ thống chưa được xử lý. |

---

## 3. Standard Response Envelope (`ApiResponse<T>`)

Mọi phản hồi từ REST Controller BẮT BUỘC được đóng gói trong vỏ bọc `ApiResponse<T>`.

### Định Dạng Phản Hồi Thành Công
```json
{
  "code": 200,
  "message": "Workspace retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Engineering Workspace",
    "slug": "engineering-workspace",
    "createdAt": "2026-08-11T10:00:00Z"
  },
  "timestamp": 1770000000000
}
```

### Định Dạng Phản Hồi Lỗi Standard Error
```json
{
  "code": 400,
  "message": "Validation failed for request parameters",
  "data": null,
  "errors": [
    {
      "field": "name",
      "message": "Workspace name must not be blank"
    }
  ],
  "timestamp": 1770000000000
}
```

---

## 4. Pagination & Search Format (`PageResponse<T>`)

Truy vấn danh sách (`GET /api/v1/tasks`) hỗ trợ phân trang và tìm kiếm tiêu chuẩn:

```json
{
  "code": 200,
  "message": "Tasks retrieved successfully",
  "data": {
    "content": [
      {
        "id": "987e6543-e89b-12d3-a456-426614174111",
        "title": "Implement JWT Interceptor",
        "status": "IN_PROGRESS",
        "priority": "HIGH"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  },
  "timestamp": 1770000000000
}
```

---

## 5. Authentication & JWT Bearer Flow

1. **Đăng nhập**: Client gửi credentials tới `POST /api/v1/auth/login`.
2. **Cấp Token**: Backend trả về Access Token (JWT 15 phút) trong Response Body và Refresh Token (7 ngày) qua Cookie HttpOnly.
3. **Ủy quyền Request**: Client gắn Header:
   ```http
   Authorization: Bearer <access_token>
   ```
4. **Tự động Refresh Token**: Axios Interceptor phía Frontend phát hiện lỗi `401 Unauthorized` và tự động gọi `POST /api/v1/auth/refresh` để xin Access Token mới mà không làm gián đoạn trải nghiệm người dùng.

---

## 6. Swagger OpenAPI 3.0 Documentation

Mọi Controller và Endpoint phương thức BẮT BUỘC phải khai báo OpenAPI annotations để tự động sinh tài liệu Swagger tại `/swagger-ui.html`:

```java
@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "Task Management", description = "Operations for creating, searching, and managing tasks")
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "Create a new task", description = "Creates a new task within a workspace project.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Task created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request payload"),
        @ApiResponse(responseCode = "401", description = "Authentication token missing or invalid"),
        @ApiResponse(responseCode = "404", description = "Target project or workspace not found")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<TaskDto>> createTask(@Valid @RequestBody CreateTaskRequest request) {
        TaskDto created = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created successfully", created));
    }
}
```
