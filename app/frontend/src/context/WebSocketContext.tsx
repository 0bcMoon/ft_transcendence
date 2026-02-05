import { createContext, useEffect, ReactNode, useState, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { WebSocketContextType, IEvent } from '@/notifications/types';
import { handleWebSocketEvent } from '@/notifications/utils/handlers';

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { isAuthenticated, isLoading } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (isLoading || !isAuthenticated) 
            return;
        if (socket?.readyState === WebSocket.OPEN) 
            return;

        const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/notify`);

        ws.onopen = () => {
            console.log('[WebSocket] Connected');
        };

        ws.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data) as IEvent;
                handleWebSocketEvent(data, queryClient);
            } catch (error) {
                console.error('[WebSocket] Parse error:', error);
            }
        };

        ws.onclose = () => {
            console.log('[WebSocket] Disconnected');
        };

        ws.onerror = (error) => {
            console.error('[WebSocket] Error:', error);
        };

        setSocket(ws);

        return () => {
            ws?.close();
            setSocket(null);
        };
    }, [isLoading, isAuthenticated, queryClient]);

    return (
        <WebSocketContext.Provider value={{ socket, setSocket }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};

export default WebSocketContext;
