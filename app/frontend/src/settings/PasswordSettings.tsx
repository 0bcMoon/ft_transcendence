import { useValidationStore } from '@/state/Store';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface PasswordSettingsProps {
    showPasswords: { current: boolean; new: boolean; confirm: boolean; };
    togglePasswordVisibility: (field: 'current' | 'new' | 'confirm') => void;
}

function PasswordSettings({ showPasswords, togglePasswordVisibility }: PasswordSettingsProps) {

    const errors = useValidationStore((state) => state);
    const [readOnly, setReadOnly] = useState(true);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">

            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 dark:text-white">
                <Lock className="w-5 h-5" />
                Change Password
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                        Current Password
                    </label>
                    <div className="relative">
                        <input
                            name="current_password"
                            type={showPasswords.current ? 'text' : 'password'}
                            className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300
                                       dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500 dark:focus:ring-offset-gray-800'
                            placeholder="Enter current password"
                            autoComplete="current-password"
                            readOnly={readOnly}
                            onFocus={() => setReadOnly(false)}
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400" >
                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {errors.current_password && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.current_password}</p>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                name="new_password"
                                type={showPasswords.new ? 'text' : 'password'}
                                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300
                                           dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500 dark:focus:ring-offset-gray-800'
                                placeholder="Enter new password"
                                autoComplete="new-password"
                                readOnly={readOnly}
                                onFocus={() => setReadOnly(false)}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('new')}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400" >
                                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.new_password && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.new_password}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                name="confirm_password"
                                type={showPasswords.confirm ? 'text' : 'password'}
                                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300
                                           dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500 dark:focus:ring-offset-gray-800'
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                                readOnly={readOnly}
                                onFocus={() => setReadOnly(false)}
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400" >
                                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.confirm_password && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirm_password}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PasswordSettings;
