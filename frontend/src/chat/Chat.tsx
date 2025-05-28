import RecentChat from './RecentChat.tsx';
import ChatContainer from './ChatContainer.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import  { Toaster } from 'react-hot-toast';


export default function Chat() {

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    return (
        <>
            <div><Toaster
                toastOptions={{
                    duration: 5000,
                    position: "top-right",
                    style: {
                        width: "300px",
                        height: "50px",
                    },
                }}
            /></div>
            <div className="pt-2 pr-2 pl-2 grid grid-flow-col gap-4 h-screen  grid-cols-4 ">
                <RecentChat />
                <ChatContainer />
            </div>
        </>
    )
}
