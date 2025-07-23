import React, { useState } from 'react';
import { Check } from 'lucide-react';
import TwoFactorModal from './TwoFactorModal';
import ProfilePhoto from './ProfilePhoto';
import PersonalInformation from './PersonalInformation';
import EmailSettings from './EmailSettings';
import PasswordSettings from './PasswordSettings';
import SecuritySettings from './SecuritySettings';
import { FormData, EmailData, TwoFactorState, ValidationErrors } from './types';

function Settings() {
    const [formData, setFormData] = useState<FormData>({
        displayName: 'John Doe',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [emailData, setEmailData] = useState<EmailData>({
        email: 'john.doe@example.com',
        confirmationCode: ''
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [twoFactor, setTwoFactor] = useState<TwoFactorState>({
        isEnabled: false,
        isSetupMode: false,
        qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjczODAiPlFSIENvZGU8L3RleHQ+PC9zdmc+',
        backupCodes: [
            'ABC123DEF456',
            'GHI789JKL012',
            'MNO345PQR678',
            'STU901VWX234',
            'YZA567BCD890',
            'EFG123HIJ456',
            'KLM789NOP012',
            'QRS345TUV678'
        ],
        verificationCode: ''
    });

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!formData.displayName.trim()) {
            newErrors.displayName = 'Display name is required';
        }

        if (formData.newPassword) {
            if (!formData.currentPassword) {
                newErrors.currentPassword = 'Current password is required to change password';
            }
            if (formData.newPassword.length < 8) {
                newErrors.newPassword = 'Password must be at least 8 characters';
            }
            if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateEmail = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!emailData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(emailData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (emailConfirmationSent && !emailData.confirmationCode) {
            newErrors.confirmationCode = 'Confirmation code is required';
        } else if (emailConfirmationSent && emailData.confirmationCode.length !== 6) {
            newErrors.confirmationCode = 'Confirmation code must be 6 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validate2FA = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (twoFactor.isSetupMode && !twoFactor.verificationCode) {
            newErrors.verificationCode = 'Verification code is required';
        } else if (twoFactor.isSetupMode && twoFactor.verificationCode.length !== 6) {
            newErrors.verificationCode = 'Verification code must be 6 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleEmailChange = (field: keyof EmailData, value: string) => {
        setEmailData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setSuccessMessage('Settings updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleSendEmailConfirmation = async () => {
        if (!validateEmail()) return;

        setIsEmailLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsEmailLoading(false);
        setEmailConfirmationSent(true);
        setSuccessMessage('Confirmation code sent to your email!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleConfirmEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail()) return;

        setIsEmailLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsEmailLoading(false);
        setEmailConfirmationSent(false);
        setEmailData(prev => ({ ...prev, confirmationCode: '' }));
        setSuccessMessage('Email updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleEnable2FA = () => {
        setTwoFactor(prev => ({ ...prev, isSetupMode: true }));
    };

    const handleDisable2FA = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTwoFactor(prev => ({
            ...prev,
            isEnabled: false,
            isSetupMode: false,
            verificationCode: ''
        }));
        setIsLoading(false);
        setSuccessMessage('Two-factor authentication disabled successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleVerify2FA = async () => {
        if (!validate2FA()) return;

        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setTwoFactor(prev => ({
            ...prev,
            isEnabled: true,
            isSetupMode: false,
            verificationCode: ''
        }));
        setIsLoading(false);
        setSuccessMessage('Two-factor authentication enabled successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleClose2FAModal = () => {
        setShow2FAModal(false);
        setTwoFactor(prev => ({ ...prev, isSetupMode: false, verificationCode: '' }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setSuccessMessage('Copied to clipboard!');
        setTimeout(() => setSuccessMessage(''), 2000);
    };

    const downloadBackupCodes = () => {
        const content = twoFactor.backupCodes.join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backup-codes.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="col-span-13 h-[97svh] overflow-y-auto no-scrollbar
                        rounded-xl 
                        border-gray-100 border-2 shadow-lg shadow-gray-200 bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                    <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-green-800">{successMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <ProfilePhoto profileImage={profileImage} handleImageUpload={handleImageUpload} />
                    <PersonalInformation formData={formData} handleInputChange={handleInputChange} errors={errors} />
                    <EmailSettings
                        emailData={emailData}
                        handleEmailChange={handleEmailChange}
                        errors={errors}
                        emailConfirmationSent={emailConfirmationSent}
                        handleSendEmailConfirmation={handleSendEmailConfirmation}
                        handleConfirmEmailChange={handleConfirmEmailChange}
                        isEmailLoading={isEmailLoading}
                        setEmailConfirmationSent={setEmailConfirmationSent}
                        setEmailData={setEmailData}
                    />
                    <PasswordSettings formData={formData} handleInputChange={handleInputChange} errors={errors} showPasswords={showPasswords} togglePasswordVisibility={togglePasswordVisibility} />
                    <SecuritySettings twoFactor={twoFactor} setShow2FAModal={setShow2FAModal} />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
                        <button
                            type="button"
                            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${emailConfirmationSent ? 'hidden' : ''
                                }`}
                        >
                            {isLoading ? (
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

                {/* Two-Factor Authentication Modal */}
                <TwoFactorModal
                    isOpen={show2FAModal}
                    onClose={handleClose2FAModal}
                    twoFactor={twoFactor}
                    setTwoFactor={setTwoFactor}
                    isLoading={isLoading}
                    onEnable2FA={handleEnable2FA}
                    onDisable2FA={handleDisable2FA}
                    onVerify2FA={handleVerify2FA}
                    onCopyToClipboard={copyToClipboard}
                    onDownloadBackupCodes={downloadBackupCodes}
                    errors={errors}
                />
            </div>
        </div>
    );
}

export default Settings;
