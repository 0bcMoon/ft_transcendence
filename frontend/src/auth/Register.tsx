import { useState } from 'react';
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

function App() {

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

    const RenderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <StepOne
                        formData={formData}
                        updateFormData={setFormData}
                        onNext={handleNext}
                    />
                );
            case 2:
                return (
                    <StepTwo
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            case 3:
                return (
                    <StepThree
                        formData={formData}
                        onComplete={handleComplete}
                        onBack={handleBack}
                    />
                );
            default:
                return null;
        }
    };

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex items-center justify-center p-4">
                <CompletionScreen formData={formData} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
                    <ProgressIndicator currentStep={currentStep} totalSteps={3} />

                    <div className="mt-8 overflow-hidden">
                        <div
                            className="flex transition-transform duration-500 ease-out"
                        >
                            <div className="w-full shrink-0">
                                <RenderStep />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
