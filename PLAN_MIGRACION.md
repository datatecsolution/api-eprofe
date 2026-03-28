# Plan Formal de Migracion: Laravel → Spring Boot

**Proyecto:** eProfe - Sistema de Gestion Escolar
**Fecha:** 2026-03-27
**Estado:** Migracion en progreso (parcial)

---

## 1. Resumen Ejecutivo

El proyecto eProfe tiene actualmente **tres componentes**:

| Componente | Tecnologia | Estado |
|------------|-----------|--------|
| Backend Original | Laravel (PHP 7+) | Produccion activa, 18+ controladores |
| Backend Nuevo | Spring Boot 4.0.2 (Java 17) | MVP, 16 controladores |
| App Movil | React Native + Expo 54 | Apunta a Spring Boot |

La app movil **ya consume el backend Spring Boot**, lo que indica que la migracion esta en curso. Sin embargo, hay funcionalidad de Laravel que **no se ha portado** al nuevo backend.

---

## 2. Analisis Comparativo: Controlador por Controlador

### LEYENDA
- OK = Portado completamente
- PARCIAL = Portado con funcionalidad faltante
- FALTA = No existe en Spring Boot
- NUEVO = Solo existe en Spring Boot (funcionalidad nueva)

### 2.1 Controladores

| # | Laravel Controller | Spring Boot Controller | Estado | Detalle |
|---|-------------------|----------------------|--------|---------|
| 1 | AlumnoController (5 metodos: index, store, show, update, destroy) | AlumnoController (5 metodos) | OK | CRUD completo portado |
| 2 | DocenteController (2 metodos: index, store) | DocenteController (5 metodos) | OK+ | Spring Boot tiene mas metodos (update, delete, show) |
| 3 | AsignaturaController (7 metodos: CRUD + buscar_por_seccion + docente_asignaturas) | AsignaturaController (2 metodos: getAll, create) | **PARCIAL** | **Faltan: show, update, destroy, buscar_por_seccion, docente_asignaturas** |
| 4 | SeccionController (6 metodos: CRUD + docente_secciones + update_periodo) | SeccionController (3 metodos: getAll, getById, docente) | **PARCIAL** | **Faltan: store, update, destroy, update_periodo** |
| 5 | MatriculaController (1 metodo: buscar_por_year) | MatriculaController (2 metodos: buscar_seccion_year, getAll) | OK | Funcionalidad core portada |
| 6 | AcumulativoController (8 metodos: CRUD + docente + docente_seccion + seccion_parcial) | No existe controller dedicado | **FALTA** | **Todo el CRUD de acumulativos falta como controller. Solo se maneja via sync** |
| 7 | NotaAcumulativoController (7 metodos: CRUD + actualizar + buscar_asignatura) | NotaAcumulativoController (2 metodos: getAll, actualizar_notas) | **PARCIAL** | **Faltan: store, show, update, destroy, buscar_asignatura** |
| 8 | AsistenciaController (6 metodos: CRUD + docente) | AsistenciaController (1 metodo: getAll) | **PARCIAL** | **Faltan: store, show, update, destroy, docente** |
| 9 | AsistenciaDetalleController (3 metodos: index, store, update) | No existe | **FALTA** | **No portado** |
| 10 | CentroController (5 metodos: CRUD) | CentroController (2 metodos: getAll, getById) | **PARCIAL** | **Faltan: store, update, destroy** |
| 11 | PeriodoController (1 metodo: index con filtro estado='1') | PeriodoController (5 metodos: CRUD completo) | OK+ | Spring Boot tiene mas funcionalidad |
| 12 | ModalidadesController (5 metodos: CRUD) | No existe | **FALTA** | **No portado** |
| 13 | TipoAcumulativoController (2 metodos: index, show) | TipoAcumulativoController (1 metodo: getAll) | PARCIAL | Falta show (aunque en Laravel tiene logica rara con hardcoded Excel) |
| 14 | SaceController (metodos internos de scraping) | SaceScraperService (servicio) | OK | Portado como servicio en vez de controller |
| 15 | SaceUserController (1 metodo: sicronizar) | SaceSyncController (1 metodo: sicronizar) | OK | Portado |
| 16 | ImagesController (1 metodo: index) | No existe | **FALTA** | No portado (podria ser deprecado) |
| 17 | - | AuthController (login) | **NUEVO** | Login basico nuevo en Spring Boot |
| 18 | - | SaceController (login con cookies) | **NUEVO** | Login SACE nuevo para app movil |
| 19 | - | AppSyncController (initial sync) | **NUEVO** | Sync inicial para app movil |
| 20 | - | PushSyncController (push sync) | **NUEVO** | Push de datos offline |
| 21 | - | ExcelImportController (upload) | **NUEVO** | Importacion de Excel via API |

---

### 2.2 Modelos / Entidades

| # | Laravel Model | Spring Boot Entity | Estado | Diferencias |
|---|--------------|-------------------|--------|-------------|
| 1 | Alumno | Alumno | OK | Mismo esquema. Laravel hashea password, Spring Boot no |
| 2 | Docente | Docente | OK | Laravel encripta password_sace con Crypt, Spring Boot guarda plain text |
| 3 | Asignatura | Asignatura | OK | Identicos |
| 4 | Seccion | Seccion | OK | Identicos |
| 5 | Centro | Centro | OK | Identicos |
| 6 | Matricula | Matricula | OK | Identicos |
| 7 | Modalidad | Modalidad | OK | Identicos |
| 8 | Periodo | Periodo | OK | Laravel: estado es string '1', Spring Boot: Boolean |
| 9 | Acumulativo | Acumulativo | OK | Identicos |
| 10 | Notaacumulativo | NotaAcumulativo | OK | Identicos |
| 11 | Encabezadoasistencia | EncabezadoAsistencia | OK | Identicos |
| 12 | Detallesasistencia | DetalleAsistencia | OK | Identicos |
| 13 | Tipoacumulativo | TipoAcumulativo | OK | Identicos |
| 14 | AsignaturaSeccion (pivot implicito) | AsignaturaSeccion (entidad explicita) | OK+ | Spring Boot lo maneja como entidad JPA con ID propio |
| 15 | User (Laravel auth) | No existe | N/A | No necesario si no hay panel web |
| 16 | Image | No existe | **FALTA** | No portado |

---

### 2.3 Rutas API

| Laravel Route (api/v1/) | Spring Boot Route (/api/) | Estado |
|--------------------------|--------------------------|--------|
| GET asignaturas | GET /asignaturas | OK |
| POST asignaturas | POST /asignaturas | OK |
| GET asignaturas/{id} | - | **FALTA** |
| PUT asignaturas/{id} | - | **FALTA** |
| DELETE asignaturas/{id} | - | **FALTA** |
| GET asignaturas/buscar_asignaturas_seccion | - | **FALTA** |
| GET asignaturas/docente | - | **FALTA** |
| GET alumnos | GET /alumnos | OK |
| POST alumnos | POST /alumnos | OK |
| GET alumnos/{id} | GET /alumnos/{id} | OK |
| PUT alumnos/{id} | PUT /alumnos/{id} | OK |
| DELETE alumnos/{id} | DELETE /alumnos/{id} | OK |
| GET docentes | GET /docentes | OK |
| POST docentes | POST /docentes | OK |
| GET docentes/{id} | GET /docentes/{id} | OK |
| PUT docentes/{id} | PUT /docentes/{id} | OK |
| DELETE docentes/{id} | DELETE /docentes/{id} | OK |
| GET secciones | GET /secciones | OK |
| POST secciones | - | **FALTA** |
| GET secciones/{id} | GET /secciones/{id} | OK |
| PUT secciones/{id} | - | **FALTA** |
| DELETE secciones/{id} | - | **FALTA** |
| GET secciones/docente | GET /secciones/docente | OK |
| PUT secciones/update_periodo | - | **FALTA** |
| GET matriculas | GET /matriculas | OK |
| GET matriculas/buscar_seccion_year | GET /matriculas/buscar_seccion_year | OK |
| GET asistencias | GET /asistencias | OK |
| POST asistencias | - | **FALTA** |
| GET asistencias/{id} | - | **FALTA** |
| PUT asistencias/{id} | - | **FALTA** |
| DELETE asistencias/{id} | - | **FALTA** |
| GET asistencias/docente | - | **FALTA** |
| GET detallesasistencia | - | **FALTA** |
| POST detallesasistencia | - | **FALTA** |
| PUT detallesasistencia/{id} | - | **FALTA** |
| GET acumulativos | - | **FALTA** |
| POST acumulativos | - | **FALTA** |
| GET acumulativos/{id} | - | **FALTA** |
| PUT acumulativos/{id} | - | **FALTA** |
| DELETE acumulativos/{id} | - | **FALTA** |
| GET acumulativos/docente | - | **FALTA** |
| GET acumulativos/docente_seccion | - | **FALTA** |
| GET acumulativos/seccion_parcial | - | **FALTA** |
| GET notaacumulativos | GET /notaacumulativos | OK |
| POST notaacumulativos | - | **FALTA** |
| GET notaacumulativos/{id} | - | **FALTA** |
| PUT notaacumulativos/{id} | - | **FALTA** |
| DELETE notaacumulativos/{id} | - | **FALTA** |
| PUT notaacumulativos/actualizar_notas | POST /notaacumulativos/actualizar_notas | OK (cambio de verbo) |
| GET notaacumulativos/buscar_asignatura | - | **FALTA** |
| GET centros | GET /centros | OK |
| POST centros | - | **FALTA** |
| GET centros/{id} | GET /centros/{id} | OK |
| PUT centros/{id} | - | **FALTA** |
| DELETE centros/{id} | - | **FALTA** |
| GET periodos | GET /periodos | OK |
| POST periodos | POST /periodos | OK |
| GET periodos/{id} | GET /periodos/{id} | OK |
| PUT periodos/{id} | PUT /periodos/{id} | OK |
| DELETE periodos/{id} | DELETE /periodos/{id} | OK |
| GET modalidades | - | **FALTA** |
| POST modalidades | - | **FALTA** |
| GET modalidades/{id} | - | **FALTA** |
| PUT modalidades/{id} | - | **FALTA** |
| DELETE modalidades/{id} | - | **FALTA** |
| GET tipoacumlativos | GET /tipoacumlativos | OK |
| GET usersace/sicronizar | POST /usersace/sicronizar | OK (cambio de verbo) |
| GET images | - | **FALTA** |
| - | POST /auth/login | NUEVO |
| - | POST /sace/login | NUEVO |
| - | GET /sync/initial/{docenteId} | NUEVO |
| - | POST /sync/push | NUEVO |
| - | POST /excel/upload | NUEVO |

---

## 3. Funcionalidad Faltante en Spring Boot (Priorizada)

### PRIORIDAD CRITICA (requerida por la app movil)

Estas son funcionalidades que la app movil **ya usa o necesitara**:

| # | Funcionalidad | Detalle | Esfuerzo |
|---|--------------|---------|----------|
| 1 | **AcumulativoController completo** | CRUD + consultas por docente/seccion/parcial. La app crea acumulativos localmente y necesita el CRUD para admin | Alto |
| 2 | **AsistenciaController completo** | CRUD + consulta por docente. La app registra asistencia y necesita historial/edicion desde servidor | Alto |
| 3 | **Migraciones de BD (Flyway/Liquibase)** | Spring Boot usa ddl-auto=update. No apto para produccion. Se necesitan migraciones formales | Alto |
| 4 | **Autenticacion JWT** | Actualmente todo es permitAll(). Se necesita auth real con tokens | Alto |

### PRIORIDAD ALTA (funcionalidad completa del sistema)

| # | Funcionalidad | Detalle | Esfuerzo |
|---|--------------|---------|----------|
| 5 | **AsignaturaController: buscar_por_seccion** | Usado para filtrar asignaturas de una seccion especifica | Bajo |
| 6 | **AsignaturaController: docente_asignaturas** | Query compleja con JOINs para obtener asignaturas del docente en seccion activa | Medio |
| 7 | **SeccionController: CRUD completo** | store, update, destroy para administracion de secciones | Bajo |
| 8 | **SeccionController: update_periodo** | Batch update de periodo para multiples secciones | Bajo |
| 9 | **NotaAcumulativoController: buscar_asignatura** | Consulta notas por alumno/asignatura/parcial/seccion | Medio |
| 10 | **AsistenciaDetalleController** | CRUD independiente de detalles de asistencia | Bajo |
| 11 | **CentroController: CRUD completo** | store, update, destroy para administracion | Bajo |

### PRIORIDAD MEDIA (completar paridad)

| # | Funcionalidad | Detalle | Esfuerzo |
|---|--------------|---------|----------|
| 12 | **ModalidadesController** | CRUD completo de modalidades educativas | Bajo |
| 13 | **NotaAcumulativoController: CRUD** | store, show, update, destroy individuales | Bajo |
| 14 | **Encriptacion de passwords** | Laravel usa Crypt::encryptString() para passwordSace. Spring Boot guarda plain text | Medio |
| 15 | **Filtro de periodos activos** | Laravel filtra periodos por estado='1'. Spring Boot retorna todos | Bajo |
| 16 | **Validacion de requests** | Laravel tiene validacion en varios controllers. Spring Boot tiene validacion minima | Medio |

### PRIORIDAD BAJA (puede deprecarse)

| # | Funcionalidad | Detalle | Esfuerzo |
|---|--------------|---------|----------|
| 17 | ImagesController | Solo tiene index(). Posiblemente deprecado | Bajo |
| 18 | TipoAcumulativoController: show | En Laravel tiene logica hardcodeada de Excel. Probablemente obsoleto | N/A |

---

## 4. Diferencias Criticas de Implementacion

### 4.1 Seguridad

| Aspecto | Laravel | Spring Boot | Accion Requerida |
|---------|---------|-------------|-----------------|
| Auth middleware | auth:api en rutas | permitAll() en todo | Implementar JWT |
| Password docente | Crypt::encryptString() | Plain text | Encriptar o usar mecanismo seguro |
| Password alumno | Hash::make() | Sin hash | Implementar hashing |
| CORS | Middleware personalizado | Permite todo origen (*) | Restringir en produccion |
| CSRF | Habilitado por defecto | Deshabilitado | Evaluar si necesario para API |
| SSL SACE | cURL con verificacion | Deshabilitado (acepta todo cert) | Configurar trust store |
| Credenciales BD | En .env (no en repo) | Hardcoded en application.properties | Mover a variables de entorno |

### 4.2 Manejo de Datos

| Aspecto | Laravel | Spring Boot | Accion Requerida |
|---------|---------|-------------|-----------------|
| Migraciones BD | 20+ archivos de migracion | Hibernate ddl-auto=update | Crear migraciones Flyway |
| Eager loading | Usa with() para cargar relaciones | Usa LAZY + @JsonIgnore | Verificar que no cause N+1 |
| Respuesta JSON | Formato: {success, msg, data} | Varía por controller | Estandarizar formato |
| Paginacion | No implementada | No implementada | Implementar en ambos |
| Prefix de ruta | /api/v1/ | /api/ | Decidir versionado |

### 4.3 Procesamiento Excel (ManagerXlsFile vs ExcelImportService)

| Aspecto | Laravel (ManagerXlsFile) | Spring Boot (ExcelImportService) | Estado |
|---------|------------------------|--------------------------------|--------|
| Lectura de centro (A1) | Extrae codigo y nombre | Extrae codigo y nombre | OK |
| Lectura de modalidad (A2) | Extrae nombre | Extrae nombre | OK |
| Lectura de grado/seccion (A3) | Extrae curso, seccion | Extrae curso, seccion | OK |
| Lectura de jornada (A4) | Extrae jornada | Extrae jornada | OK |
| Lectura de asignatura (A5) | Extrae nombre | Extrae nombre | OK |
| Parsing de alumnos (B8+/C8+) | Custom name parser | NameParserUtils | OK |
| Creacion de matricula | Con year actual | Con year actual | OK |
| Eliminacion de archivos | delete_file() | No aplica (base64) | OK (diferente mecanismo) |
| Alias de asignatura | Usa nombre completo | Primeras 3 letras uppercase | **DIFERENCIA** |

### 4.4 Flujo SACE (SaceController vs SaceScraperService)

| Aspecto | Laravel | Spring Boot | Estado |
|---------|---------|-------------|--------|
| Login SACE | cURL directo | Jsoup connect | OK (diferente impl) |
| CSRF extraction | Regex en HTML | Jsoup DOM parsing | OK |
| Descarga Excel | cURL POST | Jsoup POST | OK |
| Cookies | Archivo en disco | Map en memoria | OK |
| Role selection | Seleccion de DOCENTE | Seleccion de DOCENTE | OK |
| Logout | Implementado | Implementado | OK |

---

## 5. Requerimientos de la App Movil vs Backend

La app movil (React Native) hace las siguientes llamadas API. Verificacion de soporte:

| Endpoint | Metodo | Usado en | Spring Boot | Estado |
|----------|--------|----------|-------------|--------|
| /sace/login | POST | AuthContext, LoginScreen | SaceController | OK |
| /usersace/sicronizar | POST | useInitialSync | SaceSyncController | OK |
| /sync/initial/{id} | GET | useInitialSync | AppSyncController | OK |
| /sync/push | POST | useInitialSync | PushSyncController | OK |

**Conclusion:** Los 4 endpoints que la app movil consume **ya estan implementados** en Spring Boot. La funcionalidad faltante es para administracion backend / panel web futuro.

---

## 6. Plan de Ejecucion por Fases

### FASE 1: Infraestructura y Seguridad (Semana 1-2)

- [ ] **1.1** Crear migraciones Flyway basadas en las 20 migraciones de Laravel
  - Generar V1__initial_schema.sql con todas las tablas
  - Cambiar ddl-auto de `update` a `validate`
  - Probar con BD limpia y con BD existente
- [ ] **1.2** Mover credenciales a variables de entorno
  - Crear application-dev.properties y application-prod.properties
  - Usar ${DB_URL}, ${DB_USER}, ${DB_PASSWORD}
  - Actualizar docker-compose.yml
- [ ] **1.3** Implementar autenticacion JWT
  - Agregar dependencia spring-boot-starter-oauth2-resource-server o jjwt
  - Crear JwtTokenProvider, JwtAuthFilter
  - Proteger endpoints /api/** excepto /api/auth/login y /api/sace/login
  - Actualizar SecurityConfig
- [ ] **1.4** Implementar hashing de passwords
  - Alumno: BCrypt para password
  - Docente: password con BCrypt, passwordSace con encriptacion reversible (AES) porque se necesita para login SACE

### FASE 2: Controladores Criticos (Semana 3-4)

- [ ] **2.1** Crear AcumulativoController completo
  - GET / (listar con relaciones)
  - POST / (crear con notas asociadas)
  - GET /{id} (mostrar con relaciones)
  - PUT /{id} (actualizar con notas)
  - DELETE /{id} (eliminar)
  - GET /docente?docente_id= (filtrar por docente)
  - GET /docente_seccion?docente_id=&seccion_id= (filtrar por docente y seccion)
  - GET /seccion_parcial?docente_id=&seccion_id=&parcial=&asignatura_id= (filtrar completo)
- [ ] **2.2** Completar AsistenciaController
  - POST / (crear con detalles)
  - GET /{id} (mostrar con detalles)
  - PUT /{id} (actualizar fecha y detalles)
  - DELETE /{id} (eliminar)
  - GET /docente?docente_id=&seccion_id= (filtrar por docente/seccion)
- [ ] **2.3** Crear AsistenciaDetalleController
  - GET / (listar con relaciones)
  - POST / (crear)
  - PUT /{id} (actualizar)

### FASE 3: Controladores Complementarios (Semana 5-6)

- [ ] **3.1** Completar AsignaturaController
  - GET /{id}, PUT /{id}, DELETE /{id}
  - GET /buscar_asignaturas_seccion?seccion_id=
  - GET /docente?docente_id=&seccion_id= (con JOIN a periodos activos)
- [ ] **3.2** Completar SeccionController
  - POST /, PUT /{id}, DELETE /{id}
  - PUT /update_periodo (batch update)
- [ ] **3.3** Completar CentroController
  - POST /, PUT /{id}, DELETE /{id}
- [ ] **3.4** Completar NotaAcumulativoController
  - POST /, GET /{id}, PUT /{id}, DELETE /{id}
  - PUT /actualizar_notas (batch - ya existe, verificar)
  - GET /buscar_asignatura?alumno_id=&asignatura_id=&parcial=&seccion_id=
- [ ] **3.5** Crear ModalidadesController
  - CRUD completo (index, store, show, update, destroy)

### FASE 4: Estandarizacion y Calidad (Semana 7-8)

- [ ] **4.1** Estandarizar formato de respuesta API
  - Crear ResponseDTO generico: {success, message, data, errors}
  - Crear GlobalExceptionHandler (@ControllerAdvice)
  - Aplicar en todos los controllers
- [ ] **4.2** Agregar validacion de requests
  - Crear DTOs de request con @Valid, @NotNull, @NotBlank
  - Portar reglas de validacion de Laravel
- [ ] **4.3** Implementar paginacion
  - Usar Pageable de Spring Data en endpoints de listado
- [ ] **4.4** Corregir versionado de API
  - Decidir: /api/v1/ o /api/
  - Actualizar app movil si cambia
- [ ] **4.5** Filtro de periodos activos
  - GET /periodos debe filtrar por estado=true por defecto
  - Agregar parametro ?all=true para obtener todos

### FASE 5: Testing y Documentacion (Semana 9-10)

- [ ] **5.1** Tests unitarios de servicios
  - ExcelImportService
  - SaceSyncService
  - SaceScraperService
- [ ] **5.2** Tests de integracion de controllers
  - Tests con MockMvc para cada endpoint
  - Tests de autenticacion JWT
- [ ] **5.3** Documentacion API
  - Agregar SpringDoc/OpenAPI (Swagger UI)
  - Documentar todos los endpoints
- [ ] **5.4** Configurar CI/CD
  - Pipeline de build + test
  - Deploy automatico a staging

### FASE 6: Apagado de Laravel (Semana 11-12)

- [ ] **6.1** Verificacion de paridad completa
  - Ejecutar cada endpoint de Laravel y comparar respuesta con Spring Boot
  - Verificar flujo completo de SACE sync
  - Verificar push/pull de app movil
- [ ] **6.2** Migracion de datos (si aplica)
  - Verificar que Spring Boot use la misma BD (minerva)
  - No deberia necesitar migracion de datos si comparten BD
- [ ] **6.3** Apagar Laravel
  - Redirigir trafico a Spring Boot
  - Mantener Laravel en standby 2 semanas
  - Descomisionar

---

## 7. Resumen de Metricas

### Estado Actual de la Migracion

| Metrica | Valor |
|---------|-------|
| Rutas Laravel totales | ~55 |
| Rutas portadas a Spring Boot | ~22 |
| Rutas faltantes | ~33 |
| **Porcentaje de paridad** | **~40%** |
| Rutas nuevas (solo Spring Boot) | 5 |
| Modelos portados | 14/16 (87%) |
| Servicios portados | 3/3 (100%) |
| Seguridad implementada | 0% |
| Tests escritos | 0% |
| Migraciones BD formales | 0% |

### Lo que YA funciona en Spring Boot
1. Login y autenticacion basica con SACE
2. Sincronizacion completa (pull initial + push offline data)
3. Procesamiento de archivos Excel de SACE
4. Web scraping de SACE
5. CRUD basico de alumnos, docentes, periodos
6. Consulta de secciones por docente

### Lo que FALTA para produccion
1. 33 rutas API sin portar
2. Sistema de migraciones de BD
3. Autenticacion JWT
4. Encriptacion de passwords
5. Validacion de requests
6. Manejo global de errores
7. Tests
8. Documentacion API
9. Configuracion de entorno (dev/staging/prod)

---

## 8. Riesgos y Mitigacion

| Riesgo | Impacto | Mitigacion |
|--------|---------|-----------|
| Spring Boot usa ddl-auto=update en produccion | Perdida de datos, esquema inconsistente | FASE 1: Migrar a Flyway inmediatamente |
| Sin autenticacion en API | Acceso no autorizado a datos de estudiantes | FASE 1: Implementar JWT |
| Credenciales hardcoded | Exposicion en repositorio | FASE 1: Variables de entorno |
| Passwords en plain text | Vulnerabilidad de seguridad | FASE 1: Implementar hashing |
| Dos backends apuntando a misma BD | Conflictos de escritura | Fase 6: Apagar Laravel lo antes posible |
| App movil sin auth token | Cualquiera puede hacer requests | FASE 1: JWT + actualizar app |
| Sin tests | Regresiones al agregar funcionalidad | FASE 5: Tests antes de apagar Laravel |

---

## 9. Dependencias entre Componentes

```
App Movil (React Native)
    |
    |-- POST /sace/login ---------> SaceController (Spring Boot) ------> OK
    |-- POST /usersace/sicronizar -> SaceSyncController ----------------> OK
    |-- GET /sync/initial/{id} ----> AppSyncController -----------------> OK
    |-- POST /sync/push ----------> PushSyncController -----------------> OK
    |
    |-- (Futuro: CRUD directo) ----> Controllers faltantes -------------> PENDIENTE
    |
    v
WatermelonDB (SQLite local)
    |-- Schema v3 con 13 tablas
    |-- Sync bidireccional (pull wipe + push upsert)
```

---

## 10. Flujo Completo de Excel: Descarga → Rellenado → Subida al SACE

### Descripcion del Flujo

Este flujo es critico para la operacion del sistema. El docente necesita:
1. **Descargar** los archivos Excel del SACE (listas de alumnos vacias)
2. **Importar** los datos del Excel a la BD local (centro, modalidad, seccion, asignatura, alumnos)
3. **Conservar** el archivo Excel original en el servidor, renombrado como `{seccion_id}_{asignatura_id}.xls`
4. **Rellenar** el Excel original con las notas ingresadas por el docente en la app
5. **Subir** el Excel rellenado de vuelta al SACE

### Estado por Backend

| Paso | Laravel | Spring Boot | Estado |
|------|---------|-------------|--------|
| Descargar Excel del SACE | `SaceController::get_descargar()` | `SaceScraperService::downloadExcelFiles()` | OK |
| Importar datos a BD | `ManagerXlsFile::setDBLocalFromXls()` | `ExcelImportService::processExcelFile()` | OK |
| Conservar archivo original | `Storage::move()` → `{seccion_id}_{asignatura_id}.xls` | **No implementado** | **FALTA** |
| Rellenar Excel con notas | `Writer\Xlsx` importado pero **no implementado** | **No implementado** | **FALTA** |
| Subir Excel al SACE | `get_from_subir()` / `get_subir()` — **vacios** | **No implementado** | **FALTA** |

### Implementacion en Spring Boot

#### 10.1 Persistir archivo Excel original

Modificar `ExcelImportService.processExcelFile()` para:
- Recibir los bytes originales del archivo (no solo un InputStream)
- Despues de procesar, guardar el archivo en: `storage/{year}/{user_sace}/{seccion_id}_{asignatura_id}.xls`
- Retornar un objeto con `seccionId` y `asignaturaId` para el caller

**Directorio de almacenamiento:** Configurable via `application.properties`:
```
eprofe.excel.storage-path=${EXCEL_STORAGE_PATH:./storage/excel}
```

#### 10.2 Servicio de rellenado de Excel (ExcelExportService)

Nuevo servicio que:
- Localiza el archivo original: `storage/{year}/{user_sace}/{seccion_id}_{asignatura_id}.xls`
- Lo abre con Apache POI (ya en pom.xml)
- Consulta las notas de `notaacumulativos` JOIN `acumulativos` para la seccion/asignatura/parcial
- Escribe las notas en las celdas correspondientes del Excel (columnas D+ a partir de fila 8)
- Genera el archivo rellenado como bytes

#### 10.3 Subida al SACE (SaceScraperService)

Extender con metodo `uploadExcelFile(byte[] fileContent, String cookies)`:
- Navegar a la pagina de subida del SACE
- Extraer CSRF token
- POST multipart con el archivo Excel rellenado
- Retornar resultado de la operacion

#### 10.4 Endpoint de orquestacion

`POST /api/sace/subir-notas`:
- Request: `{ docenteId, seccionId, asignaturaId, parcial }`
- Flujo: buscar archivo → rellenar con notas → subir al SACE
- Response: `{ success, message }`

---

## 11. Notas Adicionales

### Bugs encontrados en Laravel
1. **ModalidadesController.update()**: Crea una nueva modalidad en vez de actualizar (bug)
2. **NotaAcumulativoController.index()**: Tiene hardcoded el user_sace '01051986004177011'
3. **TipoAcumulativoController.show()**: Intenta cargar un archivo Excel hardcoded

### Mejoras en Spring Boot vs Laravel
1. **AsignaturaSeccion como entidad**: En Laravel es un pivot implicito, en Spring Boot es una entidad JPA con ID propio - mejor para consultas
2. **Name parsing**: Spring Boot tiene NameParserUtils mas robusto que el parser de Laravel
3. **Sync offline**: Los endpoints de sync (initial + push) son nuevos y bien disenados
4. **Docker ready**: Spring Boot tiene Dockerfile y docker-compose listos

### Diferencias de alias de asignatura
- Laravel: Usa el nombre completo como alias
- Spring Boot: Genera alias con primeras 3 letras en mayuscula
- **Accion**: Unificar criterio para evitar inconsistencias en BD
