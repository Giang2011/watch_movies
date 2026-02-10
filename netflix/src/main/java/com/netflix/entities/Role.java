package com.netflix.entities;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.Data;
import java.io.Serializable;

@Entity
@Table(name = "roles")
@Data
public class Role implements Serializable {
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Lưu ý: name ở đây sẽ lưu chuỗi dạng "ROLE_ADMIN", "ROLE_USER"...
    @Column(length = 20)
    private String name;
}
