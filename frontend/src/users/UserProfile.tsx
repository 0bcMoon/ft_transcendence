import { X, Trophy, Users, Zap } from 'lucide-react';
// import { useParams } from "react-router-dom";
import { AddFriendIcon, BlockIcon, ChatIcons, PingPongFillIcon, UserXLineIcon } from '@/image/Icons';
import profile from '@/image/profile.svg'
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import { useChatStore } from '@/state/Store';
import { ReactNode } from 'react';


interface StartChatProps {
    id?: string;
    display_name?: string;
    profilePicture?: string;
}


type RelationshipStatus = 'friend' | 'pending' | 'blocked' | 'none';

interface IDisplayObject {
    display_text: string;
    icon: ReactNode;
    bgColor: string;
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
            <button className="font-semibold ">Start Chat</button>
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
            <button className="text-sm text-gray-500">{text}</button>
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
            <button className="font-semibold text-white">Play PingPong</button>
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
            <button className="font-semibold text-white">Block</button>
        </div>
    )
}

const AddFriend = ({ relation_status }: { relation_status: RelationshipStatus | undefined }) => {

    const display_object: Record<RelationshipStatus, IDisplayObject> = {

        'friend': {
            display_text: 'Unfriend',
            icon: <UserXLineIcon />,
            bgColor: 'bg-red-600 hover:bg-red-700'
        },
        'pending': {
            display_text: 'Cancel Request',
            icon: <AddFriendIcon />,
            bgColor: 'bg-yellow-600 hover:bg-yellow-700'
        },
        'blocked': {
            display_text: 'Unblock',
            icon: <AddFriendIcon />,
            bgColor: 'bg-green-600 hover:bg-green-700'
        },
        'none': {
            display_text: 'Add Friend',
            icon: <AddFriendIcon />,
            bgColor: 'bg-blue-600 hover:bg-blue-700'
        }
    };

    return (
        <div className="p-5 flex flex-row items-center gap-3 justify-center
            h-8 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors
            duration-300"
        >
            {display_object[relation_status || 'none'].icon}
            <button className='text-white font-semibold '>
                {display_object[relation_status || 'none'].display_text}
            </button>
        </div>
    )
}

const fetchUsersById = async (userId: string) => {
    const response = await api.get(`/user/${userId}`);
    return response.data;
}
interface User {

    id: string;
    relation_status: RelationshipStatus
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
    console.log(data);
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
                            <AddFriend relation_status={data?.relation_status} />
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
