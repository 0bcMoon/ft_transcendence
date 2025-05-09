import { useState } from 'react';
import profile from '../image/profile.svg'
import options from '../image/options.svg'

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
        <div className={
                        `flex w-full flex-row 
                        items-center h-auto min-h-[50px] pl-2 pr-2
                        ${sender ? "justify-start" : "justify-end"}`
        }
        >
            <p
                className={`flex rounded-2xl w-[70%]  break-words pl-8 pr-2 h-full 
                            items-center
                        ${sender ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
            >
                {message}
            </p>

        </div>
    )
}
const ChatBanner = ({displayName, status}: ChatBannerProps) => {

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
export default function Chat() {
    const [messages, setMessage] = useState<MessageBoxProps[]>([

        {
            message: "Hello",
            sender: true
        },
        {
            message: "Hi",
            sender: false
        },
        {
            message: "How are you doing?",
            sender: true
        },
        {
            message: "I am doing great, thank you!",
            sender: false
        },
        {
            message: "What about you?",
            sender: true
        }
    ])
    function getRandomInt(max: number): number {
        return Math.floor(Math.random() * max);
    }
    const SendMessage = (event: Event) => {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)
        const message = formData.get("message")?.toString().trim();
        if (message === undefined || message.length == 0)
            return;
        const newMessage: MessageBoxProps = {
            message: message,
            sender: getRandomInt(2) === 0
        }
        setMessage([newMessage, ...messages])
        form.reset()


    }
    const chatBannerProps: ChatBannerProps = {
        displayName: "John Doe",
        status: Status.Playing
    }
    return (
        <div className="flex flex-col  flex-nowrap rounded-2xl items-center bg-white-200 h-screen
                        row-span-3 border border-gray-100 col-span-2">

            <ChatBanner {...chatBannerProps}/>
            <div
                className="flex flex-col-reverse gap-4 overflow-auto no-scrollbar  h-full w-full"
            >
                {/* this is where message get render  */}
                {/* TODO: add infinte content and only store a part of message Bonus: add redis to backend hh */}
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
                    mt-2  
                    placeholder:text-center p-4"
                    placeholder="input your message"
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
