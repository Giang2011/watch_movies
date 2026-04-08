# 🏗️ Netflix Backend — Architecture Overview

> Tài liệu mô tả chi tiết kiến trúc hệ thống backend của ứng dụng Netflix Clone.

---

## 1. Tổng quan hệ thống

Netflix Backend là một **RESTful API server** trên nền tảng **Spring Boot 4.0.1**, cung cấp:

- **Quản lý người dùng**: Đăng ký, đăng nhập, phân quyền RBAC
- **Quản lý phim**: CRUD phim với upload video/thumbnail
- **Danh sách yêu thích**: Người dùng lưu/xóa phim yêu thích
- **Bảo mật**: JWT stateless + Rate limiting chống DDoS
- **Hiệu suất**: Redis caching cho phim và user session

### Sơ đồ tổng quan

```
┌──────────┐   HTTPS/REST   ┌────────────────────────────────┐
│  Client  │ ──────────────►│       SPRING BOOT APP          │
│ (Browser/│                 │ RateLimitFilter → AuthFilter   │
│  Mobile) │ ◄──────────────│ Controller → Service → Repo    │
└──────────┘  JSON Response  └──────┬──────────────┬─────────┘
                                    │              │
                              ┌─────▼─────┐ ┌─────▼──────┐
                              │  Redis 7  │ │  MySQL 8.0 │
                              │  (Cache)  │ │ (Database) │
                              └───────────┘ └────────────┘
```

---

## 2. Technology Stack

| Thành phần | Công nghệ | Phiên bản | Vai trò |
|------------|-----------|-----------|---------|
| **Runtime** | Java (Temurin) | 21 LTS | Ngôn ngữ chính |
| **Framework** | Spring Boot | 4.0.1 | Web framework, DI |
| **Security** | Spring Security + JJWT | 0.11.5 | JWT auth, RBAC |
| **Rate Limit** | Bucket4j | 8.10.1 | Token bucket per IP |
| **ORM** | Spring Data JPA | — | Object-Relational Mapping |
| **Database** | MySQL | 8.0 | Persistent storage |
| **Cache** | Redis | 7 Alpine | Caching phim + user |
| **Build** | Maven | 3.9+ | Build & dependency |
| **Code Gen** | Lombok | — | Giảm boilerplate |
| **Container** | Docker Compose | — | Deployment |

---

## 3. Kiến trúc phân lớp (Layered Architecture)

```
┌──────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER (Controllers)            │
│  AuthController │ MovieController │ FavoriteController   │
├──────────────────────────────────────────────────────────┤
│              BUSINESS LAYER (Services)                   │
│  MovieService │ FavoriteService │ UserCacheService        │
├──────────────────────────────────────────────────────────┤
│              DATA ACCESS LAYER (Repositories)            │
│  MovieRepo │ FavoriteRepo │ UserRepo │ RoleRepo          │
├──────────────────────────────────────────────────────────┤
│              DOMAIN LAYER (Entities)                     │
│  User │ Role │ Movie │ Favorite │ FavoriteId             │
└──────────────────────────────────────────────────────────┘
```

**Nguyên tắc**: Controller → Service → Repository → Entity (lớp trên chỉ gọi lớp ngay bên dưới).

---

## 4. Cấu trúc thư mục

```
netflix/
├── docker-compose.yml        # MySQL + Redis + Backend orchestration
├── Dockerfile                # Multi-stage build (Maven → JRE 21)
├── pom.xml                   # Dependencies & plugins
├── init/init.sql             # DB schema initialization
├── uploads/                  # File storage (images/, videos/)
└── src/main/java/com/netflix/
    ├── NetflixApplication.java
    ├── config/               # RedisConfig, MvcConfig
    ├── controllers/          # AuthController, MovieController, FavoriteController
    ├── dtos/                 # JwtResponse, LoginRequest, SignupRequest, MessageResponse
    ├── entities/             # User, Role, Movie, Favorite, FavoriteId
    ├── exceptions/           # GlobalExceptionHandler
    ├── repositories/         # JPA repository interfaces
    ├── security/             # WebSecurityConfig, AuthTokenFilter, RateLimitFilter, JwtUtils
    └── services/impl/        # MovieService, FavoriteService, UserCacheService
```

---

## 5. Chi tiết từng Package

### 5.1. Entities

| Entity | Table | Mô tả | Quan hệ |
|--------|-------|--------|---------|
| `User` | `users` | username, email, password (BCrypt) | ManyToMany → Role |
| `Role` | `roles` | ROLE_USER / ROLE_MANAGER / ROLE_ADMIN | ManyToMany ← User |
| `Movie` | `movies` | title, description, videoUrl, thumbnailUrl, releaseYear | — |
| `Favorite` | `favorites` | Composite key + savedAt timestamp | ManyToOne → User, Movie |
| `FavoriteId` | *(embedded)* | Composite PK: userId + movieId | Embeddable |

### 5.2. Repositories

| Repository | Custom Queries |
|------------|---------------|
| `UserRepository` | `findByUsernameWithRoles` (JOIN FETCH), `existsByUsername/Email` |
| `MovieRepository` | `searchIdsByTitle` (JPQL LIKE, case-insensitive) |
| `FavoriteRepository` | `findMoviesByUserId` (JPQL) |

### 5.3. Services

| Service | Vai trò |
|---------|---------|
| `MovieService` | CRUD phim + file upload/delete + Redis `@Cacheable`/`@CacheEvict` |
| `FavoriteService` | Add/remove/list favorites, kiểm tra tồn tại trước thao tác |
| `UserCacheService` | Cache user vào Redis Hash (`auth:user:{username}`), TTL 10 phút |
| `UserDetailsImpl` | Spring Security `UserDetails` implementation |
| `UserDetailsServiceImpl` | Load user từ DB cho authentication |

### 5.4. Controllers - API Endpoints

#### Auth (`/api/auth`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/auth/signin` | Public | Đăng nhập → JWT token |
| POST | `/api/auth/signup` | Public | Đăng ký (default: ROLE_USER) |

#### Movies (`/api/movies`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/movies?page=&size=` | Public | Danh sách phim (phân trang) |
| GET | `/api/movies/search?keyword=` | Public | Tìm ID phim theo keyword |
| POST | `/api/movies` | ADMIN | Thêm phim (multipart) |
| PUT | `/api/movies/{id}` | ADMIN | Cập nhật phim |
| DELETE | `/api/movies/{id}` | ADMIN | Xóa phim + file |

#### Favorites (`/api/favorites`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/favorites/{movieId}` | Authenticated | Thêm yêu thích |
| DELETE | `/api/favorites/{movieId}` | Authenticated | Bỏ yêu thích |
| GET | `/api/favorites` | Authenticated | Danh sách yêu thích |

### 5.5. DTOs

| DTO | Hướng | Trường |
|-----|-------|--------|
| `LoginRequest` | Request | username, password |
| `SignupRequest` | Request | username, email, password, roles |
| `JwtResponse` | Response | token, type("Bearer"), id, username, email, roles |
| `MessageResponse` | Response | message |

---

## 6. Security Architecture

### Chuỗi Filter

```
Request → RateLimitFilter (5 req/10s/IP) → AuthTokenFilter (JWT) → Controller
                │ FAIL→429                      │ Invalid→401
```

### Thành phần bảo mật

| Component | Vai trò |
|-----------|---------|
| `WebSecurityConfig` | SecurityFilterChain, public/protected paths |
| `AuthTokenFilter` | Extract & validate JWT từ `Authorization: Bearer <token>` |
| `RateLimitFilter` | Bucket4j Token Bucket: 5 req/10s per IP |
| `AuthEntryPointJwt` | HTTP 401 cho unauthenticated requests |
| `JwtUtils` | Generate/Validate JWT (HS256, 24h expiry, Base64 secret) |

### Phân quyền RBAC

| Role | Quyền |
|------|-------|
| `ROLE_USER` | Xem phim, tìm kiếm, quản lý yêu thích |
| `ROLE_MANAGER` | Tương tự USER (mở rộng trong tương lai) |
| `ROLE_ADMIN` | Toàn quyền: thêm/sửa/xóa phim |

### Public Endpoints (không cần token)

`/api/auth/**`, `/uploads/**`, `GET /api/movies`, `GET /api/movies/search`, `/swagger-ui/**`, `/api-docs/**`

---

## 7. Caching Strategy

### Movie Cache (Spring Cache)
- **Cache name**: `movies` | **Key**: `{page}_{size}`
- **TTL**: 10 phút | **Eviction**: `@CacheEvict(allEntries=true)` khi CUD
- **Serializer**: `GenericJackson2JsonRedisSerializer`

### User Auth Cache (Manual Redis Hash)
- **Key pattern**: `auth:user:{username}`
- **Data**: `{id, username, email, roles}` | **TTL**: 10 phút
- **Fallback**: Redis fail → query DB + log warning

---

## 8. Database Schema

```
users ◄──── users_roles ────► roles
  │              (N:M)
  │ 1:N
  ▼
favorites ────► movies
  (composite PK: user_id + movie_id)
```

**5 bảng**: `users`, `roles`, `users_roles`, `movies`, `favorites`
- Composite PK cho `favorites` và `users_roles`
- CASCADE DELETE: xóa user → xóa favorites + role mappings
- Character set: `utf8mb4_unicode_ci`

---

## 9. Docker Deployment

### Docker Compose (3 services)

| Service | Image | Port | Volume |
|---------|-------|------|--------|
| `mysql` | mysql:8.0 | 3307→3306 | mysql_data |
| `redis` | redis:7-alpine | 6379→6379 | redis_data |
| `backend` | Dockerfile (multi-stage) | 8080→8080 | ./uploads |

- **Health checks**: MySQL (`mysqladmin ping`) + Redis (`redis-cli ping`)
- **Startup order**: mysql (healthy) + redis (healthy) → backend
- **Network**: `netflix-network` (bridge)
- **Multi-stage Dockerfile**: Maven build (JDK 21) → Runtime (JRE 21)

---

## 10. Exception Handling

`GlobalExceptionHandler` (`@RestControllerAdvice`):

| Exception | HTTP | Response |
|-----------|------|----------|
| `BadCredentialsException` | 401 | "Invalid username or password" |
| `RuntimeException` | 400 | Exception message |
| `IllegalArgumentException` | 400 | Exception message |
| `MaxUploadSizeExceededException` | 413 | "File size exceeds limit" |
| `Exception` (catch-all) | 500 | "An unexpected error occurred" |

---

## 📊 Tổng kết

| Metric | Value |
|--------|-------|
| Java classes | ~25 |
| API endpoints | 8 |
| Entities/Tables | 5 entities (4 tables + 1 join table) |
| Security | JWT + Rate Limiting + RBAC |
| Caching | Redis (movie + user auth cache) |
| File storage | Local disk (`/uploads/`) |
| Max upload | 10MB per file |
