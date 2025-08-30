import React from 'react';
import { useState } from 'react';
import { Mail, CheckCircle, Send, ArrowLeft, X } from 'lucide-react';
import { User, ArrowRight } from 'lucide-react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';

import { z } from "zod";
import { useMutation } from '@tanstack/react-query';
import api from '@/api/api';
import { IFormData } from '../Register';

interface StepOneProps {
    formData: {
        username: string;
        display_name: string;
    };
    updateFormData: (data: any) => void;
    onNext: () => void;
}


const userinfoSchema = z.object({
    username: z.string()
        .min(1, 'Username is required')
        .max(24, 'Username cannot exceed 24 characters')
        .regex(/^\S+$/, 'Username cannot contain whitespace'),
    display_name: z.string()
        .min(1, 'Display name is required')
        .max(24, 'Display name cannot exceed 24 characters'),
});

// TODO: check if username is unique
export function StepOne({ updateFormData, formData, onNext }: StepOneProps) {

    const [errors, setErrors] = useState<{ username?: string; display_name?: string }>({});
    const canContinue = !errors.username && !errors.display_name

    const usernameMutation = useMutation({
        mutationFn: async (username: string) => {
            const response = await api.get('/auth/check-username', { params: { username } });
            return response.data;
        },
        onError: () => {
            setErrors((prev) => ({
                ...prev,
                username: 'Username is already taken',
            }));
        },
        onSuccess: () => {
            setErrors((prev) => ({
                ...prev,
                username: undefined,
            }));
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const username = form.get('username') as string;
        const display_name = form.get('display_name') as string;
        const result = userinfoSchema.safeParse({ username, display_name: display_name });
        if (result.success) {
            onNext();
            updateFormData({ username, display_name: display_name });
            return;
        }
        const fieldErrors = result.error.flatten().fieldErrors;
        Object.keys(fieldErrors).forEach((key) => {
            setErrors((prev) => ({
                ...prev,
                [key]: fieldErrors[key as keyof typeof fieldErrors]?.[0],
            }));
        });
    };

    let timeout: NodeJS.Timeout | undefined = undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            const { value } = e.target;
            usernameMutation.mutate(value);
        }, 300);
    }
    return (
        <div className="animate-fadeIn">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4 transition-all duration-300 hover:bg-blue-100">
                    <User className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Profile</h2>
                <p className="text-gray-600">Let's start with your basic information</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="group">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            defaultValue={formData.username}
                            onChange={handleChange}
                            type="text"
                            id="username"
                            name='username'
                            className="w-full px-4 py-3 rounded-lg ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200 outline-none group-hover:ring-gray-300 placeholder:text-gray-400"
                            placeholder="Choose a unique username"
                            required
                        />
                        {errors.username && (
                            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                        )}
                    </div>

                    <div className="group">
                        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-2">
                            Display Name
                        </label>
                        <input
                            defaultValue={formData.display_name}
                            type="text"
                            id="display_name"
                            name='display_name'
                            className="w-full px-4 py-3 rounded-lg ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200 outline-none group-hover:ring-gray-300 placeholder:text-gray-400"
                            placeholder="How should we display your name?"
                            required
                        />
                        {errors.display_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.display_name}</p>
                        )}
                    </div>
                </div>

                <button
                    disabled={!canContinue}
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                    Continue
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
            </form>
        </div>
    );
}




interface StepTwoProps {
    formData: {
        password: string;
        confirm_password: string;
    };
    updateFormData: (data: Partial<any>) => void;
    onNext: () => void;
    onBack: () => void;


}

const passwordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(64, 'Password cannot exceed 64 characters'),
    confirm_password: z.string()
        .min(8, 'Confirm Password must be at least 8 characters')
        .max(64, 'Confirm Password cannot exceed 64 characters'),
}).refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
});

export function StepTwo({ formData, updateFormData, onNext, onBack }: StepTwoProps) {

    const [errors, setErrors] = useState<{ password?: string; confirm_password?: string }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);




    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const password = form.get('password') as string;
        const confirm_password = form.get('confirm_password') as string;
        const result = passwordSchema.safeParse({ password, confirm_password });
        if (result.success) {
            updateFormData({ password, confirm_password });
            onNext();
            return;
        }
        const fieldErrors = result.error.flatten().fieldErrors;
        Object.keys(fieldErrors).forEach((key) => {
            setErrors((prev) => ({
                ...prev,
                [key]: fieldErrors[key as keyof typeof fieldErrors]?.[0],
            }));
        });
    };
    return (
        <div className="animate-fadeIn">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4 transition-all duration-300 hover:bg-blue-100">
                    <Lock className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Your Account</h2>
                <p className="text-gray-600">Choose a strong password to protect your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="group">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                defaultValue={formData.password}
                                className="w-full px-4 py-3 pr-12 rounded-lg ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200 outline-none group-hover:ring-gray-300 placeholder:text-gray-400"
                                placeholder="Enter a strong password"
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>

                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    <div className="group">
                        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirm_password"
                                name="confirm_password"
                                defaultValue={formData.confirm_password}
                                className="w-full px-4 py-3 pr-12 rounded-lg ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200 outline-none group-hover:ring-gray-300 placeholder:text-gray-400"
                                placeholder="Confirm your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                            {errors.confirm_password && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 bg-white text-blue-600 border border-blue-200 py-3 rounded-lg font-medium hover:bg-blue-50 focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center justify-center gap-2 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        Back
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                        Continue
                        <Shield className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    </button>
                </div>
            </form>
        </div>
    );
}

interface StepThreeProps {
    formData: IFormData
    onComplete: () => void;
    onBack: () => void;
}

export function StepThree({ formData, onComplete, onBack }: StepThreeProps) {

    const [isCodeSent, setIsCodeSent] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>('');

    const mutateSendCode = useMutation({
        mutationFn: async (email: string) => {
            const response = await api.post('/auth/send-confirmation-code', { email });
            return response.data;
        },
        onSuccess: () => {
            setIsCodeSent(true);
        },
        onError: (error: any) => {
            setError(error.response?.data?.message || 'Failed to send confirmation code. Please try again.');
        }
    })

    const mutateRegister = useMutation({
        mutationFn: async (formData: IFormData) => {
            const response = await api.post('/auth/register', formData);
            return response.data;
        },
        onSuccess: () => {
            onComplete();
        },
        onError: (error: any) => {
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    });


    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    // const canComplete = isValidEmail && formData.confirmation_code.length === 6;
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget as HTMLFormElement);
        const confirmation_code = form.get('confirmation_code') as string;
        formData.confirmation_code = confirmation_code;
        formData.email = email;
        mutateRegister.mutate(formData);
    };

    return (
        <div className="animate-fadeIn">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4 transition-all duration-300 hover:bg-blue-100">
                    <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                <p className="text-gray-600">We'll send a confirmation code to verify your email address</p>
            </div>
            {error &&
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <X className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{error}</span>
                </div>
            }

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="group">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                disabled={isCodeSent}
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="disabled:text-gray-400 disabled:cursor-not-allowed w-full px-4 py-3 pr-12 rounded-lg ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200 outline-none group-hover:ring-gray-300 placeholder:text-gray-400"
                                placeholder="Enter your email address"
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    {isValidEmail && !isCodeSent && (
                        <div className="animate-slideUp">
                            <button
                                type="button"
                                onClick={() => mutateSendCode.mutate(email)}
                                disabled={mutateSendCode.isPending}
                                className="w-full bg-blue-50 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-100 focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center justify-center gap-2 border border-blue-200 disabled:opacity-50"
                            >
                                {false ? (
                                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                                {false ? 'Sending...' : 'Send Confirmation Code'}
                            </button>
                        </div>
                    )}

                    {isCodeSent && (
                        <div className="animate-slideUp">
                            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-700 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Confirmation code sent to {formData.email}
                                </p>
                            </div>

                            <div>
                                <label htmlFor="confirmation_code" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmation Code
                                </label>
                                <input
                                    type="text"
                                    id="confirmation_code"
                                    name="confirmation_code"
                                    className="w-full px-4 py-3 rounded-lg ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200 outline-none text-center text-xl  font-mono placeholder:text-gray-400"
                                    placeholder="00000000"
                                    maxLength={8}
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-2 text-center">
                                    Enter the code from your email
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    {isCodeSent ? (
                        <button
                            type="button"
                            onClick={() => setIsCodeSent(false)}
                            className="flex-1 bg-white text-blue-600 border border-blue-200 py-3 rounded-lg font-medium hover:bg-blue-50 focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center justify-center gap-2 group"
                        >
                            <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                            Cancel
                        </button>
                    ) :
                        (
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex-1 bg-white text-blue-600 border border-blue-200 py-3 rounded-lg font-medium hover:bg-blue-50 focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center justify-center gap-2 group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                                Back
                            </button>
                        )

                    }
                    <button
                        type="submit"
                        disabled={!isCodeSent}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                        Complete
                        <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    </button>
                </div>
            </form>
        </div>
    );
}
