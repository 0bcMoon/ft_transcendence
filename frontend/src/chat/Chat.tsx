import RecentChat from './RecentChat.tsx';
import ChatContainer from './ChatContainer.tsx';
import { useEffect, useRef, useState } from 'react';
// import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
// import { useSwapStore } from '@/state/Store.ts';


const StartNewChat = () => {


    return (
        <div className="hidden md:flex flex-col  flex-nowrap rounded-2xl items-center 
                        bg-white h-[97svh] 
                        col-span-14
            			md:col-span-8
                        justify-center gap-8
                        border-gray-100 border-2 shadow-lg shadow-gray-200"
        >
            <p className="text-gray-900 font-bold text-4xl"> Welcome Back</p>
            <p className="text-gray-400 font-bold text-xl">  Select A Contact to Start a New Chat</p>
        </div>
    )
}

export default function Chat() {

    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const { user_id } = useParams<{ user_id: string }>();


    useEffect(() => {
        const timeid = setTimeout(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
                wsRef.current = null;
            }
            const ws = new WebSocket("ws://localhost:3000/chat");
            wsRef.current = ws
            ws.onopen = () => {
                // toast.success("Socket connect")
                setIsConnected(true);
            };
            ws.onerror = (error) => {
                // toast.error("Socket connection error")
                console.error(error)
            };

            ws.onclose = () => {
                // toast.error("Socket connection has been closed")
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
    }, []); // Reconnect if currentChat changes or token changes

    return (
        <>
            <RecentChat />
            {
                user_id ?
                    <ChatContainer user_id={user_id} isConnected={isConnected} webSocket={wsRef.current} /> :
                    <StartNewChat />
            }

        </>
    )
}
