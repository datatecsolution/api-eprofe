import axios from "axios";
import config from "../config";

const api = axios.create({
    baseURL: config.apiUrl,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add interceptors if needed (e.g. auth token)
api.interceptors.request.use(async (config) => {
    // TODO: Add auth token from SecureStore/AsyncStorage
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
