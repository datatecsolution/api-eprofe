package com.datatecsolution.eprofe.spring_api.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(
                "eProfeTestSecretKeyForUnitTests2026!", 86400000L);
    }

    @Test
    void generateToken_returnsNonNullToken() {
        String token = jwtTokenProvider.generateToken(1L, "teacher1");
        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void getDocenteIdFromToken_returnsCorrectId() {
        String token = jwtTokenProvider.generateToken(42L, "teacher42");
        Long docenteId = jwtTokenProvider.getDocenteIdFromToken(token);
        assertEquals(42L, docenteId);
    }

    @Test
    void validateToken_returnsTrueForValidToken() {
        String token = jwtTokenProvider.generateToken(1L, "teacher1");
        assertTrue(jwtTokenProvider.validateToken(token));
    }

    @Test
    void validateToken_returnsFalseForInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.token.here"));
    }

    @Test
    void validateToken_returnsFalseForNull() {
        assertFalse(jwtTokenProvider.validateToken(null));
    }

    @Test
    void validateToken_returnsFalseForExpiredToken() {
        JwtTokenProvider shortLived = new JwtTokenProvider(
                "eProfeTestSecretKeyForUnitTests2026!", -1000L);
        String token = shortLived.generateToken(1L, "teacher1");
        assertFalse(jwtTokenProvider.validateToken(token));
    }

    @Test
    void generateToken_differentInputsProduceDifferentTokens() {
        String token1 = jwtTokenProvider.generateToken(1L, "teacher1");
        String token2 = jwtTokenProvider.generateToken(2L, "teacher2");
        assertNotEquals(token1, token2);
    }
}
