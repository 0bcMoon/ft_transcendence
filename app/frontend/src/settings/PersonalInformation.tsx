import { useAuthStore } from '@/state/authStore';
import { useValidationStore } from '@/state/Store';
import { User } from 'lucide-react';
import { useState } from 'react';

function PersonalInformation() {
    const { display_name, username } = useValidationStore((state) => state);
    const user = useAuthStore(state => state.user)

    const [readOnly, setReadOnly] = useState(true);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">

            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2 dark:text-white">
                <User className="w-5 h-5" />
                Personal Information
            </h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Display Name
                </label>
                <input
                    name="display_name"
                    type="text"
                    defaultValue={user?.display_name}
                    className='w-full px-4 py-3 border rounded-lg transition-colors
                               bg-white text-gray-900 placeholder-gray-400 border-gray-300
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-500
                               dark:focus:ring-blue-400 dark:focus:border-transparent'
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
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Username
                </label>
                <input
                    name="username"
                    type="text"
                    defaultValue={user?.username}
                    className='w-full px-4 py-3 border rounded-lg transition-colors
                               bg-white text-gray-900 placeholder-gray-400 border-gray-300
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-500
                               dark:focus:ring-blue-400 dark:focus:border-transparent'
                    placeholder="Enter your Username"
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
