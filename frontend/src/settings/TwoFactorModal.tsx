import React from 'react';
import { X, Shield, Smartphone, Key, Copy, Download, Check } from 'lucide-react';

interface TwoFactorState {
    isEnabled: boolean;
    isSetupMode: boolean;
    qrCode: string;
    backupCodes: string[];
    verificationCode: string;
}

interface TwoFactorModalProps {
    isOpen: boolean;
    onClose: () => void;
    twoFactor: TwoFactorState;
    setTwoFactor: React.Dispatch<React.SetStateAction<TwoFactorState>>;
    isLoading: boolean;
    onEnable2FA: () => void;
    onDisable2FA: () => void;
    onVerify2FA: () => void;
    onCopyToClipboard: (text: string) => void;
    onDownloadBackupCodes: () => void;
    errors: { verificationCode?: string };
}

export default function TwoFactorModal({
    isOpen,
    onClose,
    twoFactor,
    setTwoFactor,
    isLoading,
    onEnable2FA,
    onDisable2FA,
    onVerify2FA,
    onCopyToClipboard,
    onDownloadBackupCodes,
    errors
}: TwoFactorModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Two-Factor Authentication
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {!twoFactor.isEnabled && !twoFactor.isSetupMode ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Secure your account</h3>
                            <p className="text-gray-600 mb-6">
                                Add an extra layer of security with two-factor authentication. This helps protect your account even if your password is compromised.
                            </p>
                            <button
                                onClick={onEnable2FA}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Enable Two-Factor Authentication
                            </button>
                        </div>
                    ) : twoFactor.isSetupMode ? (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Set up Two-Factor Authentication</h3>
                                <p className="text-gray-600">Scan the QR code with your authenticator app</p>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                                        <img
                                            src={twoFactor.qrCode}
                                            alt="QR Code"
                                            className="w-48 h-48 mx-auto mb-4 border border-gray-200 rounded-lg"
                                        />
                                        <p className="text-sm text-gray-600 mb-4">
                                            Can't scan? Use this code instead:
                                        </p>
                                        <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm break-all">
                                            JBSWY3DPEHPK3PXP
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                <Smartphone className="w-4 h-4" />
                                                Recommended Apps
                                            </h4>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <p>• Google Authenticator</p>
                                                <p>• Microsoft Authenticator</p>
                                                <p>• Authy</p>
                                                <p>• 1Password</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Verification Code
                                            </label>
                                            <input
                                                type="text"
                                                value={twoFactor.verificationCode}
                                                onChange={(e) => setTwoFactor(prev => ({ ...prev, verificationCode: e.target.value }))}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center font-mono text-lg tracking-widest ${errors.verificationCode ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                placeholder="000000"
                                                maxLength={6}
                                            />
                                            {errors.verificationCode && (
                                                <p className="mt-1 text-sm text-red-600">{errors.verificationCode}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTwoFactor(prev => ({ ...prev, isSetupMode: false, verificationCode: '' }))}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={onVerify2FA}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Enable'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <Check className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Two-factor authentication is enabled</h4>
                                        <p className="text-sm text-gray-600">Your account is protected with 2FA</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onDisable2FA}
                                    disabled={isLoading}
                                    className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Disabling...' : 'Disable 2FA'}
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <Key className="w-4 h-4" />
                                    Backup Codes
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                                </p>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {twoFactor.backupCodes.map((code, index) => (
                                        <div key={index} className="bg-white p-3 rounded border border-gray-200 font-mono text-sm flex items-center justify-between">
                                            <span>{code}</span>
                                            <button
                                                type="button"
                                                onClick={() => onCopyToClipboard(code)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={onDownloadBackupCodes}
                                    className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Backup Codes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
