import React from 'react';
import { User, Mail } from 'lucide-react';
import { FormData, ValidationErrors } from './Settings';

interface PersonalInformationProps {
    formData: FormData;
    errors: ValidationErrors;
    handleInputChange: (field: keyof FormData, value: string) => void;
}

function PersonalInformation({ formData, errors, handleInputChange }: PersonalInformationProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.email ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="Enter your email"
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PersonalInformation;
