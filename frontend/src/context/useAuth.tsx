import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// Create a custom hook to use the auth context

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

