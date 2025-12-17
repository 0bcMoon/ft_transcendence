import { CheckCircle, User, Mail, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CompletionScreenProps {
    formData: {
        username: string;
        display_name: string;
        email: string;
    };
}

export default function CompletionScreen({ formData }: CompletionScreenProps) {
    return (
        <div className="w-full max-w-md">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-gray-800 text-center animate-slideUp">

                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Aboard!</h1>
                    <p className="text-gray-600 dark:text-gray-400">Your registration has been completed successfully</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="shrink-0">
                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{formData.display_name} (@{formData.username})</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="shrink-0">
                            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{formData.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="shrink-0">
                            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Security</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Password protected &amp; verified</p>
                        </div>
                    </div>
                </div>

                <Link to="/login"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all duration-200 flex items-center justify-center gap-2 group">
                    Get Started
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                </Link>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    You can now start using your account
                </p>
            </div>
        </div>
    );
}
