package com.netflix.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Cấu hình: Khi truy cập đường dẫn /uploads/** // -> sẽ trỏ vào thư mục uploads/ trong máy tính
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}