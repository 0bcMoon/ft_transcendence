import { Link } from "react-router-dom"
import { Home } from "lucide-react"

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
            <div className="text-center space-y-8 max-w-md mx-auto">
                <div className="space-y-4">
                    <h1 className="text-9xl font-black text-white tracking-tight">404</h1>
                    <div className="w-24 h-1 bg-white mx-auto"></div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
                    <p className="text-slate-400 leading-relaxed">The page you're looking for doesn't exist or has been moved.</p>
                </div>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors" >
                    <Home className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>
        </div>
    )
}
