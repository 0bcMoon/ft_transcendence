import { Toaster } from "react-hot-toast";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { Loader } from "lucide-react";
import NavBar from "./navbar/NavBar";
import DarkModeToggle from "./component/DarkModeToggle";

export default function RootLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate, isLoading]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
                <Loader className="animate-spin w-10 h-10" />
            </div>
        );
    }

    return (
        <>
            {/* Toasts */}
            <Toaster
                toastOptions={{
                    duration: 5000,
                    position: "top-right",
                    className:
                        "bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200 shadow-lg",
                }}
            />

            <div className="relative min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
                <div className="absolute bottom-4 right-4 z-50">
                    <DarkModeToggle />
                </div>
                <NavBar>
                    <Outlet />
                </NavBar>
            </div>
        </>
    );
}

