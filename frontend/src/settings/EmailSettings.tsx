import api from '@/api/api';
import { useAuthStore } from '@/state/authStore';
import { EmailUpdate } from '@/state/Store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Mail, X } from 'lucide-react';
import { useEffect, useState } from 'react';


interface IUpdateState {
    type: 'error' | 'success' | 'none';
    message: string;
}


function EmailSettings() {
    const [email, setEmail] = useState<string>('');

    const [confirmation_sent, setConfirmationSent] = useState<boolean>(false);

    const user_email = useAuthStore((state) => state.user?.email);
    const oauth_type = useAuthStore((state) => state.user?.oauth_type);

    useEffect(() => {
        setEmail(user_email || '');
    }, [user_email]);

    const [updateState, setUpdateState] = useState<IUpdateState | null>(null);


    const queryClient = useQueryClient();
    const { mutate: updateEmail, isPending: isEmailLoading } = useMutation({

        mutationFn: async (email_data: { email: string, confirmtion_code?: string }) => {
            const response = await api.post('/user/update/email', email_data);
            return response.data;
        },
        onSuccess: (data: any) => {
            setUpdateState({
                type: 'success',
                message: data.message || 'Email address updated successfully.'
            });
            setEmail(data.email);
            setConfirmationSent((prev) => !prev); // Toggle confirmation state
            if (confirmation_sent) {
                setConfirmationSent(false); // Reset confirmation state if already sent
            }
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
        onError: (error: any) => {
            setUpdateState({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update email address. Please try again.'
            });
        }
    })

    const handelSumit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setUpdateState({
            type: "none",
            message: ''
        });
        const form = new FormData(e.currentTarget);
        const data = Object.fromEntries(form.entries()) as unknown as EmailUpdate;
        // console.log(data);
        if (data.email === user_email) {
            setUpdateState({
                type: 'error',
                message: 'The new email address cannot be the same as the current one.'
            });
            return;
        }
        updateEmail(data);
    }


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
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function cancelFunction(e: any) {
        e.preventDefault();
        setEmail(email || '');
        setConfirmationSent(false);
        setUpdateState({
            type: 'none',
            message: ''
        });
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Address
            </h3>

            <form onSubmit={handelSumit} className="space-y-6">
                <div className="space-y-4">

                    <UpdateState />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                required
                                disabled={oauth_type !== 'local'}
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300"
                                placeholder="Enter your email"
                            />
                        </div>


                    </div>

                    {confirmation_sent && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800 text-sm mb-3">
                                We've sent a confirmation code to your new email address. Please enter it below to confirm the change.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmation Code
                                </label>
                                <input
                                    name="confirmtion_code"
                                    type="text"
                                    className=" w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 
                                                focus:border-blue-500 transition-colors text-center 
                                                font-mono text-lg tracking-widest  border-gray-300"
                                    placeholder="00000000"
                                    maxLength={8}
                                />


                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {confirmation_sent ? (
                            <>
                                <button
                                    onClick={cancelFunction}
                                    type="button"
                                    className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isEmailLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isEmailLoading ? 'Confirming...' : 'Confirm Email Change'}
                                </button>
                            </>
                        ) : (
                            <button
                                type="submit"
                                disabled={isEmailLoading || !email || email === user_email || !isValidEmail(email)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >

                                {isEmailLoading ? 'Sending...' : 'Send Confirmation Code'}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default EmailSettings;
