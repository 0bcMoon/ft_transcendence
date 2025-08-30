import { X, Check, AlertTriangle } from 'lucide-react';

export interface IModal {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    onDeny: () => void;
    title: string;
    message?: string;
    acceptText?: string;
    denyText?: string;
    type?: 'default' | 'warning' | 'danger';
}

const Modal: React.FC<IModal> = ({
    isOpen,
    onClose,
    onAccept,
    onDeny,
    title,
    message,
    acceptText = 'Accept',
    denyText = 'Deny',
    type = 'default'
}) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
                    acceptButton: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500',
                    iconBg: 'bg-amber-100'
                };
            case 'danger':
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
                    acceptButton: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
                    iconBg: 'bg-red-100'
                };
            default:
                return {
                    icon: <Check className="w-6 h-6 text-blue-500" />,
                    acceptButton: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
                    iconBg: 'bg-blue-100'
                };
        }
    };

    const typeStyles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                    <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>

                <div className="p-8">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-full ${typeStyles.iconBg} flex items-center justify-center mx-auto mb-6`}>
                        {typeStyles.icon}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
                        {title}
                    </h2>

                    {/* Message */}
                    {message && (
                        <p className="text-gray-600 text-center mb-8 leading-relaxed">
                            {message}
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onDeny}
                            className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                        >
                            {denyText}
                        </button>
                        <button
                            onClick={onAccept}
                            className={`flex-1 px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${typeStyles.acceptButton}`}
                        >
                            {acceptText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
