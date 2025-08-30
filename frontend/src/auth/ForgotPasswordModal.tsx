import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { X, Mail, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Mock API function - replace with your actual API call
const sendResetEmail = async (data: ForgotPasswordData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Reset email sent to:', data.email);
    return { success: true };
};

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors , setErrors] = useState<{email?: string}>({});
    const [email, setEmail] = useState('');

    const resetMutation = useMutation({
        mutationFn: sendResetEmail,
        onSuccess: () => {
            setIsSubmitted(true);
        },
        onError: (error) => {
            console.error('Failed to send reset email:', error);
        },
    });

    const onSubmit = (data: ForgotPasswordData) => {
        resetMutation.mutate(data);
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setIsSubmitted(false);
        }, 300);
    };
    const handleSubmit = (e: React.FormEvent) => {

        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get('email') as string;
        const parsed = forgotPasswordSchema.safeParse({ email });
        if (parsed.success) {
            onSubmit(parsed.data);
        } else {
            const errorMessages = parsed.error.errors.map(err => err.message).join(', ');
            alert(`Validation Error: ${errorMessages}`);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 text-center">
                {/* Overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={handleClose}
                ></div>

                {/* Modal */}
                <div className="relative w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={handleClose}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {isSubmitted ? 'Check your email' : 'Reset your password'}
                        </h2>
                        <button
                            onClick={handleClose}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {!isSubmitted ? (
                        <>
                            {/* Form */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 text-center">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="reset-email"
                                            type="email"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter your email"
                                        />
                                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={resetMutation.isPending}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resetMutation.isPending ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Sending...
                                        </div>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>

                                {resetMutation.isError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-600">
                                            Failed to send reset email. Please try again.
                                        </p>
                                    </div>
                                )}
                            </form>
                        </>
                    ) : (
                        <>
                            {/* Success State */}
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                    <Mail className="w-8 h-8 text-green-600" />
                                </div>
                                <p className="text-sm text-gray-600 mb-6">
                                    We've sent a password reset link to{' '}
                                    <span className="font-medium text-gray-900">{email}</span>
                                </p>
                                <p className="text-xs text-gray-500 mb-6">
                                    Didn't receive the email? Check your spam folder or try again.
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Back to Sign In
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
