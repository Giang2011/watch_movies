# 📐 Netflix Clone — Frontend Rules & Conventions

> Quy tắc phát triển Frontend (React) tích hợp với Netflix Backend API.

---

## 1. Tech Stack

| Công nghệ | Vai trò |
|-----------|---------|
| **React 18+** | UI Library |
| **Vite** | Build tool & Dev server |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client (API calls) |
| **Zustand** hoặc **Context API** | State management |
| **CSS Modules** hoặc **Styled Components** | Styling |
| **React Icons** | Icon library |

---

## 2. Quy tắc kiến trúc

### 2.1. Feature-Based Structure

Tổ chức code theo **feature** (không theo type), mỗi feature là một folder chứa đầy đủ:
- Components
- Hooks
- Services (API calls)
- Types

### 2.2. Layer Separation

```
Pages (Routes)  →  Components (UI)  →  Hooks (Logic)  →  Services (API)
```

- **Pages**: Chỉ compose components, không chứa logic phức tạp
- **Components**: UI thuần, nhận props, không gọi API trực tiếp
- **Hooks**: Custom hooks chứa business logic, gọi services
- **Services**: Gọi API, xử lý request/response

### 2.3. Barrel Exports

Mỗi folder feature sử dụng `index.js` để re-export, tránh import paths dài:

```javascript
// features/movies/index.js
export { MovieCard } from './components/MovieCard';
export { useMovies } from './hooks/useMovies';
```

---

## 3. Quy tắc Naming

### 3.1. Files & Folders

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Components | PascalCase | `MovieCard.jsx`, `LoginForm.jsx` |
| Hooks | camelCase, prefix `use` | `useAuth.js`, `useMovies.js` |
| Services | camelCase | `authService.js`, `movieService.js` |
| Pages | PascalCase | `HomePage.jsx`, `LoginPage.jsx` |
| Utils/Helpers | camelCase | `formatDate.js`, `storage.js` |
| CSS Modules | PascalCase + `.module.css` | `MovieCard.module.css` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `TOKEN_KEY` |

### 3.2. Components

- Functional components only (không dùng class components)
- Một component mỗi file
- Tên file = Tên component

### 3.3. Variables & Functions

```javascript
// ✅ Đúng
const isLoading = true;
const handleSubmit = () => {};
const fetchMovies = async () => {};

// ❌ Sai
const loading = true;    // Thiếu prefix is/has cho boolean
const submit = () => {}; // Thiếu prefix handle cho event handlers
```

---

## 4. API Integration

### 4.1. Axios Instance

Tạo một Axios instance chung với interceptors:

```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — tự động gắn JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — xử lý 401 tự động
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 4.2. Service Layer Pattern

Mỗi feature có service file riêng:

```javascript
// src/features/movies/services/movieService.js
import api from '@/services/api';

export const movieService = {
  getMovies: (page = 0, size = 10) =>
    api.get(`/api/movies?page=${page}&size=${size}`),

  searchMovies: (keyword) =>
    api.get(`/api/movies/search?keyword=${keyword}`),

  addMovie: (formData) =>
    api.post('/api/movies', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateMovie: (id, formData) =>
    api.put(`/api/movies/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteMovie: (id) =>
    api.delete(`/api/movies/${id}`),
};
```

### 4.3. Quy tắc gọi API

- ✅ Gọi API trong **custom hooks** hoặc **service layer**
- ❌ KHÔNG gọi API trực tiếp trong component
- ✅ Luôn handle loading, error, success states
- ✅ Dùng `try/catch` hoặc `.catch()` cho mọi API call
- ✅ Hiển thị thông báo lỗi từ `error.response.data.message`

---

## 5. Authentication Flow

### 5.1. Lưu trữ Token

```javascript
// Sau khi login thành công
const loginResponse = {
  token: "eyJhbGci...",
  type: "Bearer",
  id: 1,
  username: "john",
  email: "john@gmail.com",
  roles: ["ROLE_USER"]
};

// Lưu vào localStorage
localStorage.setItem('token', loginResponse.token);
localStorage.setItem('user', JSON.stringify({
  id: loginResponse.id,
  username: loginResponse.username,
  email: loginResponse.email,
  roles: loginResponse.roles,
}));
```

### 5.2. Auth Context/Store

Sử dụng Context API hoặc Zustand để quản lý auth state globally:

```javascript
// Auth state cần quản lý:
{
  user: null | { id, username, email, roles },
  token: null | string,
  isAuthenticated: boolean,
  isAdmin: boolean,
}
```

### 5.3. Protected Routes

```javascript
// PrivateRoute — yêu cầu đăng nhập
<Route element={<PrivateRoute />}>
  <Route path="/favorites" element={<FavoritesPage />} />
</Route>

// AdminRoute — yêu cầu ROLE_ADMIN
<Route element={<AdminRoute />}>
  <Route path="/admin/movies" element={<AdminMoviesPage />} />
</Route>
```

### 5.4. Kiểm tra quyền

```javascript
const isAdmin = user?.roles?.includes('ROLE_ADMIN');
const isManager = user?.roles?.includes('ROLE_MANAGER');
const isUser = user?.roles?.includes('ROLE_USER');
```

---

## 6. Xử lý Media URLs

Backend trả về relative paths cho `thumbnailUrl` và `videoUrl`:

```javascript
// Movie object từ API
{
  "thumbnailUrl": "/uploads/images/thumb123.jpg",
  "videoUrl": "/uploads/videos/abc123.mp4"
}

// Frontend cần nối với BASE_URL:
const getFullUrl = (path) => `${API_BASE_URL}${path}`;

// Sử dụng:
<img src={getFullUrl(movie.thumbnailUrl)} alt={movie.title} />
<video src={getFullUrl(movie.videoUrl)} controls />
```

---

## 7. Styling Rules

### 7.1. Nguyên tắc chung

- Mobile-first responsive design
- Dark theme (Netflix-style) làm theme chính
- Color palette gợi ý:

| Mục | Giá trị |
|-----|---------|
| Background | `#141414` |
| Surface | `#1f1f1f` |
| Primary | `#E50914` (Netflix Red) |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#B3B3B3` |
| Accent | `#E50914` |

### 7.2. Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 576px)  { /* Small */ }
@media (min-width: 768px)  { /* Medium */ }
@media (min-width: 992px)  { /* Large */ }
@media (min-width: 1200px) { /* XL */ }
```

### 7.3. No Inline Styles

- ❌ `style={{ color: 'red' }}` — Tránh inline styles
- ✅ Dùng CSS Modules hoặc styled-components

---

## 8. Error Handling

### 8.1. API Error Pattern

```javascript
try {
  const response = await movieService.getMovies(page, size);
  setMovies(response.data.content);
} catch (error) {
  const message = error.response?.data?.message || 'Đã xảy ra lỗi';
  
  switch (error.response?.status) {
    case 401:
      // Tự động xử lý bởi interceptor
      break;
    case 403:
      toast.error('Bạn không có quyền thực hiện thao tác này');
      break;
    case 429:
      toast.warn('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
      break;
    default:
      toast.error(message);
  }
}
```

### 8.2. Loading States

Mọi component gọi API cần hiển thị 3 trạng thái:
1. **Loading**: Skeleton hoặc spinner
2. **Error**: Error message + retry button
3. **Empty**: Empty state message
4. **Success**: Hiển thị dữ liệu

---

## 9. Performance Rules

### 9.1. Pagination

- Danh sách phim sử dụng **phân trang** (không load all)
- Default: `page=0`, `size=10` (hoặc `size=20` tuỳ design)
- Implement infinite scroll hoặc pagination controls

### 9.2. Image Optimization

- Dùng `loading="lazy"` cho thumbnails
- Placeholder/skeleton khi image đang load
- Fallback image khi load thất bại

### 9.3. Code Splitting

- Lazy load pages với `React.lazy()` + `Suspense`
- Chỉ import components cần thiết

```javascript
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
```

---

## 10. Environment Variables

Sử dụng file `.env` với prefix `VITE_`:

```bash
# .env
VITE_API_URL=http://localhost:8080

# .env.production
VITE_API_URL=https://api.netflix-clone.com
```

Truy cập trong code: `import.meta.env.VITE_API_URL`

---

## 11. Git Rules

### Commit Convention

```
feat: thêm trang danh sách phim
fix: sửa lỗi logout không xoá token
style: cập nhật responsive cho MovieCard
refactor: tách logic auth thành custom hook
```

### Branch Naming

```
feature/movie-list
fix/auth-token-expired
refactor/api-service
```
