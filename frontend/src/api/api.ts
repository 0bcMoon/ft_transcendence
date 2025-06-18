import axios from 'axios'
import endpoints from '@/endpoints.json';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/' // Fallback to localhost if env var is not set

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

api.interceptors.request.use(
    (config) => {
        if (config.url === endpoints.auth.login) {
            return config;
        }
        const token = localStorage.getItem("access_token")
        if (!token) {
            console.log("No Token found in local storage");
            throw new Error("No user found in local storage");
        }
        config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (error) => Promise.reject(error))

export default api;
