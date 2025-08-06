import { User } from '@/types/types';
import { create } from 'zustand';


interface AuthStoreState {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
}


export const useAuthStore = create<AuthStoreState>((set) => ({
    user: null,

    login: (user: User) => {
        set({ user: user });
    },

    logout: () => {
        set({ user: null });
    },
}));
