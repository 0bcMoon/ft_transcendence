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


/**
 * Deletes a cookie by its name.
 * @param {string} name The name of the cookie to delete.
 * @param {string} [path] The path of the cookie. Defaults to '/'.
 * @param {string} [domain] The domain of the cookie.
 */
export function deleteCookie(name: string): void {
    document.cookie = `${name}=; Max-Age=0; path=/;`;
}

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            deleteCookie("access_token");
        }
        return Promise.reject(error);
    }
);

// api.interceptors.request.use(
//     (config) => config,
//     (error) => Promise.reject(error))

export default api;
