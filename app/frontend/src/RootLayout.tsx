import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Loader } from "lucide-react";
import SideBar from "./navbar/SideBar"
import TopBar from "./navbar/TopBar"
import LandingPage from "./LandingPage";

export default function RootLayout() {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()
    const isRootPath = location.pathname === "/"
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
                <Loader className="animate-spin w-10 h-10" />
            </div>
        )
    }

    if (!isAuthenticated && isRootPath) {
        return <LandingPage />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return (
        <>
            <Toaster
                toastOptions={{
                    duration: 5000,
                    position: "top-right",
                    className: "bg-slate-900 text-white shadow-lg border border-slate-700",
                }}
            />
            <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
                {/* Navigation Sidebar */}
                <SideBar isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                {/* Main Content Area */}
                <div className="flex flex-col flex-1 lg:ml-20 overflow-hidden">
                    {/* Top Bar */}
                    <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
                    {/* Page Content */}
                    <main className="flex-1 overflow-auto pt-16">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    )
}
