import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Eye, EyeOff, Mail } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';
import { login_api } from '@/api/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import TwoFactorAuth from './TwoFactorAuth';

const loginSchema = z.object({
    username: z.
        string().
        min(1, 'Username is required').
        min(3, 'Username must be at least 3 characters').
        max(24, 'Username must be at most 20 characters'),
    password: z.
        string().
        min(1, 'Password is required').
        min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

type CurrentStep = 'login' | 'two_factor_auth';

const LoginForm: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
    const [step, setCurrentStep] = useState<CurrentStep>('login');

    const { isAuthenticated, isLoading, setAuth } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate("/");
        }
    }, [isAuthenticated, navigate, isLoading]);


    const loginUser = async (data: LoginFormData) => {
        const response = await login_api.post('/auth/login', data);
        return response.data;
    };

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data: any) => {
            if (data.two_factor_enabled) {
                setCurrentStep("two_factor_auth");
            } else {
                setAuth(true);

            }
        },
    });


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const result = loginSchema.safeParse(data);
        if (result.success) {
            loginMutation.mutate(result.data);
            setErrors({});
            return;
        }
        const newErrors: { username?: string; password?: string } = {};
        const fieldErrors = result.error.flatten().fieldErrors;
        Object.keys(fieldErrors).forEach(key => {
            const field = key as keyof LoginFormData;
            if (fieldErrors[field]) {
                newErrors[field] = fieldErrors[field][0];
            }
        });
        setErrors(newErrors);
    }
    const OauthLogin = (provider: string) => {
        const backend_url = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
        window.location.href = `${backend_url}/auth/oauth/${provider}`;
    }

    if (step == 'two_factor_auth') {
        return <TwoFactorAuth setCurrentStep={setCurrentStep} />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                            <p className="text-gray-600">Sign in to your account</p>
                        </div>

                        {/* Error Message */}
                        {loginMutation.isError && (
                            <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">
                                    Login failed. Please check your credentials and try again.
                                </p>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Username Field */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                    Username
                                </label>
                                <div className="relative">
                                    <input
                                        name="username"
                                        type="text"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 
                                        focus:ring-blue-500 focus:border-transparent transition-all duration-200 
                                        ${errors.username ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="Enter your username"
                                    />
                                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                </div>
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        name='password'
                                        type={showPassword ? 'text' : 'password'}
                                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 
                                    focus:ring-blue-500 focus:border-transparent transition-all duration-200 
                                    ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Forgot Password Link */}
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    Forgot your password?
                                </button>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loginMutation.isPending ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>

                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        {/* Social Login Buttons */}
                        <div
                            className="space-y-3 mb-6">
                            <button
                                type="button"
                                onClick={() => OauthLogin("google")}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>

                            <button
                                type="button"
                                onClick={() => OauthLogin("42")}
                                className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" >
                                    <rect x="0" y="0" width="24" height="24" rx="8" fill="none" />
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000" x="0" y="0" width="24" height="24">
                                        <path fill="#000000" d="m24 12.42l-4.428 4.415H24zm-4.428-4.417l-4.414 4.418v4.414h4.414V12.42L24 8.003V3.575h-4.428zm-4.414 0l4.414-4.428h-4.414zM0 15.996h8.842v4.43h4.412V12.42H4.428l8.826-8.846H8.842L0 12.421z" />
                                    </svg>
                                </svg>
                                Continue with 42
                            </button>
                        </div>

                        {/* Sign Up Link */}
                        <p className="mt-6 text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    {/* Forgot Password Modal */}
                    <ForgotPasswordModal
                        isOpen={showForgotModal}
                        onClose={() => setShowForgotModal(false)}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
