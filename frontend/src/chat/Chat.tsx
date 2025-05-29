import RecentChat from './RecentChat.tsx';
import ChatContainer from './ChatContainer.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useChat } from '../context/ChatContext.tsx';


const StartNewChat = () => {


    return (

        <div className="flex flex-col  flex-nowrap rounded-2xl items-center 
                        bg-white-200 h-[97svh] 
                        col-span-8 justify-center gap-8
                        border-gray-100 border-2 shadow-lg shadow-gray-200"
        >
            <p className="text-gray-900 font-bold text-4xl"> Welcome Back</p>
            <p className="text-gray-400 font-bold text-xl">  Select A Contact to Start a New Chat</p>
        </div>
    )
}

export default function Chat() {

    const { token, isAuthenticated } = useAuth();
    const { currentChat } = useChat()
    const navigate = useNavigate();
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (!token)
            return
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.close();
            wsRef.current = null;
        }
        const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);
        wsRef.current = ws
        ws.onopen = () => {

            toast.success('Connected to WebSocket');
            setIsConnected(true);
        };
        ws.onerror = (error) => {
            toast.error('Error: WebSocket error: ' + error);
        };

        ws.onclose = () => {
            toast.error("WebSocket connection closed");
            wsRef.current = null
            setIsConnected(false);
        };
        // Cleanup on unmount
        return () => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close(); // Close the WebSocket connection
                toast.success("WebSocket connection cleanUp");
            }
            wsRef.current = null; // Ensure the ref is cleared
            setIsConnected(false); // Reset connection status
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Reconnect if currentChat changes or token changes

    return (
        <>
            <RecentChat />
            {currentChat ? <ChatContainer isConnected={isConnected} webSocket={wsRef.current} /> : <StartNewChat />}

        </>
    )
}
