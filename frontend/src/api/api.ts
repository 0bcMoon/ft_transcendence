import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000' // Fallback to localhost if env var is not set

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

export const login_api = axios.create({
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
 */

export function deleteCookie(name: string): void {
    document.cookie = `${name}=; Max-Age=0; path=/;`;
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            deleteCookie("access_token");
            window.location.href = "/login"; // Redirect to login page
        }
        return Promise.reject(error);
    }
);

// api.interceptors.request.use(
//     (config) => config,
//     (error) => Promise.reject(error))

export default api;
