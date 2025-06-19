import { X, Trophy, Users, Zap } from 'lucide-react';
// import { useParams } from "react-router-dom";
import { AddFriendIcon, BlockIcon, ChatIcons, PingPongFillIcon } from '@/image/Icons';
import profile from '@/image/profile.svg'
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import { useChatStore } from '@/state/Store';


interface StartChatProps {
    id?: string;
    display_name?: string;
    profilePicture?: string;
}

const StartChat = ({ id, display_name, profilePicture }: StartChatProps) => {
    const navigate = useNavigate();

    const setChat = useChatStore((state) => state.setChat)!;

    const handleClick = () => {
        if (!id) {
            return;
        }
        setChat({
            display_name: display_name!,
            profile_image: profilePicture ?? profile,
        });
        navigate(`/chat/${id}`);

    }
    return (
        <div className="w-auto p-5 flex flex-row items-center gap-3
            justify-center h-8 rounded-xl bg-white hover:bg-gray-400
            transition-colors duration-300"
            onClick={handleClick}
        >
            <ChatIcons />
            <p className="font-semibold ">Start Chat</p>
        </div>
    )
}

interface ProfileStatusProps {
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    text: string;
    className: string;
    bgColor: string;

}
const ProfileStatus = ({ value, icon: Icon, text, className, bgColor }: ProfileStatusProps) => {

    return (
        <div className="text-center ">
            <div className={`flex items-center justify-center w-12 h-12 ${bgColor} rounded-xl mx-auto mb-2`}>
                <Icon className={className} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{text}</div>
        </div>
    )
}
const PlayPingPong = () => {

    return (
        <div
            className="border border-gray-500 w-auto p-5 flex flex-row items-center gap-3 
                justify-center h-8 rounded-xl hover:bg-gray-600 transition-colors duration-300 "
        >
            <PingPongFillIcon />
            <p className="font-semibold text-white">Play PingPong</p>
        </div>
    )
}

const BlockUser = () => {

    return (
        <div className="p-5 flex flex-row items-center gap-3 justify-center
            h-8 rounded-xl bg-red-600 hover:bg-red-700 transition-colors
            duration-300"
        >
            <BlockIcon />
            <p className="font-semibold text-white">Block</p>
        </div>
    )
}

const AddFriend = ({relation_status}: {relation_status: string | undefined}) => {

    const display_text = relation_status === 'friends' ? 'Unfriend' : 'Add Friend';

    return (
        <div className="p-5 flex flex-row items-center gap-3 justify-center
            h-8 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors
            duration-300"
        >
            <AddFriendIcon />
            <p className="font-semibold text-white">{display_text}</p>
        </div>
    )
}

const fetchUsersById = async (friendId: string) => {
    console.log(friendId);
    const response = await api.get(`/user/${friendId}`);
    return response.data;
}
interface User {

    id: string;
    relation_status: 'friends' | 'pending' | 'blocked' | 'none' | undefined;
    username?: string;
    display_name: string;
    profilePicture: string;
    status?: string;
}

const UserProfile = () => {

    const { userId } = useParams<{ userId: string }>();

    const { data } = useQuery<User>({
        queryKey: ['users', userId],
        queryFn: () => fetchUsersById(userId!),
        enabled: !!userId,
    })
    const ProfileStatusData = [
        {
            value: 22,
            icon: Trophy,
            text: 'Wins',
            bgColor: 'bg-green-100',
            className: 'w-6 h-6 text-green-500'
        },
        {
            value: 2,
            icon: X,
            text: 'Losses',
            bgColor: 'bg-red-100',
            className: 'w-6 h-6 text-red-500'
        },
        {
            value: 21,
            icon: Users,
            text: 'Rank',
            bgColor: 'bg-blue-100',
            className: 'w-6 h-6 text-blue-500'
        },
        {
            value: 85,
            icon: Zap,
            bgColor: 'bg-purple-100',
            text: 'Win Rate',
            className: 'w-6 h-6 text-purple-500'
        }
    ]
    return (
        <div
            className="flex flex-col items-center col-span-13  
                        h-[97svh] rounded-xl 
            border-gray-100 border-t-2 shadow-lg shadow-gray-200"
        >
            <div
                className="flex flex-col rounded-xl  w-250 h-120 mt-4"
            >
                <div
                    className="flex flex-row w-full h-[50%] 
                                bg-gradient-to-r from-gray-800 to-gray-600 
                                border-t rounded-t-xl "
                >
                    <img
                        src={profile}
                        alt="profile"
                        className="w-32 h-32 m-4 rounded-full object-cover "
                    />

                    <div className="flex flex-col w-full h-full">
                        <div className="w-full h-1/2 p-8 gap-4">
                            <p className="font-semibold text-2xl text-white">{data?.display_name}</p>
                            <div className='flex items-center gap-2'>
                                <p className="w-3 h-3 bg-green-500 rounded-full"></p>
                                <p className="text-gray-500">Online Now</p>
                            </div>
                        </div>
                        <div className="flex flex-row items-center p-4 gap-4 w-full h-1/2">
                            <StartChat id={data?.id} display_name={data?.display_name} profilePicture={data?.profilePicture} />
                            <PlayPingPong />
                            <AddFriend relation_status={data?.relation_status}/>
                            <BlockUser />
                        </div>
                    </div>
                </div>
                {/* Stats Section */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {ProfileStatusData.map((item, index) => (
                            <ProfileStatus
                                key={index}
                                {...item}
                            />
                        ))}
                    </div>
                </div>
            </div>

        </div>

    )
}

export default UserProfile;
