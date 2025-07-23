import React from 'react';
import { Shield } from 'lucide-react';
import { TwoFactorState } from './types';

interface SecuritySettingsProps {
    twoFactor: TwoFactorState;
    setShow2FAModal: (value: boolean) => void;
}

function SecuritySettings({ twoFactor, setShow2FAModal }: SecuritySettingsProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
            </h3>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${twoFactor.isEnabled ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                        <Shield className={`w-5 h-5 ${twoFactor.isEnabled ? 'text-green-600' : 'text-gray-400'
                            }`} />
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">
                            {twoFactor.isEnabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security'}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setShow2FAModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    {twoFactor.isEnabled ? 'Manage 2FA' : 'Setup 2FA'}
                </button>
            </div>
        </div>
    );
}

export default SecuritySettings;
