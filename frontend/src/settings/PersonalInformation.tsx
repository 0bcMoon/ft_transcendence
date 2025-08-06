import { useAuthStore } from '@/state/authStore';
import { useValidationStore } from '@/state/Store';
import { User } from 'lucide-react';


function PersonalInformation() {
    const display_name = useValidationStore((state) => state.display_name);
    const user = useAuthStore(state => state.user)
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
            </h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                </label>
                <input
                    name="display_name"
                    type="text"
                    defaultValue= {user?.display_name || ''}
                    className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors  border-gray-300'
                    placeholder="Enter your display name"
                />
                {display_name && (
                    <p className="mt-1 text-sm text-red-600">{display_name}</p>
                )}
            </div>
        </div>
    );
}

export default PersonalInformation;
