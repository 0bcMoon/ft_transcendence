// AuthContext.tsx
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';

// Define user type

// Define context type
interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
    isAuthenticated: boolean;
    logout: () => void;
}

// Create the context
export const AuthContext = createContext<AuthContextType | null>(null);

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const access_token = localStorage.getItem('access_token');
        setToken(access_token || null);
    }, []);



    // Update localStorage when user changes
    useEffect(() => {
        if (token){
            localStorage.setItem('access_token', token);
        }
        else {
            const access_token = localStorage.getItem('access_token');
            setToken(access_token || null);
        }
    }, [token]);

    const logout = () => {
        setToken(null);
        localStorage.removeItem('access_token');
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                setToken,
                isAuthenticated: !!token,
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

