import React, { useEffect, useState } from 'react';
// import TwoFactorModal from './TwoFactorModal';
import ProfilePhoto from './ProfilePhoto';
import PersonalInformation from './PersonalInformation';
// import EmailSettings from './EmailSettings';
import PasswordSettings from './PasswordSettings';
import updateProfile, { IFormData, profilePictureValidate } from '@/zod/zod-schema';
import { useValidationStore } from '@/state/Store';
import { useUpdateProfilePicture, useUpdateUserProfile } from '@/api/mutations';
// import SecuritySettings from './SecuritySettings';

function Settings() {


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


    const { mutate: updateUserProfile, isPending: isPendingUpdateUserProfile } = useUpdateUserProfile();
    const { mutate: updateProfilePicture, isPending: isPendingUpdateProfilePicture } = useUpdateProfilePicture()
    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formdata = new FormData(e.currentTarget);
        const data = Object.fromEntries(formdata.entries()) as unknown as IFormData;

        const result = updateProfile(data)
        if (!result) {
            return;
        }
        updateUserProfile(data)
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

                {/* Success Message */}
                {/* {successMessage && ( */}
                {/*     <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"> */}
                {/*         <Check className="w-5 h-5 text-green-600" /> */}
                {/*         <span className="text-green-800">{successMessage}</span> */}
                {/*     </div> */}
                {/* )} */}

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

                <form autoComplete="new-password" onSubmit={submitForm} className="space-y-6">

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
