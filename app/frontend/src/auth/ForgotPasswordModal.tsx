import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { X, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

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

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<{ email?: string }>({});
    const [email, setEmail] = useState('');

    const resetMutation = useMutation({
        mutationFn: sendResetEmail,
        onSuccess: () => {
            setIsSubmitted(true);
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const emailValue = formData.get('email') as string;
        setEmail(emailValue);

        const result = forgotPasswordSchema.safeParse({ email: emailValue });

        if (result.success) {
            setErrors({}); // Clear previous errors
            resetMutation.mutate(result.data);
        } else {
            // Set the new error message
            setErrors({ email: result.error.errors[0]?.message });
        }
    };

    const handleClose = () => {
        onClose();
        // Reset state after the closing animation for a clean reopen
        setTimeout(() => {
            setIsSubmitted(false);
            setErrors({});
            setEmail('');
            resetMutation.reset();
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
                aria-hidden="true"
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-md p-8 overflow-hidden text-left align-middle transition-all transform bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={isSubmitted ? handleClose : () => setIsSubmitted(false)}
                        className="p-1 text-slate-500 hover:text-white transition-colors"
                        aria-label="Back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold text-white">
                        {isSubmitted ? 'Check Your Email' : 'Reset Password'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-1 text-slate-500 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!isSubmitted ? (
                    <>
                        {/* Form State */}
                        <p className="mb-4 text-sm text-center text-slate-400">
                            Enter your email and we'll send a link to reset your password.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <div className="relative">
                                    <input
                                        name="email"
                                        type="email"
                                        className={`w-full h-12 px-4 py-3 pr-12 bg-slate-800 border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.email ? 'border-red-500/50' : 'border-slate-700'}`}
                                        placeholder="you@example.com"
                                    />
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={resetMutation.isPending}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {resetMutation.isPending ? (
                                    <>
                                        <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Sending...
                                    </>
                                ) : 'Send Reset Link'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        {/* Success State */}
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <p className="text-sm text-slate-400 mb-6">
                                We've sent a password reset link to{' '}
                                <span className="font-medium text-white">{email}</span>.
                            </p>
                            <p className="text-xs text-slate-500 mb-6">
                                Didn't receive it? Check your spam folder or try again.
                            </p>
                            <button
                                onClick={handleClose}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
                            >
                                Back to Sign In
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

