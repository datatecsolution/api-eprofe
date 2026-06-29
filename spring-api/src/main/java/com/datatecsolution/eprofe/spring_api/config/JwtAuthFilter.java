package com.datatecsolution.eprofe.spring_api.config;

import com.datatecsolution.eprofe.spring_api.repository.DocenteRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final DocenteRepository docenteRepository;

    public JwtAuthFilter(JwtTokenProvider jwtTokenProvider, DocenteRepository docenteRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.docenteRepository = docenteRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = extractToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            Long docenteId = jwtTokenProvider.getDocenteIdFromToken(token);

            docenteRepository.findById(docenteId).ifPresent(docente -> {
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(docente, null, Collections.emptyList());
                SecurityContextHolder.getContext().setAuthentication(auth);
            });
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
