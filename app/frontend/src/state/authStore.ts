import { CurrentUser } from '@/types/types';
import { create } from 'zustand';


interface AuthStoreState {
    user: CurrentUser | null;
    login: (userData: CurrentUser) => void;
    logout: () => void;
}


export const useAuthStore = create<AuthStoreState>((set) => ({
    user: null,

    login: (user: CurrentUser) => {
        set({ user: user });
    },

    logout: () => {
        set({ user: null });
    },
}));
