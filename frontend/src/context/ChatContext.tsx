
import { createContext, useState, ReactNode, useContext } from 'react';

// Define user type
interface CurrentUserChat {
    id: number;
    display_name: string;
}

// Define context type
interface ChatContextType {
    currentChat: CurrentUserChat | null;
    setCurrentChat: (user: CurrentUserChat | null) => void;
}

// Create the context
const ChatContext = createContext<ChatContextType | null>(null);

// Create a provider component
export function ChatProvider({ children }: { children: ReactNode }) {
    const [currentChat, setCurrentChat] = useState<CurrentUserChat | null>(null);


    // Do some initialization if needed

    return (
        <ChatContext.Provider
            value={{
                currentChat,
                setCurrentChat
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}


export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within an ChatProvider');
    }
    return context;
}

