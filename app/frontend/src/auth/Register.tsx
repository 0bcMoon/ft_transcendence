import { useState } from 'react';
import { Link } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';

import { StepOne, StepTwo, StepThree } from './components/Steps';
import ProgressIndicator from './components/ProgressIndicator';
import CompletionScreen from './components/CompletionScreen';

export interface IFormData {
    username: string;
    display_name: string;
    password: string;
    confirm_password: string;
    email: string;
    confirmation_code: string;
}

export default function Register() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);
    const [formData, setFormData] = useState<IFormData>({
        username: '',
        display_name: '',
        password: '',
        confirm_password: '',
        email: '',
        confirmation_code: ''
    });

    const updateFormData = (newData: Partial<IFormData>) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        setIsCompleted(true);
    };
    console.log("Form Data:", formData);

    const RenderStep = () => {
        switch (currentStep) {
            case 1:
                return <StepOne formData={formData} updateFormData={setFormData} onNext={handleNext} />;
            case 2:
                return <StepTwo formData={formData} updateFormData={updateFormData} onNext={handleNext} onBack={handleBack} />;
            case 3:
                return <StepThree formData={formData} onComplete={handleComplete} onBack={handleBack} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-blue-500/30">
            <div className="w-full max-w-md mb-4">
                <Link to="/login" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                    Back to Login
                </Link>
            </div>

            <div className="w-full max-w-md">
                <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-800 shadow-black/30">
                    {isCompleted ? (
                        <>
                            <CompletionScreen formData={formData} />
                            <Link
                                to="/login"
                                className="mt-8 w-full h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                            >
                                Proceed to Login
                            </Link>
                        </>
                    ) : (
                        <>
                            <ProgressIndicator currentStep={currentStep} totalSteps={3} />
                            <div className="mt-8">
                                <RenderStep />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

