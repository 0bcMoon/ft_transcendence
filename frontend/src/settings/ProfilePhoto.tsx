import React from 'react';
import { User, Camera, Upload } from 'lucide-react';

interface ProfilePhotoProps {
    profileImage: string | null;
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function ProfilePhoto({ profileImage, handleImageUpload }: ProfilePhotoProps) {
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
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </label>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Profile Picture</h3>
                    <p className="text-sm text-gray-600 mb-3">Update your profile photo</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Upload new photo
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}

export default ProfilePhoto;
