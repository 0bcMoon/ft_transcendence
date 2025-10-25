import React, { useEffect } from 'react';
import { useCallback } from 'react';
import { X, User, Gamepad2, Shield, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveChatStore } from '@/state/Store';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';

interface IModal {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    userDisplayName?: string;
}

interface IActionButton {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    variant: 'primary' | 'secondary' | 'danger';
    description?: string;
}

const ActionButton: React.FC<IActionButton> = ({
    icon,
    label,
    onClick,
    variant,
}) => {
    const baseClasses = "h-13 w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left group hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variantClasses = {
        primary: "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 focus:ring-blue-500",
        secondary: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300 focus:ring-emerald-500",
        danger: "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 focus:ring-red-500"
    };

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variantClasses[variant]}`}
            type="button"
            role="menuitem"
        >
            <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg  group-hover:bg-white/90 transition-colors duration-200">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-base mb-1">{label}</div>
            </div>
            <div className="shrink-0 text-xl opacity-40 group-hover:opacity-70 transition-opacity duration-200">
                →
            </div>
        </button>
    );
};

const Modal: React.FC<IModal> = ({
    isOpen,
    onClose,
    title = "User Actions",
    userDisplayName = "User"
}) => {
    // Handle escape key press
    const navigate = useNavigate();
    const { active_chat, setActiveChat } = useActiveChatStore();

    const handleEscapeKey = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen) {
            onClose();
        }
    }, [isOpen, onClose]);

    // Handle outside click
    const handleBackdropClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }, [onClose]);

    // Set up event listeners
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscapeKey]);

    const queryClient = useQueryClient();

    const BlockAction = () => {
        const { mutate: blockAction, isPending } = useMutation({
            mutationFn: ({ action }: { action: boolean }) => api.post("/api/user/block", { user_id: active_chat?.id, action }),
            onSuccess: (_, variables) => {
                const action = variables.action; // true for block, false for unblock
                toast.success(
                    action
                        ? 'User has been blocked successfully'
                        : 'User has been unblocked successfully'
                );
                queryClient.invalidateQueries({ queryKey: ['contacts'] });
                setActiveChat(undefined);
                onClose();
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Error: Could not Do this Action ");
            }
        });

        switch (active_chat?.relation_status) {
            case 'blocking':
                return <ActionButton
                    icon={isPending ? <Loader2 className='animate-spin' size={20} /> : <Shield size={20} />}
                    label="Unblock User"
                    onClick={() => blockAction({ action: false })}
                    variant="danger"
                />
            default:
                return <ActionButton
                    icon={isPending ? <Loader2 className='animate-spin' size={20} /> : <Shield size={20} />}
                    label="Block User"
                    onClick={() => blockAction({ action: true })}
                    variant="danger"
                />
        }
    }
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
        >
            {/* Backdrop with blur effect */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            {/* Modal content */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                            {title}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Choose an action for {userDisplayName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                        onClick={() => toast.error('Feature coming soon! Not yet implemented.')}
                        variant="secondary"
                    />
                    < BlockAction />

                </div>

                {/* Footer hint */}
                <div className="px-6 pb-6">
                    <p className="text-xs text-gray-500 text-center">
                        Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Esc</kbd> or click outside to close
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Modal;

