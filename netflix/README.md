# 🎬 Netflix Clone — Backend

> Backend RESTful API cho ứng dụng xem phim Netflix Clone, xây dựng trên Spring Boot 4.0.1 / Java 21.

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Tech Stack](#-tech-stack)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt & Chạy](#-cài-đặt--chạy)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Reference](#-api-reference)
- [Bảo mật](#-bảo-mật)
- [Caching](#-caching)
- [Database](#-database)
- [Docker Deployment](#-docker-deployment)
- [Cấu hình](#-cấu-hình)
- [Testing](#-testing)

---

## 🎯 Giới thiệu

Netflix Clone Backend cung cấp API cho hệ thống xem phim trực tuyến với đầy đủ tính năng:
- Xác thực & phân quyền người dùng
- Quản lý nội dung phim (CRUD + upload media)
- Hệ thống yêu thích cá nhân
- Caching hiệu suất cao với Redis
- Chống tấn công DDoS bằng rate limiting

---

## ✨ Tính năng

### 👤 Authentication & Authorization
- Đăng ký tài khoản (`/api/auth/signup`)
- Đăng nhập với JWT token (`/api/auth/signin`)
- Phân quyền 3 vai trò: **USER**, **MANAGER**, **ADMIN**
- Password mã hóa BCrypt

### 🎥 Quản lý phim (Admin)
- Thêm phim mới với upload thumbnail + video (multipart/form-data)
- Cập nhật thông tin phim (có thể thay đổi media)
- Xóa phim (tự động xóa file trên server)
- File tối đa: **10MB** mỗi file

### 🔍 Xem & Tìm kiếm phim (Public)
- Danh sách phim phân trang (`page`, `size`)
- Tìm kiếm phim theo tên (case-insensitive)
- Kết quả được **cache bằng Redis** (TTL 10 phút)

### ❤️ Yêu thích (Authenticated Users)
- Thêm phim vào danh sách yêu thích
- Bỏ phim khỏi danh sách yêu thích
- Xem danh sách phim yêu thích cá nhân

### 🛡️ Bảo mật
- JWT Stateless Authentication (24h expiry)
- Rate Limiting: **5 requests / 10 giây / IP** (Bucket4j)
- CORS enabled (cross-origin)

### ⚡ Hiệu suất
- Redis caching cho danh sách phim
- Redis caching cho user auth session (10 phút TTL)
- Tự động fallback về DB khi Redis không khả dụng

---

## 🔧 Tech Stack

| Công nghệ | Phiên bản | Vai trò |
|-----------|-----------|---------|
| Java | 21 (LTS) | Ngôn ngữ chính |
| Spring Boot | 4.0.1 | Web framework |
| Spring Security | — | Auth & Authorization |
| JJWT | 0.11.5 | JWT tokens |
| Bucket4j | 8.10.1 | Rate limiting |
| Spring Data JPA | — | ORM / Database access |
| MySQL | 8.0 | Database |
| Redis | 7 | Caching |
| Lombok | — | Code generation |
| Docker | — | Containerization |
| Maven | 3.9+ | Build tool |

---

## 📝 Yêu cầu hệ thống

### Chạy với Docker (Khuyến nghị)
- Docker Desktop ≥ 4.x
- Docker Compose V2

### Chạy không Docker
- JDK 21+
- Maven 3.9+
- MySQL 8.0+
- Redis 7+

---

## 🚀 Cài đặt & Chạy

### Cách 1: Docker Compose (Khuyến nghị) ⭐

```bash
# Clone project
git clone <repository-url>
cd netflix/netflix

# Khởi chạy tất cả services (MySQL + Redis + Backend)
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng tất cả
docker-compose down
```

Sau khi chạy, API sẽ available tại: `http://localhost:8080`

### Cách 2: Chạy thủ công

**Bước 1: Khởi động MySQL**
```bash
# Tạo database
mysql -u root -p
CREATE DATABASE netflix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Chạy script khởi tạo
mysql -u root -p netflix < init/init.sql
```

**Bước 2: Khởi động Redis**
```bash
redis-server
```

**Bước 3: Cấu hình `application.properties`**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/netflix?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=<your-password>
spring.data.redis.host=localhost
spring.data.redis.port=6379
```

**Bước 4: Build & Run**
```bash
# Build
./mvnw clean package -DskipTests

# Run
./mvnw spring-boot:run
```

### Cách 3: Rebuild backend sau khi thay đổi code
```bash
docker-compose up -d --build backend
```

---

## 📁 Cấu trúc dự án

```
netflix/
├── docker-compose.yml          # 3 services: MySQL + Redis + Backend
├── Dockerfile                  # Multi-stage: Maven build → JRE runtime
├── pom.xml                     # Dependencies
├── init/init.sql               # DB DDL (tables + sample data)
├── uploads/
│   ├── images/                 # Movie thumbnails
│   └── videos/                 # Movie video files
└── src/main/
    ├── java/com/netflix/
    │   ├── config/             # RedisConfig, MvcConfig
    │   ├── controllers/        # REST API controllers
    │   ├── dtos/               # Request/Response DTOs
    │   ├── entities/           # JPA entities
    │   ├── exceptions/         # Global exception handler
    │   ├── repositories/       # Spring Data JPA repositories
    │   ├── security/           # JWT, Rate Limiting, Security config
    │   └── services/impl/      # Business logic services
    └── resources/
        └── application.properties  # App configuration
```

> 📖 Xem chi tiết kiến trúc tại [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 📡 API Reference

### Base URL: `http://localhost:8080`

### 🔓 Authentication

#### Đăng ký
```http
POST /api/auth/signup
Content-Type: application/json

{
  "username": "john",
  "email": "john@gmail.com",
  "password": "123456",
  "roles": ["user"]        // Optional, default: ["user"]
}
```
**Response** `200 OK`:
```json
{ "message": "User registered successfully!" }
```

#### Đăng nhập
```http
POST /api/auth/signin
Content-Type: application/json

{
  "username": "john",
  "password": "123456"
}
```
**Response** `200 OK`:
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

---

### 🎥 Movies

#### Danh sách phim (Public)
```http
GET /api/movies?page=0&size=10
```
**Response** `200 OK`: `Page<Movie>` (phân trang)

#### Tìm kiếm phim (Public)
```http
GET /api/movies/search?keyword=avengers
```
**Response** `200 OK`: `[1, 5, 12]` (danh sách movie IDs)

#### Thêm phim (Admin only)
```http
POST /api/movies
Authorization: Bearer <admin-jwt-token>
Content-Type: multipart/form-data

title=Avengers
description=Marvel superhero movie
releaseYear=2019
thumbnail=<file>
video=<file>
```
**Response** `200 OK`: `Movie` object

#### Cập nhật phim (Admin only)
```http
PUT /api/movies/{id}
Authorization: Bearer <admin-jwt-token>
Content-Type: multipart/form-data

title=Avengers: Endgame
description=Updated description
releaseYear=2019
thumbnail=<file>       (optional)
video=<file>           (optional)
```

#### Xóa phim (Admin only)
```http
DELETE /api/movies/{id}
Authorization: Bearer <admin-jwt-token>
```
**Response** `200 OK`:
```json
{ "message": "Movie deleted successfully!" }
```

---

### ❤️ Favorites (Authenticated)

Tất cả endpoints yêu cầu header: `Authorization: Bearer <jwt-token>`

#### Thêm yêu thích
```http
POST /api/favorites/{movieId}
```

#### Bỏ yêu thích
```http
DELETE /api/favorites/{movieId}
```

#### Danh sách yêu thích
```http
GET /api/favorites
```
**Response** `200 OK`: `List<Movie>`

---

### 📁 Static Files

Thumbnail và video được serve tại:
```
GET /uploads/images/{filename}
GET /uploads/videos/{filename}
```

---

## 🛡️ Bảo mật

### JWT Authentication
- **Algorithm**: HMAC-SHA256
- **Token expiry**: 24 giờ (86400000ms)
- **Header format**: `Authorization: Bearer <token>`
- **Password**: BCrypt encoded

### Rate Limiting
- **Algorithm**: Token Bucket (Bucket4j)
- **Limit**: 5 requests / 10 giây / IP
- **IP detection**: `X-Forwarded-For` → `X-Real-IP` → `remoteAddr`
- **Response khi bị chặn**: HTTP 429 + `Retry-After` header

### Phân quyền (RBAC)

| Role | Mô tả |
|------|--------|
| `ROLE_USER` | Xem phim, tìm kiếm, quản lý yêu thích |
| `ROLE_MANAGER` | Mở rộng trong tương lai |
| `ROLE_ADMIN` | Toàn quyền CRUD phim |

### Public Endpoints (không cần token)
- `POST /api/auth/signin`, `POST /api/auth/signup`
- `GET /api/movies`, `GET /api/movies/search`
- `GET /uploads/**`

---

## ⚡ Caching

### Movie Cache
- **Engine**: Redis (Spring Cache)
- **Key**: `movies::{page}_{size}`
- **TTL**: 10 phút
- **Eviction**: Tự động khi thêm/sửa/xóa phim

### User Auth Cache
- **Engine**: Redis Hash (manual)
- **Key**: `auth:user:{username}`
- **Data**: id, username, email, roles
- **TTL**: 10 phút
- **Resilience**: Fallback về DB nếu Redis unavailable

---

## 🗄️ Database

### Schema (5 bảng)

| Table | Mô tả |
|-------|--------|
| `users` | id, username, email, password, enabled |
| `roles` | id, name (ROLE_USER/MANAGER/ADMIN) |
| `users_roles` | user_id, role_id (composite PK, N:M) |
| `movies` | id, title, description, video_url, thumbnail_url, release_year, created_at |
| `favorites` | user_id, movie_id (composite PK), saved_at |

### Đặc điểm
- **Character set**: `utf8mb4_unicode_ci` (hỗ trợ tiếng Việt + emoji)
- **CASCADE DELETE**: Xóa user → xóa favorites + role mappings
- **AUTO_INCREMENT**: ID tự tăng cho users, roles, movies
- **DDL mode**: `spring.jpa.hibernate.ddl-auto=update`

---

## 🐳 Docker Deployment

### Services

| Service | Image | Port (Host→Container) | Volume |
|---------|-------|----------------------|--------|
| `mysql` | mysql:8.0 | 3307→3306 | mysql_data |
| `redis` | redis:7-alpine | 6379→6379 | redis_data |
| `backend` | Custom (Dockerfile) | 8080→8080 | ./uploads |

### Commands

```bash
# Khởi chạy tất cả
docker-compose up -d

# Dừng tất cả
docker-compose down

# Xem logs
docker-compose logs -f

# Rebuild backend
docker-compose up -d --build backend

# Xem trạng thái
docker-compose ps
```

### Health Checks
- MySQL: `mysqladmin ping` (interval 10s, 5 retries)
- Redis: `redis-cli ping` (interval 10s, 5 retries)
- Backend chỉ start khi cả MySQL và Redis đều **healthy**

---

## ⚙️ Cấu hình

### Biến môi trường chính (`application.properties`)

| Property | Default | Mô tả |
|----------|---------|--------|
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/netflix` | MySQL connection |
| `spring.datasource.username` | `root` | DB username |
| `spring.datasource.password` | *(empty)* | DB password |
| `spring.data.redis.host` | `localhost` | Redis host |
| `spring.data.redis.port` | `6379` | Redis port |
| `jwt.secret` | Base64 encoded string | JWT signing key |
| `jwt.expiration` | `86400000` (24h) | Token expiry (ms) |
| `spring.servlet.multipart.max-file-size` | `10MB` | Max upload file |
| `spring.cache.redis.time-to-live` | `600000` (10 min) | Redis cache TTL |
| `spring.jpa.hibernate.ddl-auto` | `update` | Schema auto-update |

### Docker Compose Environment Variables

Trong `docker-compose.yml`, các biến môi trường ghi đè cấu hình mặc định:
- `SPRING_DATASOURCE_URL`: `jdbc:mysql://mysql:3306/netflix` (dùng service name)
- `SPRING_DATA_REDIS_HOST`: `redis` (dùng service name)

---

## 🧪 Testing

### Chạy tests
```bash
# Chạy tất cả tests
./mvnw test

# Chạy test cụ thể
./mvnw test -Dtest=MovieServiceTest
```

### Test thủ công với cURL

```bash
# Đăng ký
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@gmail.com","password":"123456"}'

# Đăng nhập
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'

# Xem phim (public)
curl http://localhost:8080/api/movies?page=0&size=5

# Tìm kiếm phim (public)
curl "http://localhost:8080/api/movies/search?keyword=avengers"

# Thêm yêu thích (cần token)
curl -X POST http://localhost:8080/api/favorites/1 \
  -H "Authorization: Bearer <your-jwt-token>"

# Xem yêu thích
curl http://localhost:8080/api/favorites \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 📌 Error Responses

| HTTP Status | Nguyên nhân |
|-------------|------------|
| 400 Bad Request | Validation error, duplicate username/email |
| 401 Unauthorized | Missing/invalid JWT token |
| 403 Forbidden | Insufficient permissions (non-admin) |
| 413 Payload Too Large | File upload > 10MB |
| 429 Too Many Requests | Rate limit exceeded (5 req/10s) |
| 500 Internal Server Error | Unexpected server error |

**Error format**:
```json
{ "message": "Error description" }
```

---

## 📄 Tài liệu liên quan

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Tổng quan kiến trúc chi tiết
- [HELP.md](./HELP.md) — Spring Boot reference links

---

*Built with ❤️ using Spring Boot 4.0.1 & Java 21*
