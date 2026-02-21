package com.netflix.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Bộ lọc giới hạn tốc độ request (Rate Limiting Filter).
 *
 * Mục đích: Ngăn chặn việc gửi quá nhiều request trong thời gian ngắn
 * từ cùng một địa chỉ IP, giúp bảo vệ server khỏi bị quá tải hoặc tấn công DDoS.
 *
 * Cấu hình hiện tại: Tối đa 5 request trong 10 giây cho mỗi địa chỉ IP.
 *
 * Sử dụng thuật toán Token Bucket thông qua thư viện Bucket4j:
 * - Mỗi IP sẽ có một "xô" (bucket) chứa tối đa 5 token.
 * - Mỗi request sẽ tiêu tốn 1 token.
 * - Sau mỗi 10 giây, xô sẽ được nạp đầy lại 5 token.
 * - Nếu hết token, request sẽ bị từ chối với mã lỗi 429 (Too Many Requests).
 */
@Component
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    // Số lượng request tối đa được phép trong một khoảng thời gian
    private static final int MAX_REQUESTS = 5;

    // Khoảng thời gian giới hạn (tính bằng giây)
    private static final int TIME_WINDOW_SECONDS = 10;

    /**
     * Bộ nhớ đệm lưu trữ bucket cho từng địa chỉ IP.
     * Sử dụng ConcurrentHashMap để đảm bảo an toàn khi nhiều luồng (thread) truy cập đồng thời.
     */
    private final Map<String, Bucket> bucketCache = new ConcurrentHashMap<>();

    /**
     * Tạo một bucket mới cho mỗi địa chỉ IP.
     * Bucket này cho phép tối đa MAX_REQUESTS request trong TIME_WINDOW_SECONDS giây.
     */
    private Bucket createNewBucket() {
        // Cấu hình băng thông: cho phép tối đa 5 request mỗi 10 giây
        Bandwidth limit = Bandwidth.builder()
                .capacity(MAX_REQUESTS)                          // Sức chứa tối đa của xô: 5 token
                .refillGreedy(MAX_REQUESTS, Duration.ofSeconds(TIME_WINDOW_SECONDS)) // Nạp lại 5 token mỗi 10 giây
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Lấy bucket tương ứng với địa chỉ IP.
     * Nếu IP chưa có bucket, sẽ tạo mới một bucket.
     */
    private Bucket resolveBucket(String ipAddress) {
        return bucketCache.computeIfAbsent(ipAddress, key -> createNewBucket());
    }

    /**
     * Lấy địa chỉ IP thực của client.
     * Ưu tiên kiểm tra header "X-Forwarded-For" (dùng khi có proxy/load balancer phía trước),
     * nếu không có thì lấy từ request trực tiếp.
     */
    private String getClientIP(HttpServletRequest request) {
        // Kiểm tra header X-Forwarded-For (thường được proxy/load balancer thêm vào)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Lấy IP đầu tiên trong danh sách (IP gốc của client)
            return xForwardedFor.split(",")[0].trim();
        }

        // Kiểm tra header X-Real-IP (một số proxy sử dụng header này)
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        // Nếu không có proxy, lấy IP trực tiếp từ request
        return request.getRemoteAddr();
    }

    /**
     * Phương thức chính xử lý logic giới hạn request.
     * Được gọi mỗi khi có request đến server.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Bước 1: Lấy địa chỉ IP của client
        String clientIP = getClientIP(request);

        // Bước 2: Lấy bucket tương ứng với IP này
        Bucket bucket = resolveBucket(clientIP);

        // Bước 3: Thử tiêu thụ 1 token từ bucket
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            // Nếu còn token → cho phép request đi qua

            // Thêm header để client biết còn bao nhiêu request được phép
            response.addHeader("X-Rate-Limit-Remaining",
                    String.valueOf(probe.getRemainingTokens()));

            // Cho request tiếp tục đi qua các filter tiếp theo
            filterChain.doFilter(request, response);
        } else {
            // Nếu hết token → từ chối request với mã lỗi 429

            // Tính thời gian chờ (bao lâu nữa thì có thể gửi request tiếp)
            long waitTimeSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;

            log.warn("Rate limit đã vượt quá giới hạn cho IP: {}. Cần chờ {} giây.",
                    clientIP, waitTimeSeconds);

            // Thêm header Retry-After để client biết cần chờ bao lâu
            response.addHeader("Retry-After", String.valueOf(waitTimeSeconds));
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json;charset=UTF-8");

            // Trả về thông báo lỗi cho client bằng JSON
            String errorMessage = String.format(
                    "{\"message\": \"Bạn đã gửi quá nhiều request. Vui lòng thử lại sau %d giây.\"}",
                    waitTimeSeconds
            );
            response.getWriter().write(errorMessage);
        }
    }
}
