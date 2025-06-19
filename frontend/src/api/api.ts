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
function deleteCookie(name: string, path: string = "/", domain: string) {
    let cookieString = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    // Append path if provided, otherwise default to '/'
    cookieString += " path=" + (path || "/");

    // Append domain if provided
    if (domain) {
        cookieString += "; domain=" + domain;
    }

    document.cookie = cookieString;
}

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            deleteCookie("access_token", "/", API_URL.replace(/https?:\/\//, ''));
        }
        return Promise.reject(error);
    }
);

// api.interceptors.request.use(
//     (config) => config,
//     (error) => Promise.reject(error))

export default api;
