package com.netflix;

import com.netflix.entities.Role;
import com.netflix.repositories.RoleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableCaching
@Slf4j
public class NetflixApplication {

	public static void main(String[] args) {
		SpringApplication.run(NetflixApplication.class, args);
	}

	@Bean
	public CommandLineRunner initialData(RoleRepository roleRepository) {
		return args -> {
			if (roleRepository.count() == 0) {
				roleRepository.save(new Role(Role.ROLE_USER));
				roleRepository.save(new Role(Role.ROLE_MANAGER));
				roleRepository.save(new Role(Role.ROLE_ADMIN));
				log.info("Initialized default roles successfully");
			}
		};
	}
}
