-- 1. Tạo database nếu chưa có
CREATE DATABASE IF NOT EXISTS netflix;
USE netflix;

-- 2. Tạo bảng Roles (Lưu danh sách quyền)
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (name) -- Tên quyền không được trùng nhau
);

-- 2. Tạo bảng Users (Lưu thông tin người dùng)
CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL, -- Độ dài 255 để lưu chuỗi mã hóa BCrypt
    enabled BOOLEAN DEFAULT TRUE,   -- Cờ để khóa tài khoản nếu cần
    PRIMARY KEY (id),
    UNIQUE (username),
    UNIQUE (email)
);

-- 3. Tạo bảng trung gian Users_Roles (Liên kết User và Role)
CREATE TABLE users_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id), -- Khóa chính phức hợp để tránh 1 user bị gán 2 lần cùng 1 quyền
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

-- 4. Tạo bảng Movies (Lưu thông tin phim)
CREATE TABLE movies (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500) NOT NULL, -- Đường dẫn file phim (trên server hoặc cloud)
    thumbnail_url VARCHAR(500),      -- Đường dẫn ảnh bìa
    release_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- 5. Tạo bảng Favorites (Lưu phim yêu thích của User)
CREATE TABLE favorites (
    user_id BIGINT NOT NULL,
    movie_id BIGINT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, movie_id),
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_movie FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE
);


-- =============================================
-- DỮ LIỆU MẪU (Dùng để test)
-- =============================================

-- A. Thêm các quyền (Lưu ý: Spring Security yêu cầu prefix 'ROLE_')
-- INSERT INTO roles (name) VALUES ('ROLE_USER');
-- INSERT INTO roles (name) VALUES ('ROLE_MANAGER');
-- INSERT INTO roles (name) VALUES ('ROLE_ADMIN');

-- -- B. Thêm User mẫu
-- -- Lưu ý: Password ở đây đang là TEXT thô để bạn dễ nhìn. 
-- -- Khi chạy thật trong Spring Boot, chuỗi này PHẢI là chuỗi đã mã hóa (BCrypt).
-- -- Ví dụ: $2a$10$w... (đây là mã hóa của "123456")
-- INSERT INTO users (username, email, password, enabled) 
-- VALUES ('nguoidung', 'user@gmail.com', '$2a$12$G8...', TRUE); 

-- INSERT INTO users (username, email, password, enabled) 
-- VALUES ('quanly', 'admin@gmail.com', '$2a$12$G8...', TRUE);

-- -- C. Gán quyền cho User
-- -- Giả sử 'nguoidung' có id=1 và 'quanly' có id=2
-- -- Giả sử ROLE_USER id=1, ROLE_MANAGER id=2, ROLE_ADMIN id=3

-- -- Gán quyền USER cho 'nguoidung'
-- INSERT INTO users_roles (user_id, role_id) VALUES (1, 1);

-- -- Gán quyền ADMIN và MANAGER cho 'quanly' (Một người 2 quyền)
-- INSERT INTO users_roles (user_id, role_id) VALUES (2, 2);
-- INSERT INTO users_roles (user_id, role_id) VALUES (2, 3);