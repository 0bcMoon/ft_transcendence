import React from 'react';
import { User } from 'lucide-react';
import { FormData, ValidationErrors } from './types';

interface PersonalInformationProps {
    formData: FormData;
    handleInputChange: (field: keyof FormData, value: string) => void;
    errors: ValidationErrors;
}

function PersonalInformation({ formData, handleInputChange, errors }: PersonalInformationProps) {
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
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.displayName ? 'border-red-300' : 'border-gray-300'
                        }`}
                    placeholder="Enter your display name"
                />
                {errors.displayName && (
                    <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                )}
            </div>
        </div>
    );
}

export default PersonalInformation;
