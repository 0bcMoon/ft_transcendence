import React from 'react';
import { Check } from 'lucide-react';

interface SuccessMessageProps {
    message: string;
}

function SuccessMessage({ message }: SuccessMessageProps) {
    if (!message) return null;

    return (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{message}</span>
        </div>
    );
}

export default SuccessMessage;
