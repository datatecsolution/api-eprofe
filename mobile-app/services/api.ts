import axios from "axios";
import config from "../config";

const api = axios.create({
    baseURL: config.apiUrl,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Token JWT en memoria — lo setea AuthContext en signIn y al restaurar la sesión.
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
    authToken = token;
}

// Adjunta el token JWT a cada request (los endpoints protegidos lo exigen).
api.interceptors.request.use(async (config) => {
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
