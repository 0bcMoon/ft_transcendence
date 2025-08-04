import { deleteCookie } from '@/api/api';
import { User } from '@/types/types';
import { create } from 'zustand';


interface AuthStoreState {
    user: User | null;
    isLoggedIn: boolean;
    login: (userData: User) => void;
    logout: () => void;
}

const initAuth = () => {
    const user = localStorage.getItem('user');
    if (user) {
        return JSON.parse(user);
    }
    return null;
};

export const useAuthStore = create<AuthStoreState>((set) => ({
    user: initAuth(),
    isLoggedIn: document.cookie.includes("access_token"),

    login: (userData: User) => {
        localStorage.setItem('user', JSON.stringify(userData));
        set({ user: userData, isLoggedIn: true });
    },

    logout: () => {
        // Clear from localStorage
        localStorage.removeItem('user');
        deleteCookie('access_token');
        // Update state
        set({ user: null,  isLoggedIn: false });
    },
}));
