import React, { useEffect, useState } from 'react';
// import TwoFactorModal from './TwoFactorModal';
import ProfilePhoto from './ProfilePhoto';
import PersonalInformation from './PersonalInformation';
// import EmailSettings from './EmailSettings';
import PasswordSettings from './PasswordSettings';
import updateProfile, { IFormData, profilePictureValidate } from '@/zod/zod-schema';
import { useValidationStore } from '@/state/Store';
import { useUpdateProfilePicture, useUpdateUserProfile } from '@/api/mutations';
import { useAuthStore } from '@/state/authStore';
import { Check, X } from 'lucide-react';
import EmailSettings from './EmailSettings';
import SecuritySettings from './SecuritySettings';

interface IUpdateState {
    type: 'error' | 'success';
    message: string;
}

// Converted to a 'function' component
function Settings() {

    const [updateState, setUpdateState] = useState<IUpdateState | null>(null);

    useEffect(() => {
        // Clear Zod errors when leaving the page
        return () => {
            useValidationStore.getState().clearErrors()
        }
    }, [])

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [profileImage, setProfileImage] = useState<File | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setProfileImage(file);
        }
    };

    const { mutate: updateUserProfile, isPending: isPendingUpdateUserProfile } = useUpdateUserProfile({ setUpdateState });
    const { mutate: updateProfilePicture, isPending: isPendingUpdateProfilePicture } = useUpdateProfilePicture({ setUpdateState })

    // Handles submission for personal info and password
    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const user = useAuthStore.getState().user;
        const formdata = new FormData(e.currentTarget);
        const data = Object.fromEntries(formdata.entries()) as unknown as IFormData;

        const result = updateProfile(data)
        if (!result) return;

        // --- Clean up data before sending ---
        if (user?.username == data.username) {
            delete data.username;
        }
        if (user?.display_name == data.display_name) {
            delete data.display_name;
        }
        if (data.current_password?.length === 0) {
            delete data.current_password;
            delete data.new_password;
            delete data.confirm_password;
        }
        if (!data.username && !data.display_name && !data.current_password) {
            return; // Don't submit if nothing changed
        }
        window.scrollTo(0, 0);
        updateUserProfile(data)
    }

    // Runs on form change to live-validate
    const validateForm = (e: React.FormEvent<HTMLFormElement>) => {
        const formdata = new FormData(e.currentTarget);
        const data = Object.fromEntries(formdata.entries()) as unknown as IFormData;
        updateProfile(data) // Zod validation runs
    }

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Handles submission for profile picture
    const uploadUserProfilePicture = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fromData = new FormData(e.currentTarget);
        const file = fromData.get('profile_picture') as File | null;
        if (!profilePictureValidate(file)) {
            return;
        }
        updateProfilePicture(fromData)
    }

    // --- Helper Component for Success/Error Banners ---
    // ✅ This internal component is now theme-aware
    const UpdateState = () => {
        if (!updateState) return null;

        if (updateState.type === 'success') {
            return (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3
                                dark:bg-green-900/20 dark:border-green-700">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-500" />
                    <span className="text-green-800 dark:text-green-300">{updateState.message}</span>
                </div>
            );
        }

        if (updateState.type === 'error') {
            return (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3
                                dark:bg-red-900/20 dark:border-red-700">
                    <X className="w-5 h-5 text-red-600 dark:text-red-500" />
                    <span className="text-red-800 dark:text-red-300">{updateState.message}</span>
                </div>
            );
        }
        return null;
    }

    return (
        // ✅ Main Page Background
        <div className="h-full overflow-y-auto no-scrollbar bg-gray-50 py-8 px-4
                        dark:bg-gray-900">

            <div className=" space-y-6 max-w-4xl mx-auto">
                {/* ✅ Header Text */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
                </div>

                {/* Update State Message */}
                <UpdateState />

                {/* --- Profile Picture Form --- */}
                {/* ⚠️ NOTE: <ProfilePhoto> is imported and must be styled internally */}
                <form autoComplete={"off"} onSubmit={uploadUserProfilePicture} className="space-y-6">
                    <ProfilePhoto
                        profileImage={profileImage ? URL.createObjectURL(profileImage) : null}
                        handleImageUpload={handleImageUpload}
                    />
                    <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                        <button
                            type="submit"
                            disabled={isPendingUpdateProfilePicture}
                            // ✅ Added dark:focus:ring-offset
                            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                                       flex items-center justify-center gap-2
                                       transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isPendingUpdateProfilePicture ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
                            ) : ('Upload Profile Picture')}
                        </button>
                    </div>
                </form>

                {/* --- Main Profile Form --- */}
                {/* ⚠️ NOTE: <PersonalInformation> & <PasswordSettings> are imported and must be styled internally */}
                <form onChange={validateForm} autoComplete="new-password" onSubmit={submitForm} className="space-y-6">
                    <PersonalInformation />
                    <PasswordSettings
                        showPasswords={showPasswords}
                        togglePasswordVisibility={togglePasswordVisibility}
                    />
                    <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                        <button
                            type="submit"
                            disabled={isPendingUpdateUserProfile}
                            // ✅ Added dark:focus:ring-offset
                            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                                       flex items-center justify-center gap-2
                                       transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isPendingUpdateUserProfile ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
                            ) : ('Save Changes')}
                        </button>
                    </div>
                </form>

                {/* --- Other Settings --- */}
                {/* ⚠️ NOTE: These imported components must also be styled internally */}
                <EmailSettings />
                <SecuritySettings />
                {/* <TwoFactorModal /> */}
            </div>
        </div>
    );
}

export default Settings;
