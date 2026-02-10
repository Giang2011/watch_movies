package com.netflix;

import com.netflix.entities.Role;
import com.netflix.repositories.RoleRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;



import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class NetflixApplication {

	public static void main(String[] args) {
		SpringApplication.run(NetflixApplication.class, args);
	}

	// Hàm này sẽ chạy ngay sau khi ứng dụng khởi động thành công
	@Bean
	public CommandLineRunner initialData(RoleRepository roleRepository) {
		return args -> {
			// Kiểm tra xem bảng role có dữ liệu chưa, nếu chưa thì mới thêm
			if (roleRepository.count() == 0) {
				// Tạo Role USER
				Role userRole = new Role();
				userRole.setName("ROLE_USER");
				roleRepository.save(userRole);

				// Tạo Role MANAGER
				Role managerRole = new Role();
				managerRole.setName("ROLE_MANAGER");
				roleRepository.save(managerRole);

				// Tạo Role ADMIN
				Role adminRole = new Role();
				adminRole.setName("ROLE_ADMIN");
				roleRepository.save(adminRole);

				System.out.println("---------------------------------");
				System.out.println("ĐÃ KHỞI TẠO DỮ LIỆU ROLE MẪU THÀNH CÔNG");
				System.out.println("---------------------------------");
			}
		};
	}
}
