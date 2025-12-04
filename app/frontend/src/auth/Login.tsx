import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Activity } from 'lucide-react';
import ForgotPasswordModal from './ForgotPasswordModal';
import { login_api } from '@/api/api';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import TwoFactorAuth from './TwoFactorAuth';

// Zod schema
const loginSchema = z.object({
    username: z
        .string()
        .min(1, 'Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(24, 'Username must be at most 20 characters'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type CurrentStep = 'login' | 'two_factor_auth';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
    const [step, setCurrentStep] = useState<CurrentStep>('login');

    const { isAuthenticated, isLoading, setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, isLoading]);

    const loginUser = async (data: LoginFormData) => {
        const response = await login_api.post('/api/auth/login', data);
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
        console.log(`OAuth login with ${provider}`);
    }

    if (step == 'two_factor_auth') {
        return <TwoFactorAuth setCurrentStep={setCurrentStep} />
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden selection:bg-blue-500/30">

            {/* Background Effects - Same as Landing Page */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-[100%] blur-[100px] opacity-50"></div>
            </div>

            {/* Logo/Back to Home */}
            <div className="fixed top-6 left-6 z-50">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Activity size={18} className="text-white" />
                    </div>
                    <span>PONG<span className="text-blue-500">.IO</span></span>
                </Link>
            </div>

            {/* Login Form Container */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-800">

                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                            <p className="text-slate-400">Sign in to your account</p>
                        </div>

                        {loginMutation.isError && (
                            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                                <p className="text-sm text-red-300 text-center">
                                    Login failed.  Please check your credentials.
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">
                                    Username
                                </label>
                                <div className="relative">
                                    <input
                                        name="username"
                                        type="text"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 
                                                    bg-slate-800/50 border-slate-700 text-white
                                                    focus:ring-blue-500 focus:border-transparent transition-all duration-200 
                                                    ${errors.username ? 'border-red-600' : 'border-slate-700'}`}
                                        placeholder="Enter your username"
                                    />
                                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                                </div>
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-400">{errors.username}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        name='password'
                                        type={showPassword ? 'text' : 'password'}
                                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 
                                                    bg-slate-800/50 border-slate-700 text-white
                                                    focus:ring-blue-500 focus:border-transparent transition-all duration-200 
                                                    ${errors.password ? 'border-red-600' : 'border-slate-700'}`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                                )}
                            </div>

                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                >
                                    Forgot your password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 
                                           focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 
                                           transition-all duration-200 font-medium 
                                           disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)]"
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

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-slate-900 text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <button
                                type="button"
                                onClick={() => OauthLogin("google")}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 
                                           border border-slate-700 rounded-lg 
                                           hover:bg-slate-800/50 transition-colors duration-200 
                                           font-medium text-slate-300"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-. 26 1.37-1. 04 2.53-2. 21 3.31v2. 77h3.57c2. 08-1.92 3. 28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-. 66-.35-1.36-. 35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c. 87-2.6 3. 3-4.53 6. 16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>

                            <button
                                type="button"
                                onClick={() => OauthLogin("42")}
                                className="w-full flex items-center justify-center gap-3 px-5 py-3 
                                           border border-slate-700 rounded-lg 
                                           hover:bg-slate-800/50 transition-colors duration-200 
                                           font-medium text-slate-300"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FFFFFF">
                                    <path d="m24 12.42l-4.428 4.415H24zm-4.428-4.417l-4.414 4.418v4.414h4.414V12.42L24 8.003V3.575h-4.428zm-4.414 0l4.414-4.428h-4.414zM0 15.996h8.842v4.43h4.412V12.42H4.428l8.826-8.846H8.842L0 12.421z" />
                                </svg>
                                Continue with 42
                            </button>
                        </div>

                        <p className="mt-6 text-center text-sm text-slate-400">
                            Don't have an account? {' '}
                            <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                <ForgotPasswordModal
                    isOpen={showForgotModal}
                    onClose={() => setShowForgotModal(false)}
                />
            </div>
        </div>
    );
};

export default Login;
