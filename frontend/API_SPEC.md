# 📡 Netflix Clone — API Specification

> Tài liệu đặc tả API đầy đủ cho Frontend tích hợp với Backend (Spring Boot 4.0.1).

---

## Thông tin chung

| Mục | Giá trị |
|-----|---------|
| **Base URL** | `http://localhost:8080` |
| **Protocol** | HTTP / REST |
| **Content-Type** | `application/json` (mặc định), `multipart/form-data` (upload) |
| **Authentication** | JWT Bearer Token |
| **Rate Limit** | 5 requests / 10 giây / IP |

### Authentication Header

Tất cả các endpoint yêu cầu xác thực đều cần gửi header:

```
Authorization: Bearer <jwt-token>
```

### Public Endpoints (không cần token)

- `POST /api/auth/signin`
- `POST /api/auth/signup`
- `GET /api/movies`
- `GET /api/movies/search`
- `GET /uploads/**`

---

## 1. Authentication — `/api/auth`

### 1.1. Đăng ký — `POST /api/auth/signup`

**Auth**: Public

**Request Body** (`application/json`):

```json
{
  "username": "string",       // Bắt buộc, unique
  "email": "string",          // Bắt buộc, unique, format email
  "password": "string",       // Bắt buộc
  "roles": ["string"]         // Tuỳ chọn, mặc định: ["user"]
}
```

> **Giá trị `roles` hợp lệ**: `"user"`, `"mod"`, `"admin"`. Nếu không truyền hoặc truyền mảng rỗng → mặc định `ROLE_USER`.

**Response `200 OK`**:

```json
{
  "message": "User registered successfully!"
}
```

**Error Responses**:

| Status | Body | Nguyên nhân |
|--------|------|-------------|
| `400` | `{ "message": "Error: Username is already taken!" }` | Username đã tồn tại |
| `400` | `{ "message": "Error: Email is already in use!" }` | Email đã tồn tại |

---

### 1.2. Đăng nhập — `POST /api/auth/signin`

**Auth**: Public

**Request Body** (`application/json`):

```json
{
  "username": "string",   // Bắt buộc
  "password": "string"    // Bắt buộc
}
```

**Response `200 OK`**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": 1,
  "username": "john",
  "email": "john@gmail.com",
  "roles": ["ROLE_USER"]
}
```

> ⚠️ Lưu ý: Giá trị `roles` trả về có prefix `ROLE_` (VD: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_MANAGER`).

**Error Responses**:

| Status | Body | Nguyên nhân |
|--------|------|-------------|
| `401` | `{ "message": "Invalid username or password" }` | Sai thông tin đăng nhập |

---

## 2. Movies — `/api/movies`

### 2.1. Danh sách phim — `GET /api/movies`

**Auth**: Public

**Query Parameters**:

| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| `page` | `int` | `0` | Số trang (bắt đầu từ 0) |
| `size` | `int` | `10` | Số phim mỗi trang |

**Response `200 OK`** — Spring `Page<Movie>`:

```json
{
  "content": [
    {
      "id": 1,
      "title": "Avengers: Endgame",
      "description": "Marvel superhero movie",
      "videoUrl": "/uploads/videos/abc123.mp4",
      "thumbnailUrl": "/uploads/images/thumb123.jpg",
      "releaseYear": 2019
    }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "number": 0,
  "size": 10,
  "first": true,
  "last": false,
  "empty": false
}
```

> **Cache**: Kết quả được cache trong Redis (TTL 10 phút). Dữ liệu cũ có thể tồn tại tối đa 10 phút sau khi admin thay đổi.

---

### 2.2. Tìm kiếm phim — `GET /api/movies/search`

**Auth**: Public

**Query Parameters**:

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `keyword` | `string` | ✅ | Từ khóa tìm kiếm (case-insensitive, LIKE match) |

**Response `200 OK`**:

```json
[1, 5, 12]
```

> ⚠️ API chỉ trả về **danh sách ID** (Long[]), không phải Movie object. Frontend cần dùng ID này để lọc từ danh sách phim đã load, hoặc tự xử lý hiển thị.

---

### 2.3. Thêm phim — `POST /api/movies`

**Auth**: `ROLE_ADMIN` (JWT Required)

**Content-Type**: `multipart/form-data`

**Form Fields**:

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `title` | `string` | ✅ | Tên phim |
| `description` | `string` | ✅ | Mô tả phim |
| `releaseYear` | `int` | ✅ | Năm phát hành |
| `thumbnail` | `file` | ✅ | Ảnh thumbnail (max 10MB) |
| `video` | `file` | ✅ | Video phim (max 10MB) |

**Response `200 OK`**:

```json
{
  "id": 1,
  "title": "Avengers: Endgame",
  "description": "Marvel superhero movie",
  "videoUrl": "/uploads/videos/abc123.mp4",
  "thumbnailUrl": "/uploads/images/thumb123.jpg",
  "releaseYear": 2019
}
```

---

### 2.4. Cập nhật phim — `PUT /api/movies/{id}`

**Auth**: `ROLE_ADMIN` (JWT Required)

**Path Parameters**: `id` — ID phim (Long)

**Content-Type**: `multipart/form-data`

**Form Fields**:

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `title` | `string` | ✅ | Tên phim mới |
| `description` | `string` | ✅ | Mô tả mới |
| `releaseYear` | `int` | ✅ | Năm phát hành mới |
| `thumbnail` | `file` | ❌ | Ảnh mới (nếu muốn thay) |
| `video` | `file` | ❌ | Video mới (nếu muốn thay) |

**Response `200 OK`**: Movie object (cấu trúc giống `POST`).

---

### 2.5. Xoá phim — `DELETE /api/movies/{id}`

**Auth**: `ROLE_ADMIN` (JWT Required)

**Path Parameters**: `id` — ID phim (Long)

**Response `200 OK`**:

```json
{
  "message": "Movie deleted successfully!"
}
```

---

## 3. Favorites — `/api/favorites`

> ⚠️ Tất cả endpoints trong nhóm này đều yêu cầu JWT token (Authenticated User).

### 3.1. Thêm yêu thích — `POST /api/favorites/{movieId}`

**Auth**: Authenticated User (JWT Required)

**Path Parameters**: `movieId` — ID phim (Long)

**Response `200 OK`**:

```json
{
  "message": "Movie added to favorites!"
}
```

---

### 3.2. Bỏ yêu thích — `DELETE /api/favorites/{movieId}`

**Auth**: Authenticated User (JWT Required)

**Path Parameters**: `movieId` — ID phim (Long)

**Response `200 OK`**:

```json
{
  "message": "Movie removed from favorites!"
}
```

---

### 3.3. Danh sách yêu thích — `GET /api/favorites`

**Auth**: Authenticated User (JWT Required)

**Response `200 OK`**:

```json
[
  {
    "id": 1,
    "title": "Avengers: Endgame",
    "description": "Marvel superhero movie",
    "videoUrl": "/uploads/videos/abc123.mp4",
    "thumbnailUrl": "/uploads/images/thumb123.jpg",
    "releaseYear": 2019
  }
]
```

---

## 4. Static Files — `/uploads`

Thumbnail và video được phục vụ dưới dạng static files:

| Resource | URL |
|----------|-----|
| Thumbnail | `GET /uploads/images/{filename}` |
| Video | `GET /uploads/videos/{filename}` |

> Frontend nên nối `BASE_URL + videoUrl` hoặc `BASE_URL + thumbnailUrl` từ Movie object để lấy URL đầy đủ.

---

## 5. Data Models

### Movie

```typescript
interface Movie {
  id: number;
  title: string;
  description: string;
  videoUrl: string;       // VD: "/uploads/videos/abc123.mp4"
  thumbnailUrl: string;   // VD: "/uploads/images/thumb123.jpg"
  releaseYear: number;
}
```

### Page\<Movie\> (Spring Paginated Response)

```typescript
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;          // Trang hiện tại (0-indexed)
  size: number;            // Kích thước trang
  first: boolean;
  last: boolean;
  empty: boolean;
}
```

### JwtResponse (Login Response)

```typescript
interface JwtResponse {
  token: string;
  type: "Bearer";
  id: number;
  username: string;
  email: string;
  roles: string[];         // VD: ["ROLE_USER"], ["ROLE_ADMIN"]
}
```

### MessageResponse

```typescript
interface MessageResponse {
  message: string;
}
```

### LoginRequest

```typescript
interface LoginRequest {
  username: string;
  password: string;
}
```

### SignupRequest

```typescript
interface SignupRequest {
  username: string;
  email: string;
  password: string;
  roles?: string[];        // "user" | "mod" | "admin"
}
```

---

## 6. Error Handling

### Error Response Format

Tất cả lỗi đều trả về dạng `MessageResponse`:

```json
{
  "message": "Error description"
}
```

### HTTP Status Codes

| Status | Mô tả | Xử lý Frontend |
|--------|--------|----------------|
| `200` | Thành công | Hiển thị dữ liệu |
| `400` | Validation error / Duplicate data | Hiển thị error message cho user |
| `401` | Token hết hạn / không hợp lệ | Redirect về trang login |
| `403` | Không đủ quyền (non-admin) | Hiển thị thông báo "Access Denied" |
| `413` | File upload > 10MB | Hiển thị thông báo giới hạn file |
| `429` | Rate limit (5 req/10s) | Hiển thị thông báo chờ, retry sau |
| `500` | Server error | Hiển thị generic error |

---

## 7. Rate Limiting

- **Giới liệu**: 5 requests / 10 giây / IP
- **Algorithm**: Token Bucket (Bucket4j)
- **Response khi bị chặn**: `HTTP 429 Too Many Requests` + header `Retry-After`
- **Khuyến nghị Frontend**: Implement retry logic với exponential backoff

---

## 8. CORS

Backend đã cấu hình `@CrossOrigin(origins = "*", maxAge = 3600)` trên tất cả controllers → Frontend có thể gọi API từ mọi origin.

---

## 9. Tóm tắt Endpoints

| # | Method | Endpoint | Auth | Response Type |
|---|--------|----------|------|---------------|
| 1 | `POST` | `/api/auth/signup` | Public | `MessageResponse` |
| 2 | `POST` | `/api/auth/signin` | Public | `JwtResponse` |
| 3 | `GET` | `/api/movies?page=&size=` | Public | `Page<Movie>` |
| 4 | `GET` | `/api/movies/search?keyword=` | Public | `Long[]` |
| 5 | `POST` | `/api/movies` | ADMIN | `Movie` |
| 6 | `PUT` | `/api/movies/{id}` | ADMIN | `Movie` |
| 7 | `DELETE` | `/api/movies/{id}` | ADMIN | `MessageResponse` |
| 8 | `POST` | `/api/favorites/{movieId}` | Auth User | `MessageResponse` |
| 9 | `DELETE` | `/api/favorites/{movieId}` | Auth User | `MessageResponse` |
| 10 | `GET` | `/api/favorites` | Auth User | `Movie[]` |
