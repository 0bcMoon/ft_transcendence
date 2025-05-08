import { useState} from 'react';
import profile from '../image/profile.svg'

type Event = React.FormEvent<HTMLFormElement>


interface MessageBoxProps {
    message: string | undefined,
    sender: boolean,

}

const MessageBox = ({ message, sender }: MessageBoxProps) => {

    return (
        <div className={
            `flex w-full flex-row  
                        border-yellow-500 items-center h-auto min-h-[50px]
                        ${sender ? "justify-start" : "justify-end"}`
        }
        >
            <p
                className="border-4 rounded-2xl w-[70%]  break-words pl-8 pr-2 h-full"
            >
                {message}
            </p>

        </div>
    )
}
const ChatBanner  = () => {

    return (
            <div
                className="flex flex-row w-full border border-red-500 h-[10%]"
            >
            <img 
                src={profile}
                className="rounded-full w-auto h-[80%] m-2 border "
            />


            </div>
    )
}
export default function Chat() {
    const [messages, setMessage] = useState<MessageBoxProps[]>([])
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
    return (
        <div className="flex flex-col flex-nowrap items-center   h-screen bg-gray-200
                        row-span-3 border-4 border-black col-span-2">

            <ChatBanner />
            <div
                className="flex flex-col-reverse gap-4 overflow-auto no-scrollbar  h-full w-full"
            >
                {/* this is where message get render  */}
                {/* TODO: add infinte content and only store a part of message Bonus: add redis to backend hh */}
                {messages.map((message, idx) => <MessageBox key={idx} {...message} />)}
            </div>

            <form
                className="flex flex-row justify-around w-full"
                onSubmit={SendMessage}
            >
                <input
                    name="message"
                    className="border-4 border-blue-500 h-[50px] 
                    w-full rounded-lg 
                    mt-2 
                    placeholder:text-center p-4"
                    placeholder="input your message"
                >
                </input>

                <button type="submit"
                    className="font-bold mt-2 m-4 rounded-4xl  h-[50px] border border-blue-500 w-[24%]">
                    Send
                </button>

            </form>

        </div>
    );
}
