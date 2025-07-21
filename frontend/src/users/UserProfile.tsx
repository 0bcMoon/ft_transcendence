import { X, Trophy, Users, Zap, ArrowLeft } from 'lucide-react';
import { AddFriendIcon, BlockIcon, ChatIcons, PingPongFillIcon, UserXLineIcon } from '@/image/Icons';
import profile from '@/image/profile.svg'
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import { useChatStore } from '@/state/Store';
import { ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useBlockUser, useCancelRequest, useUnBlockUser } from '@/api/mutations';
import Loader from '@/vendor/loader';


interface StartChatProps {
    id?: number;
    display_name?: string;
    profilePicture?: string;
}


type RelationshipStatus = 'friend' | 'pending' | "waiting" | 'blocked' | 'none';

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

const BlockUser = ({ id, relation_status }: User) => {
    const { mutate: blockUser } = useBlockUser();
    const { mutate: unBlockUser } = useUnBlockUser();

    const handelBlock = (relation_status: string) => {
        switch (relation_status) {
            case 'blocking':
            case 'block_by':
                // Unblock user
                unBlockUser({ user_id: id });
                break;
            case 'friend':
            case 'pending':
            case 'waiting':
            case 'none':
                // Block user
                blockUser({ user_id: id });
                break;
        }
    }

    return (
        <button onClick={() => handelBlock(relation_status || 'none')} className="p-5 flex flex-row items-center gap-3 justify-center
            h-8 rounded-xl bg-red-600 hover:bg-red-700 transition-colors
            duration-300"
        >
            <BlockIcon />
            <p className="font-semibold text-white">Block</p>
        </button>
    )
}

const FriendOption = ({ req_id, relation_status, id }: User) => {

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
        // add  dislay none to friend option
        'blocked': {
            display_text: 'Unblock',
            icon: <AddFriendIcon />,
            bgColor: 'bg-green-600 hover:bg-green-700'
        },

        'waiting': {
            display_text: 'Waiting to accepte',
            icon: <AddFriendIcon />,
            bgColor: 'bg-green-600 hover:bg-green-700'
        },
        'none': {
            display_text: 'Add Friend',
            icon: <AddFriendIcon />,
            bgColor: 'bg-blue-600 hover:bg-blue-700'
        }
    };

    const queryClient = useQueryClient();

    const FriendMutation = useMutation({
        mutationKey: ["friend-request", id],
        mutationFn: async () => {
            const response = await api.post(`/user/requests`, { user_id: id, type: "friend" });
            return response.data;
        },
        onSuccess: async () => {
            toast.success("Friend request sent successfully");

            //TODO: invalidate the specific user query to refetch updated data now it invalid all user 

            // Invalidate the specific user query to refetch updated data
            // queryClient.invalidateQueries({ queryKey: ['users', id] });
            // Also invalidate all users queries in case this affects other user lists
            queryClient.invalidateQueries({ queryKey: ['users'] });
            //console.log('Invalidated queries for user:', id);
        },
        onError: async (error: any) => {
            toast.error(error.response?.data?.message || "500 Internal Server Error");
        },
    });

    const { mutate: cancelRequest } = useCancelRequest();

    const handleClick = (relation_status: string) => {

        switch (relation_status) {
            case 'friend':
                // Unfriend
                toast.success("Unfriended successfully");
                break;
            case 'pending':
                cancelRequest({ req_id: req_id, user_id: id });
                break
            case 'none':
                FriendMutation.mutate();
                break;
        }
    }

    // TODO: if user is blocked  disable some actions like add friend, start chat, play pingpong
    return (
        <button onClick={() => handleClick(relation_status || 'none')} className="p-5 flex flex-row items-center gap-3 justify-center
            h-8 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors
            duration-300"
        >
            {display_object[relation_status || 'none'].icon}
            <p className='text-white font-semibold '>
                {display_object[relation_status || 'none'].display_text}
            </p>
        </button>
    )
}

const fetchUsersById = async (user_id: string) => {
    const response = await api.get(`/user/${user_id}`);
    return response.data;
}
interface User {

    id: number;
    req_id: number | null;
    relation_status?: RelationshipStatus
    username?: string;
    display_name?: string;
    profilePicture?: string;
}

const UserProfile = () => {

    const { user_id } = useParams<{ user_id: string }>();
    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery<User>({
        queryKey: ['users', user_id],
        queryFn: () => fetchUsersById(user_id!),
        enabled: !!user_id,
    })

    const handleGoBack = () => {
        navigate(-1);
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center col-span-13 h-[97svh] rounded-xl border-gray-100 border-t-2 shadow-lg shadow-gray-200">
                <Loader />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex flex-col items-center justify-center col-span-13 h-[97svh] rounded-xl border-gray-100 border-t-2 shadow-lg shadow-gray-200">
                <p className="text-red-500 text-lg">Error fetching user profile.</p>
            </div>
        );
    }

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
            {/* Back Arrow */}
            <div className="w-full px-4 pt-4">
                <button
                    onClick={handleGoBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-500 
                              hover:text-gray-800  
                              transition-all duration-200 transform hover:scale-105
                              "
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back</span>
                </button>
            </div>

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
                            <FriendOption {...data} />
                            <BlockUser {...data}/>
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
