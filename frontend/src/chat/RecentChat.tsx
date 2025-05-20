import profile from '../image/profile.svg'
import options from '../image/options.svg'
import MessageApi from '../api/messageApi.ts';

interface chatProfileProps {
    profilePicture: string | undefined
    displayName: string | undefined,
    status: string,
    lastMessage: string | undefined

}
const Contact = ({ profilePicture, displayName, status, lastMessage }: chatProfileProps) => {
    if (lastMessage != undefined && lastMessage.length > 35) {
        lastMessage = lastMessage.slice(1, 35) + "....."
    }

    return (
        <div
            className="flex flex-row
                    border border-gray-200 w-[96%] rounded-2xl h-16"
        >
            <img
                src={profilePicture ?? profile}
                className="rounded-full w-auto h-[80%] m-2 "
            />
            <div className="flex flex-col justify-evenly w-full">
                <p className="text-xl"> {displayName}</p>
                <p className="text-xs pl-2 text-gray-600"> {lastMessage}</p>
            </div>

            <img
                src={options}
                className="m-auto mr-4 rounded-s-full rounded-full w-4 h-4 "
            />

        </div>
    )
}
export default function RecentChat() {
    const contactsList = MessageApi.getContactList()
    return (
        <div className="flex flex-col  flex-nowrap rounded-2xl items-center 
                        bg-white-200 h-[97svh] 
                        row-span-3 col-span-1 gap-2
                        border-gray-100 border-2 shadow-lg shadow-gray-200">
            <div
                className="flex items-center flex-row w-full gap-8 border-b border-gray-100 h-[10%]"
            >
                <span className="text-center w-full font-bold text-xl ">Direct Messages</span>
            </div>
            <div
                className="flex gap-4 overflow-auto no-scrollbar  h-full w-full justify-start items-center flex-col"
            >
                {contactsList.map((profile, index) => <Contact key={index} {...profile} />)}
            </div>
        </div>
    )
}
