import { Toaster } from "react-hot-toast";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Loader } from "lucide-react";
import NavBar from "./navbar/NavBar";
import LandingPage from "./LandingPage";

export default function RootLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const isRootPath = location.pathname === "/";

    // Show loader while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
                <Loader className="animate-spin w-10 h-10" />
            </div>
        );
    }

    // At root path "/" - show landing page if not authenticated
    if (!isAuthenticated && isRootPath) {
        return <LandingPage />;
    }

    // For all other routes - redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // User is authenticated - show protected content with layout
    return (
        <>
            {/* Toasts */}
            <Toaster
                toastOptions={{
                    duration: 5000,
                    position: "top-right",
                    className:
                        "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-200 shadow-lg border border-gray-200 dark:border-gray-700",
                }}
            />

            <div className="relative min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
                <NavBar>
                    <Outlet />
                </NavBar>
            </div>
        </>
    );
}
