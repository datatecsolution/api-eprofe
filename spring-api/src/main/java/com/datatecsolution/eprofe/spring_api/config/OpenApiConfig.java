package com.datatecsolution.eprofe.spring_api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI eProfeOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("eProfe API")
                        .description("API del Sistema de Gestion Escolar eProfe. " +
                                "Gestiona docentes, alumnos, secciones, asignaturas, acumulativos, " +
                                "asistencias, notas y sincronizacion con el SACE de Honduras.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("DataTec Solution")
                                .email("info@datatecsolution.com")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer JWT"))
                .components(new Components()
                        .addSecuritySchemes("Bearer JWT", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Ingrese el token JWT obtenido del endpoint /api/auth/login o /api/sace/login")));
    }
}
