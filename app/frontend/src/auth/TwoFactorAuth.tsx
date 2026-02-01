import { useState } from 'react';
import { Check, Shield, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { login_api } from '@/api/api';

interface IUpdateState {
    type: 'error' | 'success' | 'none';
    message: string;
}

function TwoFactorAuth({ setCurrentStep }: { setCurrentStep: (step: 'two_factor_auth' | 'login') => void }) {
    const [code, setCode] = useState('');
    const [updateState, setUpdateState] = useState<IUpdateState | null>(null);

    const { setAuth } = useAuth();

    const { mutate, isPending } = useMutation({
        mutationFn: async (confirmation_code: string) => {
            const response = await login_api.get('/api/auth/login/2fa', {
                params: { confirmation_code }
            });
            return response.data;
        },
        onSuccess: () => {
            setAuth(true);
        },
        onError: (error: any) => {
            setUpdateState({
                type: 'error',
                message: error.response?.data?.message || 'Verification failed',
            });
        },
    });

    const UpdateState = () => {
        if (!updateState) return null;

        if (updateState.type === 'success') {
            return (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <p className="text-sm text-green-400">{updateState.message}</p>
                </div>
            );
        }

        if (updateState.type === 'error') {
            return (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center gap-2">
                    <X className="w-5 h-5 text-red-400" />
                    <p className="text-sm text-red-400">{updateState.message}</p>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-500/30">
            <div className="w-full max-w-md">
                <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-2xl shadow-black/30">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Two-Factor Authentication
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Enter the 8-character code sent to your email.
                            <br />
                            Session expires in 15 minutes.
                        </p>
                    </div>

                    <UpdateState />

                    {/* Code Input */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="XXXXXXXX"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength={8}
                            className="
                                w-full h-12
                                px-4 py-3
                                text-center font-mono tracking-widest text-lg
                                bg-slate-800 text-white
                                border border-slate-700 rounded-lg
                                placeholder:text-slate-500
                                focus:outline-none focus:ring-2 focus:ring-blue-500
                                transition-all
                            "
                        />
                    </div>

                    {/* Verify */}
                    <button
                        onClick={() => mutate(code)}
                        disabled={code.length !== 8 || isPending}
                        className="
                            w-full h-12
                            bg-blue-600 hover:bg-blue-500
                            text-white rounded-lg font-semibold
                            transition-all
                            disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center justify-center
                        "
                    >
                        {isPending ? (
                            <>
                                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify Code'
                        )}
                    </button>

                    {/* Cancel */}
                    <button
                        onClick={() => setCurrentStep('login')}
                        className="
                            w-full h-12 mt-4
                            border border-slate-700
                            rounded-lg
                            text-slate-300 font-medium
                            hover:bg-slate-800
                            transition-colors
                        "
                    >
                        Cancel
                    </button>

                    {/* Resend */}
                    <p className="mt-6 text-center text-sm text-slate-400">
                        Didn’t receive a code?{' '}
                        <button className="text-blue-400 hover:text-blue-300 font-medium">
                            Resend
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default TwoFactorAuth;

