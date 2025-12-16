import { useAuthStore } from '@/state/authStore';
import { useValidationStore } from '@/state/Store';
import { User } from 'lucide-react';
import { useState } from 'react';

function PersonalInformation() {
    const { display_name, username } = useValidationStore((state) => state);
    const user = useAuthStore(state => state.user);
    const [readOnly, setReadOnly] = useState(true);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
            </h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Display Name
                </label>
                <input
                    name="display_name"
                    type="text"
                    defaultValue={user?.display_name}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg 
                               text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your display name"
                    autoComplete="off"
                    readOnly={readOnly}
                    onFocus={() => setReadOnly(false)}
                />
                {display_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{display_name}</p>
                )}
            </div>

            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Username
                </label>
                <input
                    name="username"
                    type="text"
                    defaultValue={user?.username}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg 
                               text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your username"
                    autoComplete="off"
                    readOnly={readOnly}
                    onFocus={() => setReadOnly(false)}
                />
                {username && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{username}</p>
                )}
            </div>
        </div>
    );
}

export default PersonalInformation;
