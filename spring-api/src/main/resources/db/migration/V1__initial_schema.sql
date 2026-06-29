-- ============================================================
-- eProfe - Schema inicial basado en migraciones Laravel
-- Generado desde 30 migraciones de Laravel (2014-2020)
-- ============================================================

-- 1. users (Laravel auth default)
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. password_resets
CREATE TABLE IF NOT EXISTS password_resets (
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    INDEX password_resets_email_index (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. alumnos
CREATE TABLE IF NOT EXISTS alumnos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rne VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    genero INT NOT NULL,
    telefono INT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. asignaturas
CREATE TABLE IF NOT EXISTS asignaturas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alias VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. modalidades
CREATE TABLE IF NOT EXISTS modalidades (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alias VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    observaciones VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. docentes
CREATE TABLE IF NOT EXISTS docentes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    genero INT NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    user_sace VARCHAR(255) NOT NULL,
    password_sace VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(150) NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. centros
CREATE TABLE IF NOT EXISTS centros (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(250) NOT NULL,
    codigo_sace VARCHAR(20) NOT NULL UNIQUE,
    direccion VARCHAR(250) NOT NULL,
    telefono VARCHAR(150) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. periodos
CREATE TABLE IF NOT EXISTS periodos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_final DATE NOT NULL,
    estado BOOLEAN NULL,
    observaciones VARCHAR(300) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. secciones (con centro_id y periodo_id ya incluidos)
CREATE TABLE IF NOT EXISTS secciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    modalidad_id INT UNSIGNED NOT NULL,
    curso VARCHAR(255) NOT NULL,
    seccion VARCHAR(1) NOT NULL,
    jornada VARCHAR(255) NOT NULL,
    centro_id INT NULL,
    periodo_id INT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX secciones_modalidad_id_index (modalidad_id),
    INDEX secciones_centro_id_index (centro_id),
    CONSTRAINT secciones_modalidad_id_foreign
        FOREIGN KEY (modalidad_id) REFERENCES modalidades(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. images
CREATE TABLE IF NOT EXISTS images (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    thumbnail VARCHAR(255) NULL,
    imageLink VARCHAR(255) NULL,
    user_id INT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. encabezadoasistencias
CREATE TABLE IF NOT EXISTS encabezadoasistencias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seccion_id INT UNSIGNED NOT NULL,
    asignatura_id INT UNSIGNED NOT NULL,
    fecha DATE NOT NULL,
    movil_id INT UNSIGNED NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX encabezadoasistencias_seccion_id_index (seccion_id),
    INDEX encabezadoasistencias_asignatura_id_index (asignatura_id),
    INDEX encabezadoasistencias_movil_id_index (movil_id),
    CONSTRAINT encabezadoasistencias_seccion_id_foreign
        FOREIGN KEY (seccion_id) REFERENCES secciones(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT encabezadoasistencias_asignatura_id_foreign
        FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. matriculas
CREATE TABLE IF NOT EXISTS matriculas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT UNSIGNED NOT NULL,
    seccion_id INT UNSIGNED NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX matriculas_alumno_id_index (alumno_id),
    INDEX matriculas_seccion_id_index (seccion_id),
    CONSTRAINT matriculas_alumno_id_foreign
        FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT matriculas_seccion_id_foreign
        FOREIGN KEY (seccion_id) REFERENCES secciones(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. tipoacumulativos
CREATE TABLE IF NOT EXISTS tipoacumulativos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. acumulativos
CREATE TABLE IF NOT EXISTS acumulativos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seccion_id INT UNSIGNED NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    tipo_acumulativo_id INT UNSIGNED NOT NULL,
    fecha DATE NOT NULL,
    parcial VARCHAR(10) NULL,
    valor DOUBLE NOT NULL,
    asignatura_id INT UNSIGNED NOT NULL,
    movil_id INT UNSIGNED NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX acumulativos_seccion_id_index (seccion_id),
    INDEX acumulativos_tipo_acumulativo_id_index (tipo_acumulativo_id),
    INDEX acumulativos_asignatura_id_index (asignatura_id),
    INDEX acumulativos_movil_id_index (movil_id),
    CONSTRAINT acumulativos_seccion_id_foreign
        FOREIGN KEY (seccion_id) REFERENCES secciones(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT acumulativos_tipo_acumulativo_id_foreign
        FOREIGN KEY (tipo_acumulativo_id) REFERENCES tipoacumulativos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT acumulativos_asignatura_id_foreign
        FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. notaacumulativos
CREATE TABLE IF NOT EXISTS notaacumulativos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT UNSIGNED NOT NULL,
    acumulativo_id INT UNSIGNED NOT NULL,
    nota DOUBLE NOT NULL,
    movil_id INT UNSIGNED NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX notaacumulativos_alumno_id_index (alumno_id),
    INDEX notaacumulativos_acumulativo_id_index (acumulativo_id),
    INDEX notaacumulativos_movil_id_index (movil_id),
    CONSTRAINT notaacumulativos_alumno_id_foreign
        FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT notaacumulativos_acumulativo_id_foreign
        FOREIGN KEY (acumulativo_id) REFERENCES acumulativos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. detallesasistencias
CREATE TABLE IF NOT EXISTS detallesasistencias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT UNSIGNED NOT NULL,
    encabezadoasistencia_id INT UNSIGNED NOT NULL,
    estado BOOLEAN NOT NULL,
    excusa BOOLEAN NULL,
    movil_id INT UNSIGNED NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX detallesasistencias_alumno_id_index (alumno_id),
    INDEX detallesasistencias_encabezadoasistencia_id_index (encabezadoasistencia_id),
    INDEX detallesasistencias_movil_id_index (movil_id),
    CONSTRAINT detallesasistencias_alumno_id_foreign
        FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT detallesasistencias_encabezadoasistencia_id_foreign
        FOREIGN KEY (encabezadoasistencia_id) REFERENCES encabezadoasistencias(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. centro_docente (pivot)
CREATE TABLE IF NOT EXISTS centro_docente (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    docente_id INT UNSIGNED NOT NULL,
    centro_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX centro_docente_docente_id_index (docente_id),
    INDEX centro_docente_centro_id_index (centro_id),
    CONSTRAINT centro_docente_docente_id_foreign
        FOREIGN KEY (docente_id) REFERENCES docentes(id)
        ON UPDATE CASCADE,
    CONSTRAINT centro_docente_centro_id_foreign
        FOREIGN KEY (centro_id) REFERENCES centros(id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. centros_modalidades (pivot)
CREATE TABLE IF NOT EXISTS centros_modalidades (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    centro_id INT UNSIGNED NOT NULL,
    modalidad_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX centros_modalidades_centro_id_index (centro_id),
    INDEX centros_modalidades_modalidad_id_index (modalidad_id),
    CONSTRAINT centros_modalidades_centro_id_foreign
        FOREIGN KEY (centro_id) REFERENCES centros(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT centros_modalidades_modalidad_id_foreign
        FOREIGN KEY (modalidad_id) REFERENCES modalidades(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. asignaturas_secciones (pivot con docente - tabla implicita en Laravel)
CREATE TABLE IF NOT EXISTS asignaturas_secciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    asignatura_id INT UNSIGNED NOT NULL,
    seccion_id INT UNSIGNED NOT NULL,
    docente_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX asignaturas_secciones_asignatura_id_index (asignatura_id),
    INDEX asignaturas_secciones_seccion_id_index (seccion_id),
    INDEX asignaturas_secciones_docente_id_index (docente_id),
    CONSTRAINT asignaturas_secciones_asignatura_id_foreign
        FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT asignaturas_secciones_seccion_id_foreign
        FOREIGN KEY (seccion_id) REFERENCES secciones(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT asignaturas_secciones_docente_id_foreign
        FOREIGN KEY (docente_id) REFERENCES docentes(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
