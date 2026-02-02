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
                params: { confirmation_code: confirmation_code }
            });
            return response.data;
        },
        onSuccess: () => {
            setAuth(true);
            // Redirect or perform further actions
        },
        onError: (error: any) => {
            setUpdateState({ type: 'error', message: error.response.data.message || 'Verification failed' });
        },
    })

    const UpdateState = () => {

        if (!updateState) return null;

        switch (updateState.type) {
            case 'success':
                return (
                    <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="text-green-400">{updateState.message}</span>
                    </div>
                );
            case 'error':
                return (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                        <X className="w-5 h-5 text-red-400" />
                        <span className="text-red-400">{updateState.message}</span>
                    </div>
                );
            default:
                return null;
        }
    }


    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-500/30">
            <div className="w-full max-w-md">
                <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-2xl shadow-black/30">
                    {/* Shield Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>

                    <UpdateState />

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-white text-center mb-2">
                        Two-Factor Authentication
                    </h1>

                    {/* Subtitle */}
                    <p className="text-slate-400 text-center mb-8">
                        Enter the 8-character code sent to your email.
                        <br />
                        Session expires in 15 minutes.
                    </p>


                    {/* Code Input */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="XXXXXXXX"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-12 placeholder:opacity-30 px-4 py-3 text-center text-lg font-mono tracking-widest bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            maxLength={8}
                        />
                    </div>

                    {/* Verify Button */}
                    <button
                        onClick={() => mutate(code)}
                        disabled={code.length !== 8 || isPending}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isPending ? (
                            <>
                                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Verifying...
                            </>
                        ) : (
                            "Verify Code"
                        )}
                    </button>

                    {/* Back Button */}
                    <button
                        onClick={() => setCurrentStep('login')}
                        className="w-full h-12 mt-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 font-medium"
                    >
                        Cancel
                    </button>

                    {/* Resend Link */}
                    <div className="text-center mt-6">
                        <span className="text-slate-400 text-sm">
                            Didn't receive a code?{' '}
                            <button
                                // onClick={handleResend}
                                className="text-blue-400 hover:text-blue-300 font-medium hover:underline focus:outline-none transition-colors"
                            >
                                Resend
                            </button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TwoFactorAuth;
