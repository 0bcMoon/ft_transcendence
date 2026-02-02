
import { useEffect, useState, } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { login_api } from '@/api/api';

const passwordResetSchema = z.object({
    password: z.string()
        .trim()
        .min(8, "Password must be at least 8 characters long.")
        .max(64, "Password cannot exceed 64 characters."),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});



export default function PasswordReset() {

    const [password, setPassword] = useState('');
    const [resetCode, setResetCode] = useState<string | null>(null);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; error?: string }>({});

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('reset_code');
        if (!code) {
            window.location.href = '/login';
        }

        setResetCode(code);
        params.delete('reset_code');
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    }, []);

    const { mutate: passwordReset, isPending, isSuccess } = useMutation({
        mutationFn: async (data: { password: string; reset_code: string }) => {
            const response = await login_api.patch('/api/auth/reset-password', data);
            return response.data;
        },
        onError: (error: any) => {
            setErrors({ error: error.response?.data?.message || 'An error occurred. Please try again.' });
        }
    });

    const canSubmit = !errors.password && !errors.confirmPassword &&
        password.length >= 8 && confirmPassword.length >= 8 && !isPending;

    useEffect(() => {
        const result = passwordResetSchema.safeParse({ password, confirmPassword });
        if (result.success) {
            setErrors({});
        } else {
            const fieldErrors = result.error.flatten().fieldErrors;
            setErrors({
                password: fieldErrors.password?.[0],
                confirmPassword: fieldErrors.confirmPassword?.[0]
            });
        }
    }, [password, confirmPassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (canSubmit && resetCode) {
            passwordReset({ password, reset_code: resetCode });
        }

    };


    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Password Reset Successful</h2>
                        <p className="text-gray-400 mb-6">
                            Your password has been successfully updated. You can now sign in with your new password.
                        </p>
                        <button
                            onClick={() => { window.location.href = '/login'; }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            Return to Sign In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Reset Your Password</h1>
                    <p className="text-gray-400">Enter your new password below</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

                    {errors.error &&
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <p className="text-sm text-red-400">{errors.error}</p>
                        </div>
                    }
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                                    placeholder="Enter new password"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                />
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.password}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                                    placeholder="Confirm new password"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 ${canSubmit
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                                }`}
                        >
                            {isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Resetting Password...
                                </span>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a
                            href="/login"
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Back to Sign In
                        </a>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Make sure your password is at least 8 characters long and secure
                    </p>
                </div>
            </div>
        </div>
    );
}
