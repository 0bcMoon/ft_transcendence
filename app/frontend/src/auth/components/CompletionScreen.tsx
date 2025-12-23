import { CheckCircle, User, Mail, Lock, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

interface CompletionScreenProps {
    formData: {
        username: string
        display_name: string
        email: string
    }
}

export default function CompletionScreen({ formData }: CompletionScreenProps) {
    return (
        <div className="w-full max-w-md">
            <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700 text-center">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Aboard!</h1>
                    <p className="text-slate-400">Your registration has been completed successfully</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                        <div className="shrink-0">
                            <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-slate-300">Profile</p>
                            <p className="text-sm text-slate-400">
                                {formData.display_name} (@{formData.username})
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                        <div className="shrink-0">
                            <Mail className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-slate-300">Email</p>
                            <p className="text-sm text-slate-400">{formData.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                        <div className="shrink-0">
                            <Lock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-slate-300">Security</p>
                            <p className="text-sm text-slate-400">Password protected &amp; verified</p>
                        </div>
                    </div>
                </div>

                <Link
                    to="/login"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/50 transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                    Get Started
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                </Link>

                <p className="text-xs text-slate-500 mt-4">You can now start using your account</p>
            </div>
        </div>
    )
}

