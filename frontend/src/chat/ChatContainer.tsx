import { useState } from 'react';
import profile from '../image/profile.svg'
import options from '../image/options.svg'

import MessageApi from '../api/messageApi.ts';

type Event = React.FormEvent<HTMLFormElement>

interface MessageBoxProps {
    message: string | undefined,
    sender: boolean,

}

enum Status {
    Online = "Online",
    Offline = "Offline",
    Playing = "Playing...",
}

interface ChatBannerProps {
    displayName: string | undefined,
    status: Status,

}

const ChatBubble = ({ message, sender }: MessageBoxProps) => {
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
                    {message}
                </p>
            </div>
        </div>
    )
}

const ChatBanner = ({ displayName, status }: ChatBannerProps) => {

    return (
        <div
            className="flex items-center flex-row w-full gap-8 border-b border-gray-100 h-[10%]"
        >
            <img
                src={profile}
                className="rounded-full w-auto h-[80%] m-2 "
            />
            <p className="flex flex-col ">
                <span className="font-bold">{displayName} </span>
                <br />
                <span >{status}</span>
            </p>

            <img
                src={options}
                className="m-auto mr-4 rounded-s-full rounded-full w-4 h-4 "
            />
        </div>
    )
}
export default function ChatContainer() {
    const messageApi = MessageApi.getMessages()
    const [messages, setMessage] = useState<MessageBoxProps[]>(messageApi)
    const SendMessage = (event: Event) => {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)
        const message = formData.get("message")?.toString().trim();
        if (message === undefined || message.length == 0)
            return;
        const newMessage: MessageBoxProps = {
            message: message,
            sender: Math.floor(Math.random() * 2) === 0
        }
        setMessage([newMessage, ...messages])
        form.reset()
    }
    const chatBannerProps: ChatBannerProps = {
        displayName: "John Doe",
        status: Status.Playing
    }
    return (

        <div className="flex flex-col  flex-nowrap rounded-2xl items-center 
                        bg-white-200 h-[97svh] 
                        row-span-3 col-span-2
                        border-gray-100 border-2 shadow-lg shadow-gray-200"
        >
            <ChatBanner {...chatBannerProps} />
            <div 
                className="flex-1 overflow-y-auto no-scrollbar
                                           flex flex-col-reverse w-full pl-2 pr-2">
                {messages.map((message, idx) => <ChatBubble key={idx} {...message} />)}
            </div>
            <form
                className="flex flex-row justify-around w-full "
                onSubmit={SendMessage}
            >
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

            </form>

        </div>
    );
}
