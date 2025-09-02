import React from 'react';
import { X, Shield, MessageSquare, Phone, Video, Mail } from 'lucide-react';
import { User } from './types';

interface ProfileModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onBlockUser: (userId: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
    user,
    isOpen,
    onClose,
    onBlockUser,
}) => {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Profile Content */}
                    <div className="p-6">
                        {/* Avatar and Basic Info */}
                        <div className="text-center mb-6">
                            <div className="relative inline-block">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-24 h-24 rounded-full object-cover mx-auto shadow-lg"
                                />
                                <div
                                    className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                                        }`}
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mt-4">{user.name}</h3>
                            <p className="text-gray-600 mt-1">
                                {user.isOnline ? 'Active now' : `Last seen ${user.lastSeen}`}
                            </p>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center text-gray-700">
                                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                <span className="text-sm">john.doe@example.com</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                                <span className="text-sm">+1 (555) 123-4567</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200">
                                    <MessageSquare className="w-6 h-6 text-blue-600 mb-2" />
                                    <span className="text-xs font-medium text-blue-600">Message</span>
                                </button>
                                <button className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors duration-200">
                                    <Phone className="w-6 h-6 text-green-600 mb-2" />
                                    <span className="text-xs font-medium text-green-600">Call</span>
                                </button>
                                <button className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors duration-200">
                                    <Video className="w-6 h-6 text-purple-600 mb-2" />
                                    <span className="text-xs font-medium text-purple-600">Video</span>
                                </button>
                            </div>

                            {/* Block/Unblock Button */}
                            <button
                                onClick={() => {
                                    onBlockUser(user.id);
                                    onClose();
                                }}
                                className={`w-full flex items-center justify-center p-3 rounded-xl transition-colors duration-200 ${user.isBlocked
                                        ? 'bg-green-50 hover:bg-green-100 text-green-700'
                                        : 'bg-red-50 hover:bg-red-100 text-red-700'
                                    }`}
                            >
                                <Shield className="w-5 h-5 mr-2" />
                                <span className="font-medium">
                                    {user.isBlocked ? 'Unblock User' : 'Block User'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
