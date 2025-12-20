import type React from "react"

import { useEffect, useCallback } from "react"
import { X, User, Gamepad2, Shield, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useActiveChatStore } from "@/state/Store"
import toast from "react-hot-toast"
import { useBlockUser } from "../hooks/query"

interface IModal {
    isOpen: boolean
    onClose: () => void
    title?: string
    userDisplayName?: string
}

interface IActionButton {
    icon: React.ReactNode
    label: string
    onClick?: () => void
    variant: "primary" | "secondary" | "danger"
    description?: string
}

function ActionButton({ icon, label, onClick, variant }: IActionButton) {
    const baseClasses =
        "h-13 w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left group hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900"

    const variantClasses = {
        primary:
            "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 focus:ring-blue-500",
        secondary:
            "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 focus:ring-emerald-500",
        danger:
            "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 focus:ring-red-500",
    }

    return (
        <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]}`} type="button" role="menuitem">
            <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg group-hover:bg-white/10 transition-colors duration-200">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-base">{label}</div>
            </div>
            <div className="shrink-0 text-xl opacity-40 group-hover:opacity-70 transition-opacity duration-200">→</div>
        </button>
    )
}

function Modal({ isOpen, onClose, title = "User Actions", userDisplayName = "User" }: IModal) {
    const navigate = useNavigate()
    const { active_chat, setActiveChat } = useActiveChatStore()

    const handleEscapeKey = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape" && isOpen) {
                onClose()
            }
        },
        [isOpen, onClose],
    )

    const handleBackdropClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            if (event.target === event.currentTarget) {
                onClose()
            }
        },
        [onClose],
    )

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleEscapeKey)
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }

        return () => {
            document.removeEventListener("keydown", handleEscapeKey)
            document.body.style.overflow = ""
        }
    }, [isOpen, handleEscapeKey])

    function BlockAction() {
        const { mutate: blockAction, isPending } = useBlockUser()

        const handleBlockAction = (action: boolean) => {
            if (!active_chat?.id) return

            blockAction(
                { userId: active_chat.id, action },
                {
                    onSuccess: () => {
                        toast.success(action ? "User has been blocked successfully" : "User has been unblocked successfully")
                        setActiveChat(undefined)
                        onClose()
                    },
                    onError: (error: any) => {
                        toast.error(error.response?.data?.message || "Error: Could not do this action")
                    },
                },
            )
        }

        switch (active_chat?.relation_status) {
            case "blocking":
                return (
                    <ActionButton
                        icon={isPending ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />}
                        label="Unblock User"
                        onClick={() => handleBlockAction(false)}
                        variant="danger"
                    />
                )
            default:
                return (
                    <ActionButton
                        icon={isPending ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />}
                        label="Block User"
                        onClick={() => handleBlockAction(true)}
                        variant="danger"
                    />
                )
        }
    }

    if (!isOpen) {
        return null
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-labelledby="modal-title"
        >
            {/* Backdrop with blur effect */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            {/* Modal content */}
            <div className="relative w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 border border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div>
                        <h2 id="modal-title" className="text-xl font-bold text-white">
                            {title}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Choose an action for {userDisplayName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        type="button"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Action options */}
                <div className="p-6 space-y-3" role="menu">
                    <ActionButton
                        icon={<User size={20} />}
                        label="Go to Profile"
                        description="View profile details and information"
                        onClick={() => navigate(`/users/${active_chat?.id}`)}
                        variant="primary"
                    />

                    <ActionButton
                        icon={<Gamepad2 size={20} />}
                        label="Play a Ping Pong Match"
                        description="Start a new game challenge"
                        onClick={() => toast.error("Feature coming soon! Not yet implemented.")}
                        variant="secondary"
                    />

                    <BlockAction />
                </div>
            </div>
        </div>
    )
}

export default Modal

