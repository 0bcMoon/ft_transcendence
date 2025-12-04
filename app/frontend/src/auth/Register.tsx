import { useState } from 'react';
import { Link } from "react-router-dom";
import { Activity } from 'lucide-react';
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

function Register() {
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

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden selection:bg-blue-500/30">

            {/* Background Effects - Same as Landing Page */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-[100%] blur-[100px] opacity-50"></div>
            </div>

            {/* Logo/Back to Home */}
            <div className="fixed top-6 left-6 z-50">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Activity size={18} className="text-white" />
                    </div>
                    <span>PONG<span className="text-blue-500">.IO</span></span>
                </Link>
            </div>

            {/* Register Form Container */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-800">
                        {isCompleted ? (
                            <>
                                <CompletionScreen formData={formData} />
                                <Link
                                    to="/login"
                                    className="mt-8 w-full inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                                >
                                    ← Return to Login
                                </Link>
                            </>
                        ) : (
                            <>
                                <ProgressIndicator currentStep={currentStep} totalSteps={3} />
                                <div className="mt-8 overflow-hidden">
                                    <div className="flex transition-transform duration-500 ease-out">
                                        <div className="w-full shrink-0">
                                            <RenderStep />
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to="/login"
                                    className="mt-8 w-full inline-block text-center bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 border border-slate-700"
                                >
                                    ← Return to Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
