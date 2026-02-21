# ============================
# Dockerfile cho ứng dụng Netflix Backend (Spring Boot)
# ============================

# --- Giai đoạn 1: Build ứng dụng ---
# Sử dụng Maven với JDK 21 để build project
FROM maven:3.9-eclipse-temurin-21 AS build

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép file cấu hình Maven trước để tận dụng Docker cache (tránh tải lại dependency mỗi lần build)
COPY pom.xml .
COPY mvnw .
COPY mvnw.cmd .

# Tải trước tất cả dependency (bước này được cache nếu pom.xml không thay đổi)
RUN mvn dependency:go-offline -B

# Sao chép toàn bộ mã nguồn vào container
COPY src ./src

# Build ứng dụng, bỏ qua test để tăng tốc quá trình build
RUN mvn clean package -DskipTests -B

# --- Giai đoạn 2: Chạy ứng dụng ---
# Sử dụng JRE 21 nhẹ hơn (chỉ cần runtime, không cần compiler)
FROM eclipse-temurin:21-jre

# Đặt thư mục làm việc
WORKDIR /app

# Tạo thư mục uploads để lưu file upload (video, ảnh)
RUN mkdir -p /app/uploads/images /app/uploads/videos

# Sao chép file JAR đã build từ giai đoạn 1
COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8080 (cổng mặc định của Spring Boot)
EXPOSE 8080

# Lệnh khởi chạy ứng dụng
# -Djava.security.egd: tăng tốc khởi động trên Linux
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
