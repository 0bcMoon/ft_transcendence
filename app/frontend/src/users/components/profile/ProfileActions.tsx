import { MessageCircle, UserPlus, UserMinus, Shield, ShieldOff, UserCheck, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveChatStore } from '@/state/Store';
import { RemoteUser } from '@/types/types';
import {
    useAcceptRequest,
    useBlockUser,
    useCancelRequest,
    useDenyRequest,
    useSendRequest,
    useUnFriend,
    useStartChat,
} from '@/users/hooks/useApi';

interface ProfileActionsProps {
    user: RemoteUser;
    onClose: () => void;
}

export function ProfileActions({ user, onClose }: ProfileActionsProps) {
    const navigate = useNavigate();
    const setActiveChat = useActiveChatStore((state) => state.setActiveChat);

    const { mutate: startChat, isPending: isStartingChat } = useStartChat();
    const { mutate: sendRequest, isPending: isSendingRequest } = useSendRequest();
    const { mutate: cancelRequest, isPending: isCancelingRequest } = useCancelRequest();
    const { mutate: acceptRequest, isPending: isAcceptingRequest } = useAcceptRequest();
    const { mutate: denyRequest, isPending: isDenyingRequest } = useDenyRequest();
    const { mutate: unfriend, isPending: isUnfriending } = useUnFriend();
    const { mutate: blockUser, isPending: isBlocking } = useBlockUser();

    const isBlocked = user.relation_status === 'blocking';
    const isBlockedBy = user.relation_status === 'blocked_by';

    const handleStartChat = () => {
        startChat({ userId: user.id }, {
            onSuccess: (data) => {
                setActiveChat(data);
                navigate('/chat');
                onClose();
            },
        });
    };

    const handleAction = (action: () => void) => {
        action();
        onClose();
    };

    const actions = [];

    if (!isBlocked && !isBlockedBy) {
        actions.push({
            icon: MessageCircle,
            label: 'Message',
            onClick: handleStartChat,
            isPending: isStartingChat,
            color: 'text-blue-400',
        });
    }

   
    if (user.relation_status === 'none') {
        actions.push({
            icon: UserPlus,
            label: 'Add Friend',
            onClick: () => handleAction(() => sendRequest({ user_id: user.id })),
            isPending: isSendingRequest,
            color: 'text-blue-400',
        });
    }
    else if (user.relation_status === 'pending') {
        actions.push({
            icon: X,
            label: 'Cancel Request',
            onClick: () => handleAction(() => user.req_id && cancelRequest({ req_id: user.req_id })),
            isPending: isCancelingRequest,
            color: 'text-slate-400',
        });
    } 
    else if (user.relation_status === 'waiting') {
        actions.push(
            {
                icon: UserCheck,
                label: 'Accept Request',
                onClick: () => handleAction(() => user.req_id && acceptRequest({ req_id: user.req_id, userId: user.id })),
                isPending: isAcceptingRequest,
                color: 'text-green-400',
            },
            {
                icon: X,
                label: 'Deny Request',
                onClick: () => handleAction(() => user.req_id && denyRequest({ req_id: user.req_id, userId: user.id })),
                isPending: isDenyingRequest,
                color: 'text-red-400',
            }
        );
    } 
    else if (user.relation_status === 'friend') {
        actions.push({
            icon: UserMinus,
            label: 'Unfriend',
            onClick: () => handleAction(() => unfriend({ user_id: user.id })),
            isPending: isUnfriending,
            color: 'text-red-400',
        });
    }

    actions.push({
        icon: isBlocked ? ShieldOff : Shield,
        label: isBlocked ? 'Unblock' : 'Block',
        onClick: () => handleAction(() => blockUser({ userId: user.id, action: !isBlocked })),
        isPending: isBlocking,
        color: isBlocked ? 'text-yellow-400' : 'text-red-400',
    });

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />

            <div className="absolute top-16 right-6 z-50 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl min-w-[200px] overflow-hidden">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={index}
                            onClick={action.onClick}
                            disabled={action.isPending}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {action.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                            ) : (
                                <Icon className={`w-5 h-5 ${action.color}`} />
                            )}
                            <span className="text-white font-medium">{action.label}</span>
                        </button>
                    );
                })}
            </div>
        </>
    );
}
