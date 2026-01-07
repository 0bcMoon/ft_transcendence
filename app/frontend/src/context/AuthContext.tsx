import api, { deleteCookie } from '@/api/api';
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
        deleteCookie('access_token');
        api.get('/api/auth/logout')
        setAuth(false);
    };

    const { data, isLoading: isLoadingUser, isError, isSuccess } = useQuery({
        queryKey: ['user'],
        queryFn: async () => (await api.get('/api/user')).data,
        enabled: !isAuthenticated && !isLoading,
        refetchOnWindowFocus: false,
    })

    useEffect(() => {
        if (isError) {
            setAuth(false);
            setLoading(false);
            logout();
        }
    }, [isError]);


    useEffect(() => {
        if (isSuccess) {
            useAuthStore.getState().login(data as any);
            setAuth(true);
        }
    }, [data]);

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

