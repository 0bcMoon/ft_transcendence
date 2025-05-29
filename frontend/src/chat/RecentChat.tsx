import profile from '../image/profile.svg'
import options from '../image/options.svg'
import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import Loader from '../vendor/loader';
import { useChat } from '../context/ChatContext';

interface chatProfileProps {
    id: number,
    display_name: string,
    username: string
    lastMessage: string
    profilePicture?: string

}
const Contact = ({ id, display_name, lastMessage, profilePicture }: chatProfileProps) => {


    const { setCurrentChat } = useChat();

    if (lastMessage != undefined && lastMessage.length > 35) {
        lastMessage = lastMessage.slice(1, 35) + "....."
    }

    const selectUser = async () => {
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
    const response = await api.get<chatProfileProps[]>('/chat/contacts');
    return response.data;
}

export default function RecentChat() {

    const { data: contacts, error, isLoading } = useQuery<chatProfileProps[]>({
        queryFn: getContacts,
        queryKey: ['contacts'],
    })

    return (
        <div 
            className="flex flex-col  flex-nowrap rounded-2xl items-center 
                        bg-white-200 h-[97svh] 
                        gap-2
                        col-span-5
                        border-gray-100 border-2 shadow-lg shadow-gray-200"
        >
            <div
                className="flex items-center flex-row w-full gap-8 border-b border-gray-100 h-[10%]"
            >
                <span className="text-center w-full font-bold text-xl ">Direct Messages</span>
            </div>

            <div
                className="flex gap-4 overflow-auto no-scrollbar  h-full w-full justify-start items-center flex-col"
            >
                {isLoading && <Loader />}
                {contacts?.map((profile, index) => <Contact key={index} {...profile} />)}
                {error && <div className="text-red-500 font-bold mt-4">Error fetching contacts</div>}
            </div>
        </div>
    )
}
