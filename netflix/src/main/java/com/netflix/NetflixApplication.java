package com.netflix;

import com.netflix.entities.Role;
import com.netflix.repositories.RoleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;

import java.util.List;

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
			List<String> defaultRoles = List.of(Role.ROLE_USER, Role.ROLE_MANAGER, Role.ROLE_ADMIN);
			for (String roleName : defaultRoles) {
				if (roleRepository.findByName(roleName).isEmpty()) {
					roleRepository.save(new Role(roleName));
					log.info("Created missing role: {}", roleName);
				}
			}
		};
	}
}
