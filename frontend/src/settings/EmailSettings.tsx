import React from 'react';
import { Mail } from 'lucide-react';
import { EmailData, ValidationErrors } from './types';

interface EmailSettingsProps {
    emailData: EmailData;
    handleEmailChange: (field: keyof EmailData, value: string) => void;
    errors: ValidationErrors;
    emailConfirmationSent: boolean;
    handleSendEmailConfirmation: () => void;
    handleConfirmEmailChange: (e: React.FormEvent) => void;
    isEmailLoading: boolean;
    setEmailConfirmationSent: (value: boolean) => void;
    setEmailData: (value: EmailData) => void;
}

function EmailSettings({ emailData, handleEmailChange, errors, emailConfirmationSent, handleSendEmailConfirmation, handleConfirmEmailChange, isEmailLoading, setEmailConfirmationSent, setEmailData }: EmailSettingsProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Address
            </h3>

            <form onSubmit={handleConfirmEmailChange}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={emailData.email}
                                onChange={(e) => handleEmailChange('email', e.target.value)}
                                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.email ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Enter your email"
                                disabled={emailConfirmationSent}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {emailConfirmationSent && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800 text-sm mb-3">
                                We've sent a confirmation code to your new email address. Please enter it below to confirm the change.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmation Code
                                </label>
                                <input
                                    type="text"
                                    value={emailData.confirmationCode}
                                    onChange={(e) => handleEmailChange('confirmationCode', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center font-mono text-lg tracking-widest ${errors.confirmationCode ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="000000"
                                    maxLength={6}
                                />
                                {errors.confirmationCode && (
                                    <p className="mt-1 text-sm text-red-600">{errors.confirmationCode}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {emailConfirmationSent ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEmailConfirmationSent(false);
                                        setEmailData({ ...emailData, confirmationCode: '' });
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isEmailLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isEmailLoading ? 'Confirming...' : 'Confirm Email Change'}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSendEmailConfirmation}
                                disabled={isEmailLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {isEmailLoading ? 'Sending...' : 'Send Confirmation Code'}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default EmailSettings;
