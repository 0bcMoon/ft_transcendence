import { createContext, useEffect, ReactNode, useContext, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

interface WebSocketContextType {
    socket: WebSocket | null;
    setSocket: (socket: WebSocket | null) => void;
    isConnected: boolean;
}

function WebSocketEventHandler(event: MessageEvent) {

    const data = JSON.parse(event.data);
    console.log('WebSocket message received:', data);
    // Handle different types of messages
    switch (data.type) {
        case 'notification':
            toast.success(`Notification: ${data.message}`);
            break;
        case 'ping':
            console.log('Ping received from server');
            break;
        default:
            console.warn('Unknown message type:', data.type);
    }
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);
export function WebSocketProvider({ children }: { children: ReactNode }) {
    const ws = useRef<WebSocket | null>(null)
    const { isAuthenticated, isLoading } = useAuth();

    /* called from a component that registers a callback for a channel */

    useEffect(() => {
        if (isLoading) return; // wait until auth is resolved
        if (ws.current && ws.current?.readyState === WebSocket.OPEN) return; // already initialized
        /* WS initialization and cleanup */
        ws.current = new WebSocket('ws://localhost:3000/ws/notify');

        ws.current.onopen = () => {
            toast.success('WebSocket connected')
        }
        ws.current.onmessage = WebSocketEventHandler;

        ws.current.onclose = () => {
            toast.error('WebSocket disconnected')
        }

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            toast.error('WebSocket error')
        }

        return () => {
            console.log('WebSocketProvider unmounted')
            ws.current?.close()
            ws.current = null
        }
    }, [ws.current,  isLoading, isAuthenticated]);

    if (!isAuthenticated || isLoading) {
        return <Loader2 className="animate-spin" />
    }

    return (
        <WebSocketContext.Provider value={{ socket: ws.current, setSocket: (s) => { ws.current = s }, isConnected: ws.current?.readyState === WebSocket.OPEN }}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebSocket = () => {

    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
}
