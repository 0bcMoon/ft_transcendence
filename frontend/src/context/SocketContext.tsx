
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';


interface WebSocketContextType {
    webSocket: WebSocket | null;
    setWebSocket: (ws: WebSocket) => void;
    setIsConnected: (state: boolean) => void;
    isConnected: boolean;
}

// Create the context
const SocketContext = createContext<WebSocketContextType | null>(null);

// Create a provider component
export function SocketProvider({ children }: { children: ReactNode }) {
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    // Initialize WebSocket connection
    useEffect(() => {
    const timeid = setTimeout(() => {
            if (webSocket) {
                console.log('🔌 WebSocket already connected');
                return;
            }
            const ws = new WebSocket('ws://localhost:3000/ws');
            setWebSocket(ws);

            ws.onopen = () => {
                console.log('✅ Connected to WebSocket');
                toast.success('Connected to WebSocket');
                setIsConnected(true);
            };

            ws.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                toast.error('WebSocket disconnected');
                setWebSocket(null);
                setIsConnected(false);
            };

            ws.onerror = (error) => {
                toast.error('WebSocket error: ' + error);
            };
        }, 500);

        // Cleanup on unmount
        return () => {
            clearTimeout(timeid);
            if (webSocket) {
                webSocket.close();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={
            {
                webSocket,
                isConnected,
                setWebSocket,
                setIsConnected
            }
        }>
            {children}
        </SocketContext.Provider>
    );
}


export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within an SocketProvider');
    }
    return context;
}

