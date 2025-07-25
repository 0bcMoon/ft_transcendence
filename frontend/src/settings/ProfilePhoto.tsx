import { useValidationStore } from '@/state/Store';
import React from 'react';
import { User, Upload } from 'lucide-react';

interface ProfilePhotoProps {
    profileImage: string | null;
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function ProfilePhoto({ profileImage, handleImageUpload }: ProfilePhotoProps) {
    const { profile_picture } = useValidationStore();
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 text-gray-400" />
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Profile Picture</h3>
                    <p className="text-sm text-gray-600 mb-3">Update your profile photo</p>
                    <label className="inline-flex items-center
                                    gap-2 px-4 py-2 text-sm font-medium 
                                    text-blue-600 bg-blue-50 rounded-lg
                                    hover:bg-blue-100 transition-colors cursor-pointer"
                        htmlFor="profile_picture"
                    >
                        <Upload className="w-4 h-4" />
                        Upload new photo
                        <input
                            name="profile_picture"
                            id="profile_picture"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </label>
                    {profile_picture && <p className="text-sm text-red-500 mt-2">{profile_picture}</p>}
                </div>
            </div>
        </div>
    );
}

export default ProfilePhoto;
