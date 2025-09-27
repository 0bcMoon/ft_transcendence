import api from '@/api/api';
import Modal, { IModal } from '@/component/Model';
import { useAuthStore } from '@/state/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Loader, Shield, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface IUpdateState {
    type: 'error' | 'success' | 'none';
    message: string;
}



function SecuritySettings() {


    const isEnabled = useAuthStore((state) => state.user?.two_factor_enabled)

    const [confirmation_sent, setConfirmationSent] = useState<boolean>(false);
    const [open2faModal, setOpen2faModal] = useState<boolean>(false);

    const [updateState, setUpdateState] = useState<IUpdateState | null>(null);

    const curr_modal: IModal[] = [
        {
            isOpen: open2faModal,
            onClose: () => setOpen2faModal(false),
            onAccept: () => onAccept(),
            onDeny: () => setOpen2faModal(false),
            title: "Enable Two-Factor Authentication",
            message: "Enabling 2FA adds an extra layer of security to your account. You will need to use an authenticator app to generate a verification code each time you log in.",
            acceptText: "Enable 2FA",
            denyText: "Cancel",
        },
        {
            isOpen: open2faModal,
            onClose: () => setOpen2faModal(false),
            onAccept: () => onAccept(),
            onDeny: () => setOpen2faModal(false),
            title: "Disable Two-Factor Authentication",
            message: "Disabled 2FA remove an extra layer of security to your account",
            acceptText: "Disable 2FA",
            denyText: "Cancel",
            type: 'warning'
        }
    ]

    // get from context user
    const query = useQueryClient();
    const { mutate: update2fa, isPending: isUpdating2fa } = useMutation({
        mutationFn: async (query: { action: boolean, confirmation_code?: string }) => {
            const response = await api.get('/api/auth/2fa', {
                params: query
            });
            return response.data;
        },
        onSuccess: (data: any) => {
            setUpdateState({ type: "success", message: data.message })

            if (confirmation_sent) {
                query.invalidateQueries({ queryKey: ["user"] });

            }
            setConfirmationSent((prev) => !prev)
        },
        onError: (error: any) => {
            setUpdateState({ type: "error", message: error.response?.data?.message ?? "Internal Server Error" })
        }
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

    const onAccept = () => {
        console.debug("action: ", !isEnabled)
        update2fa({ action: !isEnabled })
        setOpen2faModal(false);
    }

    const ConfirmationCode = () => {

        const handelsubmit = (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const confirmation_code = form.get('confirmation_code')?.toString();
            if (!confirmation_code) {
                setUpdateState({ type: 'error', message: 'confirmation code is require' })
            }
            update2fa({ action: !isEnabled, confirmation_code: confirmation_code });
        }
        const cancelFunction = () => {
            setUpdateState(null);
            setConfirmationSent(false);
        }

        return (
            <form onSubmit={handelsubmit} className='space-y-4'>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm mb-3">
                        We've sent a confirmation code to your email address. Please enter it below to confirm the change.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmation Code
                        </label>
                        <input
                            name="confirmation_code"
                            type="text"
                            className=" w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 
                                                focus:border-blue-500 transition-colors text-center 
                                                font-mono text-lg tracking-widest  border-gray-300"
                            placeholder="00000000"
                            maxLength={8}
                        />
                    </div>
                </div>

                <div className='flex gap-3'>

                    <button
                        onClick={cancelFunction}
                        type="button"
                        disabled={isUpdating2fa}
                        className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isUpdating2fa}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdating2fa ? 'Confirming...' : 'Confirm 2FA Change'}
                    </button>

                </div>
            </form>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <UpdateState />
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
            </h3>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Shield className={`w-5 h-5 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">
                            {isEnabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security'}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    disabled={isUpdating2fa || confirmation_sent}
                    onClick={() => setOpen2faModal(true)}
                    className={`disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-white rounded-lg ${isEnabled ? 'hover:bg-red-700 bg-red-600' : 'hover:bg-blue-700 bg-blue-600'} transition-colors font-medium`}
                >
                    {isUpdating2fa ? <Loader className='animate-spin' /> : (isEnabled ? 'Disable 2FA' : 'Enable 2FA')}
                </button>
            </div>
            {confirmation_sent && <ConfirmationCode />}

            {/* Enable 2fa */}
            < Modal
                {...curr_modal[Number(!!isEnabled)]}
            />

        </div>
    );
}

export default SecuritySettings;
