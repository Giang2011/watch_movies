# 📁 Netflix Clone — Frontend Project Structure

> Cấu trúc thư mục cho dự án React Frontend (Vite) tích hợp với Netflix Backend.

---

## Tổng quan

Dự án sử dụng **Feature-Based Architecture** — tổ chức code theo tính năng thay vì theo loại file, giúp dễ mở rộng và bảo trì.

---

## Cây thư mục

```
netflix-frontend/
├── public/
│   ├── favicon.ico
│   └── netflix-logo.svg
│
├── src/
│   ├── assets/                          # Static assets
│   │   ├── images/
│   │   │   ├── hero-bg.jpg              # Background cho hero section
│   │   │   ├── default-avatar.png       # Avatar mặc định
│   │   │   └── fallback-thumbnail.jpg   # Fallback khi thumbnail lỗi
│   │   └── styles/
│   │       ├── global.css               # CSS variables, reset, typography
│   │       └── animations.css           # Keyframe animations dùng chung
│   │
│   ├── components/                      # Shared/Common components
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx               # Navigation bar (logo, search, user menu)
│   │   │   ├── Navbar.module.css
│   │   │   ├── Footer.jsx               # Footer
│   │   │   ├── Footer.module.css
│   │   │   ├── Layout.jsx               # Layout wrapper (Navbar + Outlet + Footer)
│   │   │   └── Layout.module.css
│   │   ├── UI/
│   │   │   ├── Button.jsx               # Reusable button component
│   │   │   ├── Button.module.css
│   │   │   ├── Input.jsx                # Reusable input component
│   │   │   ├── Input.module.css
│   │   │   ├── Modal.jsx                # Modal dialog
│   │   │   ├── Modal.module.css
│   │   │   ├── Spinner.jsx              # Loading spinner
│   │   │   ├── Skeleton.jsx             # Skeleton loading placeholder
│   │   │   ├── Toast.jsx                # Toast notification
│   │   │   └── ErrorMessage.jsx         # Error display component
│   │   ├── PrivateRoute.jsx             # Protected route (yêu cầu login)
│   │   └── AdminRoute.jsx               # Admin-only route (ROLE_ADMIN)
│   │
│   ├── features/                        # Feature modules
│   │   │
│   │   ├── auth/                        # 🔐 Authentication feature
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.jsx        # Form đăng nhập
│   │   │   │   ├── LoginForm.module.css
│   │   │   │   ├── SignupForm.jsx       # Form đăng ký
│   │   │   │   └── SignupForm.module.css
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.js           # Hook: login, signup, logout, auth state
│   │   │   ├── services/
│   │   │   │   └── authService.js       # API: POST /api/auth/signin, /signup
│   │   │   ├── context/
│   │   │   │   └── AuthContext.jsx      # Auth context provider (user, token, roles)
│   │   │   └── index.js                 # Barrel exports
│   │   │
│   │   ├── movies/                      # 🎬 Movies feature
│   │   │   ├── components/
│   │   │   │   ├── MovieCard.jsx        # Card hiển thị phim (thumbnail, title)
│   │   │   │   ├── MovieCard.module.css
│   │   │   │   ├── MovieGrid.jsx        # Grid layout danh sách phim
│   │   │   │   ├── MovieGrid.module.css
│   │   │   │   ├── MovieRow.jsx         # Horizontal scroll row (kiểu Netflix)
│   │   │   │   ├── MovieRow.module.css
│   │   │   │   ├── MovieDetail.jsx      # Chi tiết phim (modal hoặc page)
│   │   │   │   ├── MovieDetail.module.css
│   │   │   │   ├── HeroBanner.jsx       # Banner phim nổi bật
│   │   │   │   ├── HeroBanner.module.css
│   │   │   │   ├── SearchBar.jsx        # Thanh tìm kiếm phim
│   │   │   │   ├── SearchBar.module.css
│   │   │   │   ├── VideoPlayer.jsx      # Phát video phim
│   │   │   │   └── VideoPlayer.module.css
│   │   │   ├── hooks/
│   │   │   │   ├── useMovies.js         # Hook: fetch paginated movies
│   │   │   │   └── useSearchMovies.js   # Hook: search movies by keyword
│   │   │   ├── services/
│   │   │   │   └── movieService.js      # API: GET/POST/PUT/DELETE /api/movies
│   │   │   └── index.js
│   │   │
│   │   ├── favorites/                   # ❤️ Favorites feature
│   │   │   ├── components/
│   │   │   │   ├── FavoriteButton.jsx   # Nút yêu thích (toggle ❤️)
│   │   │   │   ├── FavoriteButton.module.css
│   │   │   │   ├── FavoriteList.jsx     # Danh sách phim yêu thích
│   │   │   │   └── FavoriteList.module.css
│   │   │   ├── hooks/
│   │   │   │   └── useFavorites.js      # Hook: add, remove, list favorites
│   │   │   ├── services/
│   │   │   │   └── favoriteService.js   # API: POST/DELETE/GET /api/favorites
│   │   │   └── index.js
│   │   │
│   │   └── admin/                       # 🔧 Admin feature (CRUD phim)
│   │       ├── components/
│   │       │   ├── MovieForm.jsx        # Form thêm/sửa phim (upload files)
│   │       │   ├── MovieForm.module.css
│   │       │   ├── MovieTable.jsx       # Bảng quản lý phim
│   │       │   ├── MovieTable.module.css
│   │       │   ├── AdminSidebar.jsx     # Sidebar navigation admin
│   │       │   └── AdminSidebar.module.css
│   │       ├── hooks/
│   │       │   └── useAdminMovies.js    # Hook: CRUD operations cho admin
│   │       ├── services/
│   │       │   └── adminService.js      # Re-use movieService hoặc extend
│   │       └── index.js
│   │
│   ├── pages/                           # Page components (Route targets)
│   │   ├── HomePage.jsx                 # Trang chủ: HeroBanner + MovieRows
│   │   ├── HomePage.module.css
│   │   ├── LoginPage.jsx                # Trang đăng nhập
│   │   ├── LoginPage.module.css
│   │   ├── SignupPage.jsx               # Trang đăng ký
│   │   ├── SignupPage.module.css
│   │   ├── BrowsePage.jsx              # Trang duyệt phim (grid + search)
│   │   ├── BrowsePage.module.css
│   │   ├── MoviePage.jsx                # Trang chi tiết phim + player
│   │   ├── MoviePage.module.css
│   │   ├── FavoritesPage.jsx            # Trang danh sách yêu thích
│   │   ├── FavoritesPage.module.css
│   │   ├── AdminDashboard.jsx           # Trang quản trị phim
│   │   ├── AdminDashboard.module.css
│   │   └── NotFoundPage.jsx             # Trang 404
│   │
│   ├── services/                        # Core services
│   │   └── api.js                       # Axios instance + interceptors
│   │
│   ├── utils/                           # Utility functions
│   │   ├── constants.js                 # API URLs, storage keys, config
│   │   ├── helpers.js                   # getFullMediaUrl(), formatYear()...
│   │   └── storage.js                   # LocalStorage wrapper (get/set/remove)
│   │
│   ├── hooks/                           # Global/shared hooks
│   │   ├── useDebounce.js               # Debounce cho search input
│   │   └── usePagination.js             # Pagination logic
│   │
│   ├── App.jsx                          # Root component + Router setup
│   ├── App.module.css
│   └── main.jsx                         # Entry point (ReactDOM.createRoot)
│
├── .env                                 # VITE_API_URL=http://localhost:8080
├── .env.production                      # VITE_API_URL=https://api.example.com
├── .gitignore
├── index.html                           # Vite HTML entry
├── package.json
├── vite.config.js                       # Vite configuration + path aliases
└── README.md                            # Frontend README
```

---

## Chi tiết từng thư mục

### `src/assets/`

Chứa tài nguyên tĩnh (ảnh, CSS global).

| File | Vai trò |
|------|---------|
| `global.css` | CSS variables (colors, spacing), reset, font imports |
| `animations.css` | Shared keyframe animations (fade-in, slide-up...) |

### `src/components/`

**Shared components** được dùng lại ở nhiều features.

| Component | Vai trò |
|-----------|---------|
| `Layout` | Wrapper: Navbar + `<Outlet />` + Footer |
| `PrivateRoute` | Redirect → `/login` nếu chưa đăng nhập |
| `AdminRoute` | Redirect → `/` nếu không phải ADMIN |
| `UI/*` | Button, Input, Modal, Spinner, Skeleton, Toast |

### `src/features/`

Mỗi feature là một module độc lập:

| Feature | Mô tả | API liên quan |
|---------|--------|---------------|
| `auth` | Đăng nhập, đăng ký, quản lý session | `/api/auth/*` |
| `movies` | Hiển thị, tìm kiếm, phát phim | `GET /api/movies*` |
| `favorites` | Quản lý danh sách yêu thích | `/api/favorites/*` |
| `admin` | CRUD phim (chỉ admin) | `POST/PUT/DELETE /api/movies` |

### `src/pages/`

Mỗi page tương ứng với một route, compose các components từ features:

| Page | Route | Auth Required |
|------|-------|---------------|
| `HomePage` | `/` | ❌ |
| `LoginPage` | `/login` | ❌ |
| `SignupPage` | `/signup` | ❌ |
| `BrowsePage` | `/browse` | ❌ |
| `MoviePage` | `/movie/:id` | ❌ |
| `FavoritesPage` | `/favorites` | ✅ User |
| `AdminDashboard` | `/admin` | ✅ Admin |
| `NotFoundPage` | `*` | ❌ |

### `src/services/`

| File | Vai trò |
|------|---------|
| `api.js` | Axios instance, base URL, JWT interceptor, 401 handler |

### `src/utils/`

| File | Vai trò |
|------|---------|
| `constants.js` | `API_BASE_URL`, `TOKEN_KEY`, `USER_KEY` |
| `helpers.js` | `getFullMediaUrl(path)`, `formatYear()`, `extractErrorMessage()` |
| `storage.js` | `getToken()`, `setToken()`, `getUser()`, `removeAuth()` |

---

## Routing Map

```javascript
// App.jsx
<Routes>
  {/* Public Routes */}
  <Route element={<Layout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/browse" element={<BrowsePage />} />
    <Route path="/movie/:id" element={<MoviePage />} />
  </Route>

  {/* Auth Routes (no layout) */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />

  {/* Protected Routes */}
  <Route element={<Layout />}>
    <Route element={<PrivateRoute />}>
      <Route path="/favorites" element={<FavoritesPage />} />
    </Route>
  </Route>

  {/* Admin Routes */}
  <Route element={<Layout />}>
    <Route element={<AdminRoute />}>
      <Route path="/admin" element={<AdminDashboard />} />
    </Route>
  </Route>

  {/* 404 */}
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

---

## Cấu hình Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

> **Proxy**: Dev server proxy `/api` và `/uploads` tới backend → tránh CORS issues khi dev.

---

## Dependencies gợi ý

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "react-icons": "^4.x",
    "react-toastify": "^9.x"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x",
    "vite": "^5.x"
  }
}
```
