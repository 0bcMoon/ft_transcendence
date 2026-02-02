import { login_api } from '@/api/api';
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import Loader from '@/vendor/loader';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/state/authStore';

interface AuthContextType {
    setAuth: (auth: boolean) => void;
    isAuthenticated: boolean;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {

    const [isAuthenticated, setAuth] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(false)
    }, []);


    const logout = () => {
        useAuthStore.getState().logout();
        login_api.get('/api/auth/logout')
        setAuth(false);
    };

    const { data, isLoading: isLoadingUser, isError, isSuccess } = useQuery({
        queryKey: ['user'],
        queryFn: async () => (await login_api.get('/api/user')).data,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        staleTime: 0,
    })

    useEffect(() => {
        if (!isError) return;
        setAuth(false);
        setLoading(false);
    }, [isError]);


    useEffect(() => {

        if (!isSuccess) return;
        useAuthStore.getState().login(data as any);
        setAuth(true);

    }, [isSuccess, data]);

    if (isLoadingUser) {
        return <Loader />
    }



    return (
        <AuthContext.Provider
            value={{
                setAuth,
                isAuthenticated,
                logout,
                isLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

