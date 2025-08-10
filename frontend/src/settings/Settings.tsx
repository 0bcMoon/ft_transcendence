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
// import SecuritySettings from './SecuritySettings';

interface IUpdateState {
    type: 'error' | 'success';
    message: string;
}
function Settings() {

    const [updateState, setUpdateState] = useState<IUpdateState | null>(null);

    useEffect(() => {
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
    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const user = useAuthStore.getState().user;

        const formdata = new FormData(e.currentTarget);
        const data = Object.fromEntries(formdata.entries()) as unknown as IFormData;

        const result = updateProfile(data)
        if (!result) {
            return;
        }


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
            return;
        }

        updateUserProfile(data)
    }

    const validateForm = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();

        const formdata = new FormData(e.currentTarget);
        const data = Object.fromEntries(formdata.entries()) as unknown as IFormData;

        const result = updateProfile(data)
        if (!result) {
            return;
        }
    }


    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const uploadUserProfilePicture = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();


        const fromData = new FormData(e.currentTarget);
        const file = fromData.get('profile_picture') as File | null;
        if (!profilePictureValidate(file)) {
            return;
        }

        updateProfilePicture(fromData)
    }
    const UpdateState = () => {

        if (!updateState) return null;

        switch (updateState.type) {
            case 'success':
                return (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-green-800">{updateState.message}</span>
                    </div>
                );
            case 'error':
                return (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <X className="w-5 h-5 text-red-600" />
                        <span className="text-red-800">{updateState.message}</span>
                    </div>
                );
            default:
                return null;
        }
        {/* Error Message */ }
        // {
        //     error && (
        //         <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        //             <X className="w-5 h-5 text-red-600" />
        //             <span className="text-red-800">{error}</span>
        //         </div>
        //     )
        // }
    }

    return (
        <div className="col-span-13 h-[97svh] overflow-y-auto no-scrollbar
                        rounded-xl 
                        border-gray-100 border-2 shadow-lg shadow-gray-200 bg-gray-50 py-8 px-4">

            <div className=" space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                    <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                {/* Update State Message */}
                <UpdateState />

                {/* Profile Picture Upload */}

                <form autoComplete="off" onSubmit={uploadUserProfilePicture} className="space-y-6 mb-8">

                    <ProfilePhoto
                        profileImage={profileImage ? URL.createObjectURL(profileImage) : null}
                        handleImageUpload={handleImageUpload}
                    />

                    <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                        <button
                            type="submit"
                            disabled={isPendingUpdateProfilePicture}
                            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2
                                        focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2
                                        transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed '
                        >
                            {isPendingUpdateProfilePicture ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                'Upload Profile Picture'
                            )}
                        </button>
                    </div>
                </form>

                <form onChange={validateForm} autoComplete="new-password" onSubmit={submitForm} className="space-y-6">


                    <PersonalInformation />

                    <PasswordSettings
                        showPasswords={showPasswords}
                        togglePasswordVisibility={togglePasswordVisibility}
                    />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                        <button
                            type="submit"
                            disabled={isPendingUpdateUserProfile}
                            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2
                                        focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2
                                        transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed '
                        >
                            {isPendingUpdateUserProfile ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>


                {/* <EmailSettings */}
                {/*     emailData={emailData} */}
                {/*     handleEmailChange={handleEmailChange} */}
                {/*     errors={errors} */}
                {/*     emailConfirmationSent={emailConfirmationSent} */}
                {/*     handleSendEmailConfirmation={handleSendEmailConfirmation} */}
                {/*     handleConfirmEmailChange={handleConfirmEmailChange} */}
                {/*     isEmailLoading={isEmailLoading} */}
                {/*     setEmailConfirmationSent={setEmailConfirmationSent} */}
                {/*     setEmailData={setEmailData} */}
                {/* /> */}
                {/**/}
                {/* <SecuritySettings */}
                {/*     twoFactor={twoFactor} */}
                {/*     setShow2FAModal={setShow2FAModal} */}
                {/* /> */}
                {/**/}
                {/* Two-Factor Authentication Modal */}
                {/* <TwoFactorModal */}
                {/*     isOpen={show2FAModal} */}
                {/*     onClose={handleClose2FAModal} */}
                {/*     twoFactor={twoFactor} */}
                {/*     setTwoFactor={setTwoFactor} */}
                {/*     isLoading={isLoading} */}
                {/*     onEnable2FA={handleEnable2FA} */}
                {/*     onDisable2FA={handleDisable2FA} */}
                {/*     onVerify2FA={handleVerify2FA} */}
                {/*     onCopyToClipboard={copyToClipboard} */}
                {/*     onDownloadBackupCodes={downloadBackupCodes} */}
                {/*     errors={errors} */}
                {/* /> */}
            </div>
        </div>
    );
}

export default Settings;
