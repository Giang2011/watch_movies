# 🎬 Movie Streaming Platform - Full-Stack Application

Welcome to the **Movie Streaming Platform** project! This is a complete movie streaming platform featuring user authentication, role-based access control (RBAC), a personalized movie catalog, search functionality, media uploading, and personalized "favorites" management.

The project is built using a modern client-server architecture, with a **React (Vite)** frontend and a **Spring Boot (Java)** backend.

---

## 🏗️ Architecture Overview

The system follows a modern client-server architecture:
- **Frontend**: A Single Page Application (SPA) built with React and Vite. It communicates with the backend via RESTful APIs using Axios.
- **Backend**: A layered RESTful API server built with Spring Boot. It uses a standard presentation, business, data access, and domain layer separation.
- **Caching**: Redis is utilized to cache both movie lists and user authentication sessions to optimize performance.
- **Database**: MySQL is used as the primary persistent data store.
- **Deployment**: The backend, database, and cache are orchestrated together using Docker Compose.

---

## ⚙️ Backend (Spring Boot)

The backend is a robust RESTful API built with Java and Spring Boot, designed for scalability and security.

### Technologies Used:
- **Language/Framework**: Java 21 (LTS), Spring Boot 4.0.1
- **Security**: Spring Security, JJWT (0.11.5) for JWT tokens, Bucket4j for Rate Limiting
- **Data Access & Storage**: Spring Data JPA, Hibernate, MySQL 8.0
- **Caching**: Redis 7 (Alpine)
- **Tools**: Maven, Docker, Lombok

### Key Features & Security:
- **Stateless Authentication**: JWT-based auth with a 24-hour expiry. Passwords are hash-encoded using BCrypt.
- **Role-Based Access Control (RBAC)**: Supports `ROLE_USER`, `ROLE_MANAGER`, and `ROLE_ADMIN`.
- **Rate Limiting**: Protects against DDoS by limiting traffic to 5 requests / 10 seconds / IP using a Token Bucket algorithm.
- **Media Management**: Admins have full CRUD control over movies, including uploading video and thumbnail files (max 10MB per file) via `multipart/form-data`. Files are stored locally in the `/uploads/` directory.

### Database Schema:
- 5 main tables: `users`, `roles`, `users_roles` (N:M mapping), `movies`, and `favorites` (composite primary key indexing users and movies). Auto-updates via Hibernate.

### Caching Strategy:
- **Movie Cache**: Spring Cache serializes movie pages into Redis with a 10-minute TTL. Evicted automatically upon movie Create/Update/Delete.
- **Auth Cache**: Manually caches user sessions (`auth:user:{username}`) in Redis Hashes to avoid redundant database hits for roles and ID validation.

### API Structure (Base: `http://localhost:8080`)
- **Auth**: `POST /api/auth/signup`, `POST /api/auth/signin`
- **Movies**: `GET /api/movies` (paginated), `GET /api/movies/search` (returns IDs). Admins can `POST`, `PUT`, `DELETE`.
- **Favorites**: `POST`, `DELETE`, `GET /api/favorites` (requires JWT).
- **Static Assets**: `GET /uploads/images/**`, `GET /uploads/videos/**`

---

## 💻 Frontend (React + Vite)

The frontend is a responsive, high-performance web application.

### Technologies Used:
- **Core**: React 18+, Vite, React Router v6
- **Data/Logic**: Axios (HTTP client), Zustand / Context API (State Management)
- **Styling**: CSS Modules / Styled Components, React Icons. Mobile-first responsive design following a dark theme (Primary Red: `#E50914`, Dark BG: `#141414`).

### Project Structure (Feature-Based Architecture):
Code is grouped by functionalities (`auth`, `movies`, `favorites`, `admin`) rather than file types to ensure maintainability.
- **`src/features/`**: Contains sub-folders per feature with their own `components/`, `hooks/`, `services/`, and an `index.js` for barrel exports.
- **`src/components/`**: Reusable UI components (Buttons, Inputs, Modals, Layouts, Private/Admin Routes).
- **`src/pages/`**: Compose components mapped to specific routes.
- **`src/services/api.js`**: Contains a global Axios instance equipped with interceptors to automatically attach JWT tokens to requests and handle 401 unauthorized errors (triggering local storage clearing and redirecting to login).

### Guidelines & Conventions:
- **Service Layer Pattern**: Components must not call APIs directly. They should use custom hooks which talk to feature-specific services.
- **State Handling**: Promises must be properly handled (`try/catch`). UI must gracefully account for Loading (Skeleton/Spinner), Error, Empty, and Success states.
- **Performance**: Lazy loading for pages (`React.lazy`), infinite scrolling/pagination for the movie list, and image optimizations (lazy loading placeholders).

---

## 🚀 Setup & Execution 

### Prerequisites
- Docker Desktop and Docker Compose V2
- Node.js (v18+) and npm
- Java 21 (optional for local non-Docker development)

### 1. Run the Backend & Infrastructure (Docker Recommended)
Navigate to the backend directory (`netflix/`) and use Docker Compose to spin up the application, MySQL database, and Redis cache.

```bash
cd netflix
docker-compose up -d
```
*This orchestrates the MySQL, Redis, and a multi-stage Docker build for the backend application automatically on port `8080`.*

### 2. Run the Frontend (Local Dev)
The frontend uses a `.env` file referencing the backend (`VITE_API_URL=http://localhost:8080`). Vite handles proxying `/api` and `/uploads` to circumvent CORS during development.

Open a new terminal, navigate to the frontend directory, install dependencies, and start the development server:

```bash
cd frontend
npm install
npm run dev
```

Your frontend will now be running (usually on `http://localhost:5173`) and communicating with your backend at `http://localhost:8080`.

---

## 🛡️ License
This project is for educational and portfolio purposes.
