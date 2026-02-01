import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Eye, EyeOff, Mail, AlertTriangle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import ForgotPasswordModal from './ForgotPasswordModal';
import TwoFactorAuth from './TwoFactorAuth';
import { useAuth } from '@/context/AuthContext';
import { useLogin } from '@/users/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

const loginSchema = z.object({
    identifier: z.union([
        z.string().email("Invalid email format"),
        z.string()
            .min(3, "Username too short")
            .max(20, "Username too long")
            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    ]),
    password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>
type CurrentStep = "login" | "two_factor_auth"

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showForgotModal, setShowForgotModal] = useState(false)
    const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})
    const [step, setCurrentStep] = useState<CurrentStep>("login")

    const { isAuthenticated, isLoading, setAuth } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || "/"

    const loginMutation = useLogin()

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate(from, { replace: true })
        }
    }, [isAuthenticated, isLoading, navigate, from])
    const queryClient = useQueryClient();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())
        const result = loginSchema.safeParse(data)


        if (result.success) {
            setErrors({})
            loginMutation.mutate(result.data, {
                onSuccess: (data: any) => {
                    if (data.two_factor_enabled) {
                        setCurrentStep("two_factor_auth")
                    } else {
                        queryClient.invalidateQueries({ queryKey: ['user'] });
                        setAuth(true)
                        navigate(from, { replace: true })
                    }
                }
            })
            return
        }

        const newErrors = result.error.flatten().fieldErrors
        setErrors({
            identifier: newErrors.identifier?.[0],
            password: newErrors.password?.[0],
        })
    }

    const handleOAuthLogin = (provider: "google" | "42") => {
        const backendUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000"
        window.location.href = `${backendUrl}/api/auth/oauth/${provider}`
    }

    if (step === "two_factor_auth") {
        return <TwoFactorAuth setCurrentStep={setCurrentStep} />
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-500/30">
            <div className="w-full max-w-md">
                <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-2xl shadow-black/30">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-slate-400">Sign in to continue</p>
                    </div>

                    {loginMutation.isError && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <p className="text-sm text-red-400">Invalid credentials.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="relative">
                                <input
                                    name="identifier"
                                    type="text"
                                    className={`w-full h-12 px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.identifier ? "border-red-500/50" : "border-slate-700"}`}
                                    placeholder="identifier"
                                />
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                            </div>
                            {errors.identifier && <p className="mt-2 text-sm text-red-400">{errors.identifier}</p>}
                        </div>

                        <div>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full h-12 px-4 py-3 pr-12 bg-slate-800 border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.password ? "border-red-500/50" : "border-slate-700"}`}
                                    placeholder="Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-sm text-red-400 h-5">{errors.password}</p>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loginMutation.isPending ? (
                                <>
                                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
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

                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => handleOAuthLogin("google")}
                            className="w-full h-12 flex items-center justify-center gap-3 px-4 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 font-medium"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Continue with Google
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOAuthLogin("42")}
                            className="w-full h-12 flex items-center justify-center gap-3 px-4 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 font-medium"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="m24 12.42l-4.428 4.415H24zm-4.428-4.417l-4.414 4.418v4.414h4.414V12.42L24 8.003V3.575h-4.428zm-4.414 0l4.414-4.428h-4.414zM0 15.996h8.842v4.43h4.412V12.42H4.428l8.826-8.846H8.842L0 12.421z" />
                            </svg>
                            Continue with 42
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-slate-400">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />
        </div>
    )
}

