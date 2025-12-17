import { MessageCircle, Gamepad2, UserPlus, UserMinus, Shield, ShieldOff, Star, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/component/Model';
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

const buttonClasses =
    "inline-flex items-center justify-center gap-2.5 font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-sm hover:shadow-md"

interface ProfileActionsProps {
    user: RemoteUser
}

function StartChatButton({ relationStatus, id }: { relationStatus: string; id: number }) {
    const navigate = useNavigate()
    const setActiveChat = useActiveChatStore((state) => state.setActiveChat)

    const { mutate, isPending } = useStartChat()

    const handleStartChat = () => {
        mutate(
            { userId: id },
            {
                onSuccess: (data) => {
                    setActiveChat(data)
                    navigate("/chat")
                },
            },
        )
    }

    if (relationStatus === "blocking" || relationStatus === "blocked_by") return null

    return (
        <button
            className={`${buttonClasses} bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:ring-blue-500`}
            onClick={handleStartChat}
            disabled={isPending}
        >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
            <span>Message</span>
        </button>
    )
}

function ChallengeButton({ relationStatus }: { relationStatus: string }) {
    if (relationStatus === "blocking" || relationStatus === "blocked_by") return null

    return (
        <button
            className={`${buttonClasses} bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:from-green-800 active:to-emerald-800 text-white focus:ring-green-500`}
            onClick={() => toast("🎮 Feature coming soon!")}
        >
            <Gamepad2 className="w-5 h-5" />
            <span>Challenge</span>
        </button>
    )
}

function BlockButton({ id, relationStatus }: { id: number; relationStatus: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { mutate: blockAction, isPending } = useBlockUser()
    const isBlocking = relationStatus === "blocking"

    const handleAction = () => {
        blockAction({ userId: id, action: !isBlocking })
        setIsModalOpen(false)
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`${buttonClasses} ${isBlocking
                    ? "bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white focus:ring-gray-500"
                    : "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500"
                    }`}
                disabled={isPending}
            >
                {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isBlocking ? (
                    <ShieldOff className="w-5 h-5" />
                ) : (
                    <Shield className="w-5 h-5" />
                )}
                <span>{isBlocking ? "Unblock" : "Block"}</span>
            </button>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDeny={() => setIsModalOpen(false)}
                onAccept={handleAction}
                denyText="Cancel"
                title={isBlocking ? "Confirm Unblock" : "Confirm Block"}
                message={
                    isBlocking ? "Are you sure you want to unblock this user?" : "Are you sure you want to block this user?"
                }
                type={isBlocking ? "warning" : "danger"}
                acceptText={isBlocking ? "Unblock" : "Block"}
            />
        </>
    )
}

function FriendRequestResponseButton({ reqId, id }: { reqId?: number; id: number }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { isPending: isPendingAccept, mutate: acceptRequest } = useAcceptRequest()
    const { isPending: isPendingDeny, mutate: denyRequest } = useDenyRequest()
    const isPending = isPendingAccept || isPendingDeny

    const handleAccept = () => {
        if (reqId) {
            acceptRequest({ req_id: reqId, userId: id })
            setIsModalOpen(false)
        }
    }

    const handleDeny = () => {
        if (reqId) {
            denyRequest({ req_id: reqId, userId: id })
            setIsModalOpen(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`${buttonClasses} bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white focus:ring-blue-500`}
                disabled={isPending}
            >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
                <span>Respond to Request</span>
            </button>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAccept={handleAccept}
                onDeny={handleDeny}
                denyText="Deny"
                title="Friend Request"
                message="This user has sent you a friend request."
                acceptText="Accept"
                type="default"
            />
        </>
    )
}

function FriendActionButton({ reqId, relationStatus, id }: { reqId?: number; relationStatus: string; id: number }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { mutate: cancelRequest, isPending: isCanceling } = useCancelRequest()
    const { mutate: sendRequest, isPending: isSending } = useSendRequest()
    const { mutate: unfriend, isPending: isUnfriending } = useUnFriend()

    const isPending = isCanceling || isSending || isUnfriending

    const configs: Record<
        string,
        {
            text: string
            icon: typeof UserPlus
            action: () => void
            modal: { title: string; message: string; acceptText: string; type: "danger" | "warning" | "default" }
            className: string
        }
    > = {
        friend: {
            text: "Unfriend",
            icon: UserMinus,
            action: () => {
                unfriend({ user_id: id })
                setIsModalOpen(false)
            },
            modal: {
                title: "Confirm Unfriend",
                message: "Are you sure you want to unfriend this user?",
                acceptText: "Unfriend",
                type: "danger",
            },
            className: `${buttonClasses} bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white focus:ring-gray-500`,
        },
        pending: {
            text: "Cancel Request",
            icon: X,
            action: () => {
                if (reqId) {
                    cancelRequest({ req_id: reqId })
                    setIsModalOpen(false)
                }
            },
            modal: {
                title: "Cancel Friend Request",
                message: "Do you want to cancel your friend request?",
                acceptText: "Cancel Request",
                type: "warning",
            },
            className: `${buttonClasses} bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white focus:ring-gray-500`,
        },
        none: {
            text: "Add Friend",
            icon: UserPlus,
            action: () => {
                sendRequest({ user_id: id })
                setIsModalOpen(false)
            },
            modal: {
                title: "Send Friend Request",
                message: "Send a friend request to this user?",
                acceptText: "Send Request",
                type: "default",
            },
            className: `${buttonClasses} bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white focus:ring-blue-500`,
        },
    }

    const config = configs[relationStatus]
    if (!config) return null

    const IconComponent = config.icon

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className={config.className} disabled={isPending}>
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <IconComponent className="w-5 h-5" />}
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
    )
}

export function ProfileActions({ user }: ProfileActionsProps) {
    const renderFriendAction = () => {
        switch (user.relation_status) {
            case "friend":
            case "pending":
            case "none":
                return <FriendActionButton reqId={user.req_id} relationStatus={user.relation_status} id={user.id} />
            case "waiting":
                return <FriendRequestResponseButton reqId={user.req_id} id={user.id} />
            default:
                return null
        }
    }

    return (
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-6">
            <StartChatButton relationStatus={user.relation_status} id={user.id} />
            <ChallengeButton relationStatus={user.relation_status} />
            {renderFriendAction()}
            <BlockButton id={user.id} relationStatus={user.relation_status} />
        </div>
    )
}

