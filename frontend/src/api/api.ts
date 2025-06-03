import axios from 'axios'

const API_URL = 'http://localhost:3000/' // Replace with your API URL

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

api.interceptors.response.use(
    (response) => response,
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
        if (config.url === '/login') {
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
