import { useState } from 'react';
import { Link } from "react-router-dom";
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

    // Reset for "Return to Signup"
    const handleReturnToSignup = () => {
        setIsCompleted(false);
        setCurrentStep(1);
        setFormData({
            username: '',
            display_name: '',
            password: '',
            confirm_password: '',
            email: '',
            confirmation_code: ''
        });
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

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
            style={{
                backgroundImage: `url('https://blattbilliards.com/cdn/shop/articles/two-ping-pong-paddles-and-ball-on-blue-ping-pong-table_9cf060e3-0b77-455f-bfe7-8c5890bcc452_1024x.jpg?v=1748880436')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm z-0" />

            {/* Card content */}
            <div className="relative z-10 w-full max-w-md">
                <div className={`rounded-2xl shadow-xl p-8 border 
                    ${isCompleted
                        ? 'bg-white dark:bg-gray-900/80 border-blue-100 dark:border-gray-700'
                        : 'bg-white dark:bg-gray-900/80 border-blue-100 dark:border-gray-800'
                    }`}>
                    {isCompleted ? (
                        <>
                            <CompletionScreen formData={formData} />
                            <Link
                                to="/login"
                                className="mt-8 w-full inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm"
                            >
                                ← Return to Login
                            </Link>
                        </>
                    ) : (
                        <>
                            <ProgressIndicator currentStep={currentStep} totalSteps={3} />
                            <div className="mt-8 overflow-hidden">
                                <div className="flex transition-transform duration-500 ease-out" >
                                    <div className="w-full shrink-0">
                                        <RenderStep />
                                    </div>
                                </div>
                            </div>
                            <Link
                                to="/login"
                                className="mt-8 w-full inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm"
                                style={{ textDecoration: 'none' }}
                            >
                                ← Return to Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
