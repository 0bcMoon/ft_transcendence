import { User, X, Trophy, Users, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import { AddFriendIcon, BlockIcon, ChatIcons, PingPongFillIcon, UserXLineIcon } from '@/image/Icons';
import profile from '@/image/profile.svg'
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import { useState } from 'react';
import {
    useAcceptRequest,
    useBlockUser,
    useCancelRequest,
    useDenyRequest,
    useSendRequest,
    useUnFriend
} from '@/api/mutations';
import Loader from '@/vendor/loader';
import Modal from '@/component/Model';




type RelationshipStatus = 'friend' | 'pending' | "waiting" | 'blocking' | 'block_by' | 'none';



const StartChat = ({ relation_status, id, display_name, profile_picture }: User) => {

    switch (relation_status) {
        case 'blocking':
        case 'block_by':
            return;
    }

    const navigate = useNavigate();
    //FIXME: : use the new chat store
    const setChat = (a: any) => {}

    //TODO: on start chat add user to contact list if not already present
    const startChat = () => {
        setChat({
            id: id,
            display_name: display_name,
            profile_image: profile_picture ?? profile,
        });
        navigate(`/chat/${id}`);
    }
    return (
        <div className="w-auto p-5 flex flex-row items-center gap-3
            justify-center h-8 rounded-xl bg-white hover:bg-gray-400
            transition-colors duration-300"
            onClick={startChat}
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

const PlayPingPong = ({ relation_status }: User) => {

    switch (relation_status) {
        case 'blocking':
        case 'block_by':
            return
    }

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

const BlockAction = ({ id, relation_status }: User) => {
    const [ isModalOpen,setIsModalOpen ] = useState(false);

    const { mutate: blockAction, isPending } = useBlockUser({ user_id: id });
    switch (relation_status) {
        case 'blocking':
            break;
        default:
            relation_status = undefined;
    }


    const display_object: Record<string, any> = {

        'blocking': {
            action: () => blockAction({ action: false }),
            title: "Confirm Unblock",
            message: `Are you sure you want to unblock this user? You will be able to interact with them again.`,
            type: 'warning',
            acceptText: "Unblock",
            display_text: 'Unblock',

        },
        'else': {
            display_text: 'Block',
            action: () => blockAction({ action: true }),
            title: "Confirm Block",
            message: `Are you sure you want to block this user? You will no longer be able to interact with them.`,
            type: 'danger',
            acceptText: "Block",

        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="p-5 flex flex-row items-center gap-3 justify-center
            h-8 rounded-xl bg-red-600 hover:bg-red-700 transition-colors
            duration-300"
            >
                { isPending ? <Loader2 className='text-white animate-spin'/> : <BlockIcon className='text-white' /> }
                <p className="font-semibold text-white">{display_object[relation_status || 'else'].display_text}</p>
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDeny={() => setIsModalOpen(false)}
                onAccept={() => {display_object[relation_status ?? 'else'].action(); setIsModalOpen(false)}}
                title={display_object[relation_status ?? 'else'].title}
                message={display_object[relation_status ?? 'else'].message}
                acceptText={display_object[relation_status ?? 'else'].acceptText}
                type={display_object[relation_status ?? 'else'].type}
                denyText="Cancel"
            />
        </>
    )
}


const FriendRequestDenyOrAccept = ({ req_id, id }: User) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isPending: isPendingAccept, mutate: acceptRequest } = useAcceptRequest({ req_id, user_id: id });
    const { isPending: isPendingDeny, mutate: denyRequest } = useDenyRequest({ req_id, user_id: id });

    const isPending = isPendingAccept || isPendingDeny;

    const handleAccept = () => {
        acceptRequest();
        setIsModalOpen(false);
    }

    const handleDeny = () => {
        denyRequest();
        setIsModalOpen(false);
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="p-5 flex flex-row items-center gap-3 justify-center
            h-8 rounded-xl bg-green-600 hover:bg-green-700 transition-colors
            duration-300"
            >
                {isPending ? <Loader2 className='text-white animate-spin' /> : <Users className='text-white' />}
                <p className="font-semibold text-white">Respond to Request</p>
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAccept={handleAccept}
                onDeny={handleDeny}
                title="Friend Request"
                message="This user has sent you a friend request. What would you like to do?"
                acceptText="Accept"
                denyText="Deny"
                type="default"
            />
        </>
    )
}
const FriendRequestAction = (data: User) => {

    switch (data.relation_status) {
        case 'friend':
        case 'pending':
        case 'none':
            return <FriendAction {...data} />
        case 'waiting':
            return <FriendRequestDenyOrAccept {...data} />
        default:
    }
}


const FriendAction = ({ req_id, relation_status, id }: User) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const { mutate: cancelRequest, isPending: isCanceling } = useCancelRequest({ req_id, user_id: id });
    const { mutate: sendRequest, isPending: isSending } = useSendRequest({ user_id: id });
    const { mutate: unfriend, isPending: isUnfriending } = useUnFriend({ user_id: id });

    const isPending = isCanceling || isSending || isUnfriending;

    const display_object: Record<string, any> = {

        'friend': {
            display_text: 'Unfriend',
            icon: <UserXLineIcon />,
            action: unfriend,
            title: "Confirm Unfriend",
            message: "Are you sure you want to unfriend this user? This action cannot be undone.",
            acceptText: "Unfriend",
            type: 'danger',
        },
        'pending': {
            display_text: 'Cancel Request',
            icon: <X className='text-white' />,
            action: cancelRequest,
            title: "Cancel Friend Request",
            message: "Are you sure you want to cancel your friend request to this user?",
            acceptText: "Cancel Request",
            type: 'warning',
        },
        'none': {
            display_text: 'Add Friend',
            icon: <AddFriendIcon />,
            action: sendRequest,
            title: "Send Friend Request",
            message: "Do you want to send a friend request to this user?",
            acceptText: "Send",
            type: 'info',
        }
    };

    const current_display = display_object[relation_status || 'none'];

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="p-5 flex flex-row items-center gap-3 justify-center
            h-8 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors
            duration-300"
            >
                {isPending ? <Loader2 className='text-white animate-spin' /> : current_display.icon}
                <p className='text-white font-semibold '>
                    {current_display.display_text}
                </p>
            </button>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDeny={() => setIsModalOpen(false)}
                onAccept={() => { current_display.action(); setIsModalOpen(false); }}
                title={current_display.title}
                message={current_display.message}
                acceptText={current_display.acceptText}
                type={current_display.type}
                denyText="Cancel"
            />
        </>
    )
}

const fetchUsersById = async (user_id: number) => {
    const response = await api.get(`/user/${user_id}`);
    return response.data;
}

interface User {

    id: number;
    req_id: number | null;
    relation_status?: RelationshipStatus
    username?: string;
    display_name?: string;
    profile_picture?: string;
}

const UserProfile = () => {

    const { user_id: s_user_id } = useParams<{ user_id: string }>();

    const navigate = useNavigate();
    const user_id = s_user_id ? parseInt(s_user_id, 10) : undefined;

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
                        src={data.profile_picture}
                        alt="profile"
                        className="w-32 h-32 m-4 rounded-full object-cover "
                    />

                    <div className="flex flex-col w-full h-full">
                        <div className="w-full h-1/2 gap-4 p-6">
                            <p className="font-semibold text-2xl text-white">{data.display_name}</p>
                            <div className='flex items-center gap-2'>
                                <p className="w-3 h-3 bg-green-500 rounded-full"></p>
                                <p className="text-gray-500">Online Now</p>
                            </div>

                        </div>
                        <div className="flex flex-row items-center p-4 gap-4 w-full h-1/2">
                            <StartChat {...data} />
                            <PlayPingPong {...data} />
                            <FriendRequestAction {...data} />
                            <BlockAction {...data} />
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
