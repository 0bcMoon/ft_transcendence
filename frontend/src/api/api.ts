import axios from 'axios'

const API_URL = 'http://localhost:3000/' // Replace with your API URL

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add request interceptor for authentication

api.interceptors.request.use(
    (config) => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            return config
        }
        const user = JSON.parse(storedUser);
        const token = user.token;
        if (!token) {
            throw new Error('No token found in localStorage')
        }
        config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (error) => Promise.reject(error)
)
export default api;
