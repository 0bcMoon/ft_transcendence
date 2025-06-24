// AuthContext.tsx
import api, { deleteCookie } from '@/api/api';
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
interface AuthContextType {
    setAuth: (auth: boolean) => void;
    isAuthenticated: boolean;
    logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setAuth] = useState<boolean >(false);

    useEffect(() => {
        const access_token = document.cookie.includes("access_token")
        setAuth(access_token)
    }, []);

    const logout = () => {
        deleteCookie('access_token');
        api.get('/auth/logout')
        setAuth(false);
    };

    return (
        <AuthContext.Provider
            value={{
                setAuth,
                isAuthenticated,
                logout
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

