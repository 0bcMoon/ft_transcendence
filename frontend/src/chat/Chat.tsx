import RecentChat from './RecentChat.tsx';
import ChatContainer from './ChatContainer.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatContext.tsx';
import toast from 'react-hot-toast';


const StartNewChat = () => {

    return (

        <div className="flex flex-col  flex-nowrap rounded-2xl items-center 
                        bg-white h-[97svh] 
                        col-span-8 justify-center gap-8
                        border-gray-100 border-2 shadow-lg shadow-gray-200"
        >
            <p className="text-gray-900 font-bold text-4xl"> Welcome Back</p>
            <p className="text-gray-400 font-bold text-xl">  Select A Contact to Start a New Chat</p>
        </div>
    )
}

export default function Chat() {

    const { token} = useAuth();
    const { currentChat } = useChat()
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);


    useEffect(() => {
        const timeid = setTimeout(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
                wsRef.current = null;
            }
            const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);
            wsRef.current = ws
            ws.onopen = () => {
                toast.success("Socket connect")
                setIsConnected(true);
            };
            ws.onerror = (error) => {
                toast.error("Socket connection error")
                console.error(error)
            };

            ws.onclose = () => {

                toast.error("Socket connection has been closed")
                wsRef.current = null
                setIsConnected(false);
            };
        }, 200);
        // Cleanup on unmount
        return () => {
            clearTimeout(timeid)
            if (wsRef.current) {
                wsRef.current.close(); // Close the WebSocket connection
            }
            wsRef.current = null; // Ensure the ref is cleared
            setIsConnected(false); // Reset connection status
        };

    }, [token]); // Reconnect if currentChat changes or token changes

    return (
        <>
            <RecentChat />
            {
                currentChat ?
                    <ChatContainer isConnected={isConnected} webSocket={wsRef.current} /> :
                    <StartNewChat />
            }

        </>
    )
}
