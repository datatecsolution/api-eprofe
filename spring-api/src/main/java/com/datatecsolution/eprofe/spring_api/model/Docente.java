package com.datatecsolution.eprofe.spring_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "docentes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Docente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String nombre;
    private String apellido;
    private Integer genero;
    private String direccion;

    @Column(name = "user_sace")
    private String userSace;

    @JsonIgnore
    @Column(name = "password_sace")
    private String passwordSace;

    @Column(unique = true)
    private String email;

    @JsonIgnore
    private String password;

    @Column(length = 150)
    private String telefono;

    @ManyToMany
    @JoinTable(name = "centro_docente", joinColumns = @JoinColumn(name = "docente_id"), inverseJoinColumns = @JoinColumn(name = "centro_id"))
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Centro> centros;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
