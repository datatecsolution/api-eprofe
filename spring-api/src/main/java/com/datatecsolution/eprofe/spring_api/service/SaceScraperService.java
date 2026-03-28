package com.datatecsolution.eprofe.spring_api.service;

import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import jakarta.annotation.PostConstruct;

@Service
public class SaceScraperService {

    static {
        System.setProperty("jsse.enableSNIExtension", "false");
    }

    private Connection connect(String url) {
        return Jsoup.connect(url)
                .userAgent(
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .header("Accept",
                        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
                .header("Accept-Language", "es-ES,es;q=0.9,en;q=0.8")
                .header("Connection", "keep-alive")
                .header("Sec-Ch-Ua", "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"")
                .header("Sec-Ch-Ua-Mobile", "?0")
                .header("Sec-Ch-Ua-Platform", "\"macOS\"")
                .header("Sec-Fetch-Dest", "document")
                .header("Sec-Fetch-Mode", "navigate")
                .header("Sec-Fetch-Site", "none")
                .header("Sec-Fetch-User", "?1")
                .header("Upgrade-Insecure-Requests", "1")
                .sslSocketFactory(socketFactory())
                .timeout(30000);
    }

    private javax.net.ssl.SSLSocketFactory socketFactory() {
        javax.net.ssl.TrustManager[] trustAllCerts = new javax.net.ssl.TrustManager[] {
                new javax.net.ssl.X509TrustManager() {
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                        return null;
                    }

                    public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) {
                    }

                    public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) {
                    }
                }
        };

        try {
            javax.net.ssl.SSLContext sslContext = javax.net.ssl.SSLContext.getInstance("TLS");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
            return sslContext.getSocketFactory();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create a SSL socket factory", e);
        }
    }

    private static final String LOGIN_URL = "https://sace.se.gob.hn/cuentas/login";
    private static final String AUTORIZAR_URL = "https://sace.se.gob.hn/cuentas/usuario/autorizar/acceso";
    private static final String DESCARGAR_URL = "https://sace.se.gob.hn/notas/descargar";
    private static final String SUBIR_URL = "https://sace.se.gob.hn/notas/subir";
    private static final String LOGOUT_URL = "https://sace.se.gob.hn/cuentas/logout/";

    private Map<String, String> cookies = new HashMap<>();
    private String csrfToken = "";

    public void setCookies(Map<String, String> newCookies) {
        this.cookies = newCookies;
    }

    public void setCookies(String cookieString) {
        this.cookies = new HashMap<>();
        if (cookieString == null || cookieString.isEmpty())
            return;

        String[] pairs = cookieString.split(";");
        for (String pair : pairs) {
            String[] keyValue = pair.trim().split("=", 2);
            if (keyValue.length == 2) {
                this.cookies.put(keyValue[0], keyValue[1]);
                if ("csrftoken".equals(keyValue[0])) {
                    this.csrfToken = keyValue[1];
                }
            }
        }
    }

    public boolean login(String username, String password) throws IOException {
        // 1. Visit Login Page to get Tokens
        Connection.Response loginPage = connect(LOGIN_URL)
                .method(Connection.Method.GET)
                .execute();

        this.cookies = loginPage.cookies();
        Document loginDoc = loginPage.parse();
        org.jsoup.select.Elements tokenInputs = loginDoc.select("input[name=csrfmiddlewaretoken]");
        this.csrfToken = tokenInputs.isEmpty() ? "" : tokenInputs.first().val();

        // 2. Submit Credentials
        Connection.Response authResponse = connect(LOGIN_URL)
                .data("csrfmiddlewaretoken", this.csrfToken)
                .data("usuario", username)
                .data("clave", password)
                .cookies(this.cookies)
                .method(Connection.Method.POST)
                .execute();

        this.cookies.putAll(authResponse.cookies());
        Document authDoc = authResponse.parse();

        // 3. Handle Potential Profile Selection (DOCENTE)
        org.jsoup.select.Elements profileForms = authDoc.select("form[action*=/cuentas/usuario/autorizar/acceso]");
        if (!profileForms.isEmpty()) {
            Element targetForm = null;
            for (Element form : profileForms) {
                Element tr = form.closest("tr");
                if (tr != null && tr.text().toUpperCase().contains("DOCENTE")) {
                    targetForm = form;
                    break;
                }
            }
            if (targetForm == null)
                targetForm = profileForms.first(); // fallback

            // Extract form inputs
            String formCsrf = targetForm.select("input[name=csrfmiddlewaretoken]").val();
            String formUsuario = targetForm.select("input[name=usuario]").val();

            Connection.Response profileResponse = connect(AUTORIZAR_URL)
                    .data("csrfmiddlewaretoken", formCsrf)
                    .data("usuario", formUsuario)
                    .cookies(this.cookies)
                    .method(Connection.Method.POST)
                    .execute();

            this.cookies.putAll(profileResponse.cookies());
            return true;
        }

        // If no profile form, assume direct login (or check for errors like
        // "Credenciales incorrectas")
        if (authDoc.text().contains("incorrect")) {
            return false;
        }
        return true;
    }

    public Map<String, byte[]> downloadExcelFiles() throws IOException {
        Map<String, byte[]> files = new HashMap<>();

        // 1. GET Download Page
        Connection.Response downloadPage = connect(DESCARGAR_URL)
                .cookies(this.cookies)
                .method(Connection.Method.GET)
                .execute();

        this.cookies.putAll(downloadPage.cookies());
        Document doc = downloadPage.parse();

        // 2. Extract Download Buttons/IDs
        org.jsoup.select.Elements buttons = doc.select("button.descargar[data-cs]");

        // Find CSRF token anywhere on the page
        org.jsoup.select.Elements tokenInputs = doc.select("input[name=csrfmiddlewaretoken]");
        String downloadToken = tokenInputs.isEmpty() ? this.csrfToken : tokenInputs.first().val();

        if (buttons.isEmpty()) {
            System.out.println("No download buttons found. HTML: "
                    + doc.body().text().substring(0, Math.min(200, doc.body().text().length())));
            return files;
        }

        // 3. Loop and Download
        int index = 0;
        for (Element button : buttons) {
            String csId = button.attr("data-cs");

            try {
                Connection.Response fileResponse = connect(DESCARGAR_URL)
                        .data("cs", csId)
                        .data("csrfmiddlewaretoken", downloadToken)
                        .cookies(this.cookies)
                        .method(Connection.Method.POST)
                        .ignoreContentType(true) // Crucial for Excel files
                        .maxBodySize(0) // Unlimited size
                        .execute();

                if (fileResponse.statusCode() == 200) {
                    files.put("descarga_" + index + "_" + csId + ".xls", fileResponse.bodyAsBytes());
                }
            } catch (Exception e) {
                System.err.println("Failed to download file " + csId + ": " + e.getMessage());
            }
            index++;
        }

        logout(); // Good practice to logout after download loop
        return files;
    }

    /**
     * Sube un archivo Excel rellenado con notas al SACE.
     * Flujo: GET pagina de subida → extraer CSRF → POST multipart con el archivo.
     *
     * @param fileBytes bytes del archivo Excel rellenado
     * @param fileName  nombre del archivo (ej: "notas_seccion1_asignatura2.xls")
     * @return true si la subida fue exitosa
     */
    public boolean uploadExcelFile(byte[] fileBytes, String fileName) throws IOException {
        // 1. GET pagina de subida para obtener CSRF token
        Connection.Response subirPage = connect(SUBIR_URL)
                .cookies(this.cookies)
                .method(Connection.Method.GET)
                .execute();

        this.cookies.putAll(subirPage.cookies());
        Document doc = subirPage.parse();

        // Extraer CSRF token
        org.jsoup.select.Elements tokenInputs = doc.select("input[name=csrfmiddlewaretoken]");
        String uploadToken = tokenInputs.isEmpty() ? this.csrfToken : tokenInputs.first().val();

        // 2. POST el archivo Excel
        Connection.Response uploadResponse = connect(SUBIR_URL)
                .data("csrfmiddlewaretoken", uploadToken)
                .data("archivo", fileName, new java.io.ByteArrayInputStream(fileBytes))
                .cookies(this.cookies)
                .method(Connection.Method.POST)
                .ignoreContentType(true)
                .execute();

        this.cookies.putAll(uploadResponse.cookies());

        return uploadResponse.statusCode() == 200;
    }

    public void logout() {
        try {
            Jsoup.connect(LOGOUT_URL).cookies(this.cookies).execute();
        } catch (IOException e) {
            // Ignore logout errors
        }
    }
}
