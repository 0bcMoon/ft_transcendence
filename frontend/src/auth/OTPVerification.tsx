import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react';

type OTPVerificationProps = {
    email: string;
    onVerify: (otp: string) => void;
    onResend: () => void;
    onBack: () => void;
};

const OTPVerification: React.FC<OTPVerificationProps> = ({
    email,
    onVerify,
    onResend,
    onBack
}) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Timer for resend functionality
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleInputChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return; // Only allow single digits

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];

        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }

        setOtp(newOtp);

        // Focus the next empty input or the last input
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const otpString = otp.join('');
        if (otpString.length !== 6) {
            return;
        }

        setIsLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        onVerify(otpString);
        setIsLoading(false);
    };

    const handleResend = async () => {
        if (!canResend) return;

        setIsResending(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        onResend();
        setTimer(60);
        setCanResend(false);
        setIsResending(false);
    };

    const isComplete = otp.every(digit => digit !== '');

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            {/* Header */}
            <div className="text-center mb-8">
                <button
                    onClick={onBack}
                    className="absolute top-8 left-8 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
                <p className="text-gray-600 mb-2">
                    We've sent a 6-digit verification code to
                </p>
                <p className="text-blue-600 font-semibold">{email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Input */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                        Enter verification code
                    </label>
                    <div className="flex justify-center space-x-3 mb-6">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleInputChange(index, e.target.value)}
                                onKeyDown={e => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                            />
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!isComplete || isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Verifying...
                        </div>
                    ) : (
                        'Verify Email'
                    )}
                </button>
            </form>

            {/* Resend Section */}
            <div className="text-center mt-6">
                <p className="text-gray-600 mb-3">Didn't receive the code?</p>
                {canResend ? (
                    <button
                        onClick={handleResend}
                        disabled={isResending}
                        className="text-blue-600 hover:text-blue-800 font-semibold transition-colors disabled:opacity-50"
                    >
                        {isResending ? (
                            <span className="flex items-center justify-center">
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                Sending...
                            </span>
                        ) : (
                            'Resend Code'
                        )}
                    </button>
                ) : (
                    <p className="text-gray-500">
                        Resend code in {timer}s
                    </p>
                )}
            </div>
        </div>
    );
};

export default OTPVerification;
