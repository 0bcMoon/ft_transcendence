import React from 'react';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
    const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

    return (
        <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step < currentStep
                                    ? 'bg-blue-600 text-white transform scale-110'
                                    : step === currentStep
                                        ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                                        : 'bg-gray-200 text-gray-400'
                                }`}
                        >
                            {step < currentStep ? (
                                <Check className="w-5 h-5 animate-pulse" />
                            ) : (
                                <span className="text-sm font-medium">{step}</span>
                            )}
                        </div>
                        <span
                            className={`mt-2 text-xs font-medium transition-colors duration-300 ${step <= currentStep ? 'text-blue-600' : 'text-gray-400'
                                }`}
                        >
                            {step === 1 ? 'Profile' : step === 2 ? 'Security' : 'Verify'}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className="flex-1 mx-4 h-0.5 bg-gray-200 relative overflow-hidden">
                            <div
                                className={`absolute left-0 top-0 h-full bg-blue-600 transition-all duration-500 ease-out ${step < currentStep ? 'w-full' : 'w-0'
                                    }`}
                            />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
