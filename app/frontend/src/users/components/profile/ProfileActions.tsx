import { MessageCircle, Gamepad2, UserPlus, UserMinus, Shield, ShieldOff, Star, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/api/api';
import Modal from '@/component/Model';
import { useActiveChatStore } from '@/state/Store';
import { RemoteUser } from '@/types/types';
import {
    useAcceptRequest,
    useBlockUser,
    useCancelRequest,
    useDenyRequest,
    useSendRequest,
    useUnFriend
} from '@/api/mutations';

const buttonClasses = "inline-flex items-center justify-center gap-2.5 font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-sm hover:shadow-md";

interface ProfileActionsProps {
    user: RemoteUser;
}

function StartChatButton({ relation_status, id }: { relation_status: string, id: number }) {
    const navigate = useNavigate();
    const setActiveChat = useActiveChatStore(state => state.setActiveChat);

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const response = await api.get('/api/chat/contact', { params: { id } });
            return response.data;
        },
        onSuccess: (data: RemoteUser) => {
            setActiveChat(data);
            navigate("/chat");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Could not start chat");
        }
    });

    if (relation_status === 'blocking' || relation_status === 'block_by') return null;

    return (
        <button
            className={`${buttonClasses} bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:ring-blue-500`}
            onClick={() => mutate()}
            disabled={isPending} >
            {isPending ? <Loader2 className='w-5 h-5 animate-spin' /> : <MessageCircle className='w-5 h-5' />}
            <span>Message</span>
        </button>
    );
}

function ChallengeButton({ relation_status }: { relation_status: string }) {
    if (relation_status === 'blocking' || relation_status === 'blocked_by') return null;

    return (
        <button
            className={`${buttonClasses} bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:from-green-800 active:to-emerald-800 text-white focus:ring-green-500`}
            onClick={() => toast('Feature coming soon! ', { icon: '🎮' })} >
            <Gamepad2 className='w-5 h-5' />
            <span>Challenge</span>
        </button>
    );
}

function BlockButton({ id, relation_status }: { id: number, relation_status: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { mutate: blockAction, isPending } = useBlockUser();
    const isBlocking = relation_status === 'blocking';

    const handleAction = () => {
        blockAction({ action: !isBlocking, user_id: id });
        setIsModalOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`${buttonClasses} ${isBlocking
                    ? 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white focus:ring-gray-500'
                    : 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500'
                    }`}
                disabled={isPending} >
                {isPending ? <Loader2 className='w-5 h-5 animate-spin' /> : isBlocking ? <ShieldOff className='w-5 h-5' /> : <Shield className='w-5 h-5' />}
                <span>{isBlocking ? 'Unblock' : 'Block'}</span>
            </button>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDeny={() => setIsModalOpen(false)}
                onAccept={handleAction}
                denyText="Cancel"
                title={isBlocking ? "Confirm Unblock" : "Confirm Block"}
                message={isBlocking ? "Are you sure you want to unblock this user?" : "Are you sure you want to block this user?"}
                type={isBlocking ? 'warning' : 'danger'}
                acceptText={isBlocking ? "Unblock" : "Block"}
            />
        </>
    );
}

function FriendRequestResponseButton({ req_id, id }: { req_id?: number, id: number }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isPending: isPendingAccept, mutate: acceptRequest } = useAcceptRequest();
    const { isPending: isPendingDeny, mutate: denyRequest } = useDenyRequest();
    const isPending = isPendingAccept || isPendingDeny;

    const handleAccept = () => {
        if (req_id) {
            acceptRequest({ req_id, user_id: id });
            setIsModalOpen(false);
        }
    };

    const handleDeny = () => {
        if (req_id) {
            denyRequest({ req_id, user_id: id });
            setIsModalOpen(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`${buttonClasses} bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white focus:ring-blue-500`}
                disabled={isPending} >
                {isPending ? <Loader2 className='w-5 h-5 animate-spin' /> : <Star className='w-5 h-5' />}
                <span>Respond to Request</span>
            </button>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAccept={handleAccept}
                onDeny={handleDeny}
                title="Friend Request"
                message="This user has sent you a friend request."
                acceptText="Accept"
                denyText="Deny"
                type="default"
            />
        </>
    );
}

function FriendActionButton({ req_id, relation_status, id }: { req_id?: number, relation_status: string, id: number }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { mutate: cancelRequest, isPending: isCanceling } = useCancelRequest();
    const { mutate: sendRequest, isPending: isSending } = useSendRequest();
    const { mutate: unfriend, isPending: isUnfriending } = useUnFriend();

    const isPending = isCanceling || isSending || isUnfriending;
    const status = relation_status || 'none';

    const configs: Record<string, any> = {
        'friend': {
            text: 'Unfriend',
            icon: UserMinus,
            action: () => { unfriend({ user_id: id }); setIsModalOpen(false); },
            modal: { title: "Confirm Unfriend", message: "Are you sure you want to unfriend this user? ", acceptText: "Unfriend", type: 'danger' as const },
            className: `${buttonClasses} bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white focus: ring-gray-500`
        },
        'pending': {
            text: 'Cancel Request',
            icon: X,
            action: () => { if (req_id) { cancelRequest({ req_id, user_id: id }); setIsModalOpen(false); } },
            modal: { title: "Cancel Friend Request", message: "Do you want to cancel your friend request?", acceptText: "Cancel Request", type: 'warning' as const },
            className: `${buttonClasses} bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white focus:ring-gray-500`
        },
        'none': {
            text: 'Add Friend',
            icon: UserPlus,
            action: () => { sendRequest({ user_id: id }); setIsModalOpen(false); },
            modal: { title: "Send Friend Request", message: "Send a friend request to this user?", acceptText: "Send Request", type: 'info' as const },
            className: `${buttonClasses} bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white focus:ring-blue-500`
        }
    };

    const config = configs[status];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={config.className}
                disabled={isPending} >
                {isPending ? <Loader2 className='w-5 h-5 animate-spin' /> : <IconComponent className='w-5 h-5' />}
                <span>{config.text}</span>
            </button>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDeny={() => setIsModalOpen(false)}
                onAccept={config.action}
                denyText="Cancel"
                title={config.modal.title}
                message={config.modal.message}
                type={config.modal.type}
                acceptText={config.modal.acceptText}
            />
        </>
    );
}

export function ProfileActions({ user }: ProfileActionsProps) {
    const renderFriendAction = () => {
        switch (user.relation_status) {
            case 'friend':
            case 'pending':
            case 'none':
                return <FriendActionButton req_id={user.req_id} relation_status={user.relation_status} id={user.id} />;
            case 'waiting':
                return <FriendRequestResponseButton req_id={user.req_id} id={user.id} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-6">
            <StartChatButton relation_status={user.relation_status} id={user.id} />
            <ChallengeButton relation_status={user.relation_status} />
            {renderFriendAction()}
            <BlockButton id={user.id} relation_status={user.relation_status} />
        </div>
    );
}
