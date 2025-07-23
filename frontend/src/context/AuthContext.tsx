// AuthContext.tsx
import api, { deleteCookie } from '@/api/api';
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import Loader from '@/vendor/loader';

interface AuthContextType {
    setAuth: (auth: boolean) => void;
    isAuthenticated: boolean;
    logout: () => void;
    isLoading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setAuth] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const access_token = document.cookie.includes("access_token") 
        setAuth(access_token)
        setLoading(false)
    }, []);

    const logout = () => {
        deleteCookie('access_token');
        api.get('/auth/logout')
        setAuth(false);
    };

    if (isLoading) {
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

