import { X, Trophy, Users, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import { AddFriendIcon, BlockIcon, ChatIcons, PingPongFillIcon, UserXLineIcon } from '@/image/Icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import toast from 'react-hot-toast';
import { useActiveChatStore } from '@/state/Store';
import { RemoteUser } from '@/types/types';

const baseButtonClasses = "flex items-center justify-center gap-2 w-full sm:w-auto font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

function StartChat({ relation_status, id }: { relation_status: string, id: number }) {
    const navigate = useNavigate();
    const setActiveChat = useActiveChatStore(state => state.setActiveChat);
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const response = await api.get('/api/chat/contact', { params: { id: id } })
            return response.data;
        },
        onSuccess: (data: RemoteUser) => {
            setActiveChat(data);
            navigate("/chat");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Error: Could not start chat");
        }
    });

    if (relation_status === 'blocking' || relation_status === 'block_by') return null;

    return (
        <button
            className={`${baseButtonClasses} 
                       bg-gray-100 hover:bg-gray-200 text-gray-800 
                       dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white 
                       dark:focus:ring-offset-gray-900`}
            onClick={() => mutate()}
            disabled={isPending}
        >
            {isPending ? <Loader2 className='w-5 h-5 animate-spin' /> : <ChatIcons />}
            <span>Start Chat</span>
        </button>
    )
}

// --- ProfileStatus Component ---
interface ProfileStatusProps {
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    text: string;
    className: string;
    bgColor: string;
}

function ProfileStatus({ value, icon: Icon, text, className, bgColor }: ProfileStatusProps) {
    return (
        <div className="text-center">
            <div className={`flex items-center justify-center w-12 h-12 ${bgColor} rounded-xl mx-auto mb-2`}>
                <Icon className={className} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{text}</span>
        </div>
    )
}

function PlayPingPong({ relation_status }: RemoteUser) {
    if (relation_status === 'blocking' || relation_status === 'blocked_by') return null;

    return (
        <button
            className={`${baseButtonClasses} bg-green-600 hover:bg-green-700 text-white dark:focus:ring-offset-gray-900`} >
            <PingPongFillIcon />
            <span>Play PingPong</span>
        </button>
    )
}

function BlockAction({ id, relation_status }: RemoteUser) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { mutate: blockAction, isPending } = useBlockUser();

    const status = relation_status === 'blocking' ? 'blocking' : 'none';

    const display_object = {
        'blocking': {
            action: () => blockAction({ action: false, user_id: id }),
            title: "Confirm Unblock",
            message: `Are you sure you want to unblock this user? You will be able to interact with them again.`,
            type: 'warning',
            acceptText: "Unblock",
            display_text: 'Unblock',
        },
        'none': {
            display_text: 'Block',
            action: () => blockAction({ action: true, user_id: id }),
            title: "Confirm Block",
            message: `Are you sure you want to block this user? You will no longer be able to interact with them.`,
            type: 'danger',
            acceptText: "Block",
        }
    };

    const current_display = display_object[status];

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`${baseButtonClasses} 
                           bg-red-600 hover:bg-red-700 text-white
                           dark:focus:ring-offset-gray-900`}
            >
                {isPending ? <Loader2 className='w-5 h-5 animate-spin' /> : <BlockIcon className='text-white' />}
                <span>{current_display.display_text}</span>
            </button>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDeny={() => setIsModalOpen(false)}
                onAccept={() => { current_display.action(); setIsModalOpen(false) }}
                denyText="Cancel"
                {...current_display} // Pass all other props
            />
        </>
    )
}

// --- FriendRequestDenyOrAccept Component ---
function FriendRequestDenyOrAccept({ req_id, id }: RemoteUser) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isPending: isPendingAccept, mutate: acceptRequest } = useAcceptRequest();
    const { isPending: isPendingDeny, mutate: denyRequest } = useDenyRequest();
    const isPending = isPendingAccept || isPendingDeny;

    const handleAccept = () => {
        acceptRequest({ req_id: req_id!, user_id: id });
        setIsModalOpen(false);
    }
    const handleDeny = () => {
        denyRequest({ req_id: req_id!, user_id: id });
        setIsModalOpen(false);
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`${baseButtonClasses} 
                           bg-green-600 hover:bg-green-700 text-white
                           dark:focus:ring-offset-gray-900`}
            >
                {isPending ? <Loader2 className='w-5 h-5 animate-spin' /> : <Users className='w-5 h-5' />}
                <span>Respond to Request</span>
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

// --- FriendRequestAction Component (Controller) ---
function FriendRequestAction(data: RemoteUser) {
    switch (data.relation_status) {
        case 'friend':
        case 'pending':
        case 'none':
            return <FriendAction {...data} />
        case 'waiting':
            return <FriendRequestDenyOrAccept {...data} />
        default:
            return null; // Handle default case
    }
}

// --- FriendAction Component ---
function FriendAction({ req_id, relation_status, id }: RemoteUser) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { mutate: cancelRequest, isPending: isCanceling } = useCancelRequest();
    const { mutate: sendRequest, isPending: isSending } = useSendRequest();
    const { mutate: unfriend, isPending: isUnfriending } = useUnFriend();

    const isPending = isCanceling || isSending || isUnfriending;

    // Default to 'none' if status is null or undefined
    const status = relation_status || 'none';

    const display_object: Record<string, any> = {
        'friend': {
            display_text: 'Unfriend',
            icon: <UserXLineIcon />,
            action: () => unfriend({ user_id: id }),
            title: "Confirm Unfriend",
            message: "Are you sure you want to unfriend this user? This action cannot be undone.",
            acceptText: "Unfriend",
            type: 'danger',
            className: `${baseButtonClasses} bg-red-600 hover:bg-red-700 text-white dark:focus:ring-offset-gray-900`
        },
        'pending': {
            display_text: 'Cancel Request',
            icon: <X className='w-5 h-5 text-white' />,
            action: () => cancelRequest({ req_id: req_id!, user_id: id }),
            title: "Cancel Friend Request",
            message: "Are you sure you want to cancel your friend request to this user?",
            acceptText: "Cancel Request",
            type: 'warning',
            className: `${baseButtonClasses} bg-gray-600 hover:bg-gray-700 text-white dark:focus:ring-offset-gray-900`
        },
        'none': {
            display_text: 'Add Friend',
            icon: <AddFriendIcon />,
            action: () => sendRequest({ user_id: id }),
            title: "Send Friend Request",
            message: "Do you want to send a friend request to this user?",
            acceptText: "Send",
            type: 'info',
            className: `${baseButtonClasses} bg-blue-600 hover:bg-blue-700 text-white dark:focus:ring-offset-gray-900`
        }
    };

    const current_display = display_object[status];

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className={current_display.className} >
                {isPending ? <Loader2 className='w-5 h-5 animate-spin' /> : current_display.icon}
                <span>{current_display.display_text}</span>
            </button>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDeny={() => setIsModalOpen(false)}
                onAccept={() => { current_display.action(); setIsModalOpen(false); }}
                denyText="Cancel"
                {...current_display} // Pass all other props
            />
        </>
    )
}

const fetchUsersById = async (user_id: number) => {
    const response = await api.get(`/api/user/${user_id}`);
    return response.data as RemoteUser;
}

function UserProfile() {
    const { user_id: s_user_id } = useParams<{ user_id: string }>();
    const navigate = useNavigate();
    const user_id = s_user_id ? parseInt(s_user_id, 10) : undefined;

    const { data, isLoading, isError } = useQuery<RemoteUser>({
        queryKey: ['users', user_id],
        queryFn: async ()  => fetchUsersById(user_id!),
        enabled: !!user_id,
    });

    const handleGoBack = () => {
        navigate(-1); // Go back to the previous page
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center col-span-13 h-[97svh] 
                            rounded-xl border-gray-100 border-t-2 shadow-lg shadow-gray-200
                            dark:bg-gray-900 dark:border-gray-800 dark:shadow-transparent">
                <Loader />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex flex-col items-center justify-center col-span-13 h-[97svh] 
                            rounded-xl border-gray-100 border-t-2 shadow-lg shadow-gray-200
                            dark:bg-gray-900 dark:border-gray-800 dark:shadow-transparent">
                <p className="text-red-500 dark:text-red-400 text-lg">Error fetching user profile.</p>
            </div>
        );
    }

    const ProfileStatusData = [
        {
            value: data.wins_count ?? 0, // Use real data
            icon: Trophy,
            text: 'Wins',
            bgColor: 'bg-green-100 dark:bg-green-900/40',
            className: 'w-6 h-6 text-green-500 dark:text-green-400'
        },
        {
            value: data.losses_count ?? 0, // Use real data
            icon: X,
            text: 'Losses',
            bgColor: 'bg-red-100 dark:bg-red-900/40',
            className: 'w-6 h-6 text-red-500 dark:text-red-400'
        },
        {
            value: data.rank ?? 0, // Use real data
            icon: Users,
            text: 'Rank',
            bgColor: 'bg-blue-100 dark:bg-blue-900/40',
            className: 'w-6 h-6 text-blue-500 dark:text-blue-400'
        },
        {
            value: 85, // Placeholder for Win Rate
            icon: Zap,
            bgColor: 'bg-purple-100 dark:bg-purple-900/40',
            text: 'Win Rate',
            className: 'w-6 h-6 text-purple-500 dark:text-purple-400'
        }
    ];

    return (
        <div
            className="flex flex-col items-center col-span-13
                       h-full rounded-xl border-gray-100 border-t-2 shadow-lg shadow-gray-200
                       dark:bg-gray-900 dark:border-gray-800 dark:shadow-transparent"
        >
            <div className="w-full px-4 pt-4">
                <button
                    onClick={handleGoBack}
                    className="flex items-center gap-2 px-4 py-2 text-gray-500 
                               hover:text-gray-800 
                               dark:text-gray-400 dark:hover:text-gray-200
                               transition-all duration-200 transform hover:scale-105" >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back</span>
                </button>
            </div>

            <div className="flex flex-col rounded-xl w-full max-w-4xl mx-auto mt-4" >
                <div
                    className="flex flex-col sm:flex-row w-full h-auto bg-linear-to-r from-gray-800 to-gray-600 border-t rounded-t-xl p-6 gap-6 items-center" >
                    <img
                        src={data.profile_picture}
                        alt="profile"
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-500"
                    />

                    <div className="flex flex-col w-full text-center sm:text-left">
                        <div className="w-full">
                            <h1 className="font-bold text-3xl sm:text-4xl text-white">{data.display_name}</h1>
                            <div className='flex items-center justify-center sm:justify-start gap-2 mt-1'>
                                <p className="w-3 h-3 bg-green-500 rounded-full"></p>
                                <p className="text-gray-300">Online Now</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-4">
                            <StartChat relation_status={data.relation_status} id={data.id} />
                            <PlayPingPong {...data} />
                            <FriendRequestAction {...data} />
                            <BlockAction {...data} />
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 rounded-b-xl dark:bg-gray-800 dark:border-gray-700">
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
