import { useEffect } from 'react';

import profile from '@/image/profile.svg'
import options from '@/image/options.svg'
import { useChat } from '@/context/ChatContext.tsx';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api.ts';
import { useSwapStore } from '@/state/Store.ts';
import { MoveLeft } from 'lucide-react';

type Event = React.FormEvent<HTMLFormElement>

interface Message {

    user_id: number | undefined, // Assuming user_id is the ID of the current user
    id?: number,
    sender_id?: number,
    receiver_id?: number,
    content: string,
    created_at?: Date,

}

interface SendMessage {
    receiver_id: number,
    content: string,
}




const ChatBubble = ({ user_id, sender_id, content }: Message) => {
    //WARNING: remove this later
    const sender: boolean = sender_id === user_id;

    return (
        <div className={`flex w-full flex-row break-words mt-1 mb-1
                        items-start min-h-auto 
                        ${sender ? "justify-start" : "justify-end"}`}
        >
            <div
                className={`flex rounded-2xl max-w-[70%] break-all break-words px-4 py-2 
                           ${sender ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
            >
                <p className="whitespace-pre-wrap ">
                    {content}
                </p>

            </div>

        </div>
    )
}

const ChatBanner = () => {
    const { currentChat } = useChat()
    const setSwap = useSwapStore((state) => state.setSwap);

    return (
        <div
            className="flex items-center flex-row w-full gap-4 p-4 border-b border-gray-100 h-18"
        >
            <MoveLeft onClick={() => setSwap(false)}  className=' md:hidden w-4 text-gray-500 hover:hover:text-gray-800
            transition-colors duration-300'/>
            <img
                src={profile}
                className="rounded-full w-13 h-13 border"
            />
            <p className="flex flex-col ">
                <span className="font-bold">{currentChat?.display_name} </span>
                <br />
                <span ></span>
            </p>

            <img
                src={options}
                className="m-auto mr-4 rounded-s-full rounded-full w-4 h-4 "
            />
        </div>
    )
}
const InputBox = () => {
    return (
        <>
            <input
                name="message"
                className="shadow-gray-50 bg-gray-100 h-[50px] 
                    w-full rounded-lg 
                    mt-2  mr-4 ml-4
                    placeholder:text-center p-4"
                placeholder="type your message"
            >
            </input>

            <button type="submit"
                className="font-bold mt-2 m-4 rounded-4xl  h-[50px] bg-gray-100 w-[24%] ">
                Send
            </button>
        </>
    )
}

const fetchMessages = async (userId: number | null) => {

    if (!userId) {
        return [];
    }
    const response = await api.get<Message[]>(`/chat/${userId}/messages`);
    return response.data;

}

//find a way to use websocket to send messages

interface ChatContainerProps {

    isConnected: boolean;
    webSocket: WebSocket | null;
}


export default function ChatContainer({ isConnected, webSocket}: ChatContainerProps) {

    const { currentChat } = useChat()
    const queryClient = useQueryClient();
    const queryKey = ['messages', currentChat?.id]; // Unique query key for messages of the current chat
    const { data: messages } = useQuery<Message[]>({
        queryKey: queryKey,
        queryFn: async () => fetchMessages(currentChat?.id || null),
        enabled: !!currentChat, // Only run the query if currentChat is defined

    })

    const postMessage = async (payload: SendMessage) => {
        //
        if (webSocket === null || webSocket?.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket is not connected");
        }
        webSocket?.send(JSON.stringify(payload));
    };

    // API function to post a new message

    const sendMessageMutation = useMutation({
        mutationFn: postMessage,
        // When the mutation is successful...
        onSuccess: () => {
            toast.success('Message sent successfully');
            // We update the cache for the specific query key
        },
        onError: (error) => {
            toast.error('Failed to send message: ' + error.message);
        },
    });

    const SendMessage = (event: Event) => {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)
        const message = formData.get("message")?.toString().trim();
        if (message === undefined || message.length == 0)
            return;

        const newMessage: SendMessage = {
            content: message,
            receiver_id: currentChat!.id, // Assuming sender_id is the ID of the current user should not be null i hope so
        }
        // Call the mutation to send the message
        sendMessageMutation.mutate(newMessage);
        form.reset()
    }

    // Initialize WebSocket connection

    useEffect(() => {
        //TODO: try to reconnect to socket
        if (webSocket === undefined || webSocket === null)
            return;
        webSocket.onmessage = (event) => {
            const data: Message = JSON.parse(event.data); //plz dont fail me
            // Update the messages cache with the new message
            queryClient.setQueryData<Message[]>(['messages', currentChat?.id], (oldMessages) => {
                if (!oldMessages) return [data];
                return [data, ...oldMessages];
            });
            toast.success('New message received');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentChat]);
    const swap = useSwapStore((state) => state.swap);
    return (

        <div className={`${swap ? "flex" : " hidden md:flex"} flex-col   flex-nowrap rounded-2xl items-center 
                        bg-white-200 h-[97svh] 
                        md:col-span-8
            			col-span-14
                        border-gray-100 border-2 shadow-lg shadow-gray-200`}
        >
            <ChatBanner />
            <div
                className="flex-1 overflow-y-auto no-scrollbar
                                           flex flex-col-reverse w-full pl-2 pr-2">
                {messages?.map((message, idx) => <ChatBubble key={idx}  {...message} user_id={currentChat?.id} />)}
            </div>
            <form
                className="flex flex-row justify-around w-full "
                onSubmit={SendMessage}
            >
                {isConnected && currentChat && <InputBox />}
            </form>

        </div>
    );
}
