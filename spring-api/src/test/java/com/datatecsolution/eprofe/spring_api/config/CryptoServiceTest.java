package com.datatecsolution.eprofe.spring_api.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CryptoServiceTest {

    private CryptoService cryptoService;

    @BeforeEach
    void setUp() throws Exception {
        cryptoService = new CryptoService("eProfeTestSecretKeyForUnitTests2026!");
    }

    @Test
    void encrypt_returnsNonNullValue() {
        String encrypted = cryptoService.encrypt("myPassword123");
        assertNotNull(encrypted);
        assertFalse(encrypted.isBlank());
    }

    @Test
    void encrypt_returnsDifferentValueFromInput() {
        String plain = "myPassword123";
        String encrypted = cryptoService.encrypt(plain);
        assertNotEquals(plain, encrypted);
    }

    @Test
    void decrypt_returnsOriginalValue() {
        String plain = "myPassword123";
        String encrypted = cryptoService.encrypt(plain);
        String decrypted = cryptoService.decrypt(encrypted);
        assertEquals(plain, decrypted);
    }

    @Test
    void encrypt_nullReturnsNull() {
        assertNull(cryptoService.encrypt(null));
    }

    @Test
    void encrypt_blankReturnsBlank() {
        assertEquals("", cryptoService.encrypt(""));
    }

    @Test
    void decrypt_nullReturnsNull() {
        assertNull(cryptoService.decrypt(null));
    }

    @Test
    void decrypt_plainTextFallback() {
        // Legacy plain text values should be returned as-is
        String plainLegacy = "oldPlainPassword";
        String result = cryptoService.decrypt(plainLegacy);
        assertEquals(plainLegacy, result);
    }

    @Test
    void encrypt_sameInputProducesDifferentOutputs() {
        // Due to random IV, same input should produce different ciphertext
        String plain = "testPassword";
        String encrypted1 = cryptoService.encrypt(plain);
        String encrypted2 = cryptoService.encrypt(plain);
        assertNotEquals(encrypted1, encrypted2);
        // But both should decrypt to the same value
        assertEquals(plain, cryptoService.decrypt(encrypted1));
        assertEquals(plain, cryptoService.decrypt(encrypted2));
    }
}
