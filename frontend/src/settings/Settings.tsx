import React, { useState } from 'react';
import SettingsHeader from './SettingsHeader';
import SuccessMessage from './SuccessMessage';
import ProfilePicture from './ProfilePicture';
import PersonalInformation from './PersonalInformation';
import ChangePassword from './ChangePassword';
import ActionButtons from './ActionButtons';

export interface FormData {
    displayName: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ValidationErrors {
    displayName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

function Settings() {
    const [formData, setFormData] = useState<FormData>({
        displayName: 'John Doe',
        email: 'john.doe@example.com',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');


    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
        // if (!validateForm()) return;

        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setSuccessMessage('Settings updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleCancel = () => {
        // Optional: Add logic to reset form or navigate away
        console.log("Cancel button clicked");
    };

    return (
        <div className="col-span-13 min-h-screen bg-gray-50 py-6 px-3">
            <div className="max-w-4xl mx-auto">
                <SettingsHeader />
                <SuccessMessage message={successMessage} />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <ProfilePicture profileImage={profileImage} handleImageUpload={handleImageUpload} />
                    <PersonalInformation formData={formData} errors={errors} handleInputChange={handleInputChange} />
                    <ChangePassword
                        formData={formData}
                        errors={errors}
                        showPasswords={showPasswords}
                        handleInputChange={handleInputChange}
                        togglePasswordVisibility={togglePasswordVisibility}
                    />
                    <ActionButtons isLoading={isLoading} onCancel={handleCancel} />
                </form>
            </div>
        </div>
    );
}

export default Settings;
