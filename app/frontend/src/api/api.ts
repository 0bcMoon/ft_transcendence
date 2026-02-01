import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

export const login_api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

export function deleteCookie(name: string): void {
    document.cookie = `${name}=; Max-Age=0; path=/;`;
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            deleteCookie("access_token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    },
);

export default api;
