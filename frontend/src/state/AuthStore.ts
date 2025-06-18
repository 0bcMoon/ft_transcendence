import { create } from 'zustand';

interface Auth {
    isAuthenticated: boolean;
    setAuth: (token: boolean) => void
    logout: () => void;
}

// /**
//  * Deletes a cookie by its name.
//  * @param {string} name The name of the cookie to delete.
//  * @param {string} [path] The path of the cookie. Defaults to '/'.
//  * @param {string} [domain] The domain of the cookie.
//  */

// function deleteCookie(name, path= "/", domain) {
//     let cookieString = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
//
//     // Append path if provided, otherwise default to '/'
//     cookieString += " path=" + (path || "/");
//
//     // Append domain if provided
//     if (domain) {
//         cookieString += "; domain=" + domain;
//     }
//
//     document.cookie = cookieString;
// }

const useAuthStore = create<Auth>((set) => ({
    isAuthenticated: document.cookie.includes("access_token"),
    setAuth: (value : boolean) => set({ isAuthenticated: value }),
    logout: () => set({ isAuthenticated: false }),
}));

export default useAuthStore
