import profile from '@/image/profile.svg'
import options from '@/image/options.svg'
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import Loader from '@/vendor/loader';
import { useChat } from '@/context/ChatContext';
import { useState } from 'react';
import endpoints from '@/endpoints.json';
import { useSwapStore } from '@/state/Store';

interface ChatProfileProps {
    id: number,
    display_name: string,
    username: string
    lastMessage: string
    profilePicture?: string

}
const Contact = ({ id, display_name, lastMessage, profilePicture }: ChatProfileProps) => {


    const { setCurrentChat } = useChat();

    if (lastMessage != undefined && lastMessage.length > 35) {
        lastMessage = lastMessage.slice(1, 35) + "....."
    }

    const setSwap = useSwapStore((state) => state.setSwap);
    const selectUser = async () => {
        setSwap(true);
        setCurrentChat({ id, display_name });
    }

    return (
        <div onClick={selectUser}
            className="flex flex-row
                    border border-gray-200 w-[96%] rounded-2xl h-16"
        >
            <img
                src={profilePicture ?? profile}
                className="rounded-full w-auto h-[80%] m-2 "
            />
            <div className="flex flex-col justify-evenly w-full">
                <p className="text-xl"> {display_name}</p>
                <p className="text-xs pl-2 text-gray-600"> {lastMessage}</p>
            </div>

            <img
                src={options}
                className="m-auto mr-4 rounded-s-full rounded-full w-4 h-4 "
            />

        </div>
    )
}
export interface ChatUser {
    id: string;
    display_name: string;
}

const getContacts = async () => {
    const response = await api.get<ChatProfileProps[]>(endpoints.chat.contacts);
    return response.data;
}
interface OptionsProps {
    fetchState: boolean;
    setFetchState: (user: boolean) => void;
}
const Options = ({ fetchState, setFetchState }: OptionsProps) => {

    return (
        <div
            className="flex flex-row justify-evenly items-center gap-4 
                    w-[96%]"
        >
            <button
                onClick={() => setFetchState(true)}
                className={`w-45 h-8 border rounded-xl border-gray-100 ml-4 text-gray-600 font-bold ${fetchState ? 'bg-gray-200' : ''}`}
            >
                Messages

            </button>
            <button
                onClick={() => setFetchState(false)}
                className={`w-45 h-8 border rounded-xl border-gray-100 ml-4 text-gray-600 font-bold ${!fetchState ? 'bg-gray-200' : ''}`}
            >
                Chat Request
            </button>
        </div>
    )
}
const Contacts = ({ contacts }: { contacts: ChatProfileProps[] | undefined }) => {

    return (
        <>
            {contacts?.map((profile, index) => <Contact key={index} {...profile} />)}
        </>
    )
}
const MessagesRequest = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            {/* <p className="text-gray-400 font-bold text-xl"> No Chat Request</p> */}
        </div>
    )
}

export default function RecentChat() {

    const [fetchState, setFetchState] = useState<boolean>(true);

    const { data: contacts, error, isLoading } = useQuery<ChatProfileProps[]>({
        queryFn: getContacts,
        queryKey: ['contacts'],
    })

    const swap = useSwapStore((state) => state.swap);

    return (
        <div
            className={`${swap ? "hidden md:flex": "flex"} flex-col  flex-nowrap rounded-2xl items-center 
                        bg-white-200 h-[97svh] 
                        gap-2
                        col-span-14
                        md:col-span-6
                        border-gray-100 border-2 shadow-lg shadow-gray-200`}
        >
            <div
                className="flex items-center flex-row w-full gap-8 border-b border-gray-100 h-[10%]"
            >

                <span className="text-center w-full font-bold text-xl ">Direct Messages</span>

            </div>

            <Options fetchState={fetchState} setFetchState={setFetchState} />

            <div
                className="flex gap-4 overflow-auto no-scrollbar  h-full w-full justify-start items-center flex-col"
            >
                {fetchState ? <Contacts contacts={contacts} /> : <MessagesRequest />}
                {isLoading && <Loader />}
                {error && <div className="text-red-500 font-bold mt-4">Error fetching Users Contacts</div>}
            </div>
        </div>
    )
}
