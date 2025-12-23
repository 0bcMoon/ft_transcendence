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
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-green-800">{updateState.message}</span>
                    </div>
                );
            case 'error':
                return (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <X className="w-5 h-5 text-red-600" />
                        <span className="text-red-800">{updateState.message}</span>
                    </div>
                );
            default:
                return null;
        }
    }


    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                {/* Shield Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-blue-500" />
                    </div>
                </div>

                <UpdateState />

                {/* Title */}
                <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">
                    Two-Factor Authentication
                </h1>

                {/* Subtitle */}
                <p className="text-gray-600 text-center mb-8">
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
                        className="w-full placeholder:opacity-30 px-4 py-3 text-center text-lg font-mono tracking-widest border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                        maxLength={8} // 8 characters + 7 spaces
                    />
                </div>

                {/* Verify Button */}
                <button
                    onClick={() => mutate(code)}
                    disabled={code.length !== 8 || isPending}
                    className="w-full bg-blue-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    Verify Code
                </button>

                {/* Back Button */}
                <button
                    onClick={() => setCurrentStep('login')}
                    className="w-full bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg mt-4 hover:bg-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-colors"
                >
                    Cancel
                </button>

                {/* Resend Link */}
                <div className="text-center mt-6">
                    <span className="text-gray-600 text-sm">
                        Didn't receive a code?{' '}
                        <button
                            // onClick={handleResend}
                            className="text-blue-500 hover:text-blue-600 font-medium hover:underline focus:outline-none transition-colors"
                        >
                            Resend
                        </button>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default TwoFactorAuth;
