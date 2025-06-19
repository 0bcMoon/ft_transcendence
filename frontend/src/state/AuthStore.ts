import { create } from 'zustand';

interface Auth {
    isAuthenticated: boolean;
    setAuth: (token: boolean) => void
    logout: () => void;
}


function deleteCookie(name: string, path: string = "/", domain: string) {
    let cookieString = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    cookieString += " path=" + (path || "/");
    if (domain) {
        cookieString += "; domain=" + domain;
    }
    document.cookie = cookieString;
}
const useAuthStore = create<Auth>((set) => ({
    isAuthenticated: document.cookie.includes("access_token"),
    setAuth: (value: boolean) => set({ isAuthenticated: value }),
    logout: () => {
        set({ isAuthenticated: false })
        deleteCookie("access_token", "/", import.meta.env.VITE_API_URL.replace(/https?:\/\//, ''));
    }
    ,
}));

export default useAuthStore
