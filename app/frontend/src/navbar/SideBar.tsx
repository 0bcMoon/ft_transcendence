import { useLocation, Link } from "react-router-dom"
import { useAuthStore } from "@/state/authStore"
import { Home, Settings, Gamepad2, ContactRound, MessageCircle, User2 } from "lucide-react"

interface SideBarProps {
    isSidebarOpen: boolean
    onClose: () => void
}

export default function SideBar({ isSidebarOpen, onClose }: SideBarProps) {
    const currentUser = useAuthStore((s) => s.user)
    const location = useLocation()

    const navItems = [
        { link: "/", label: "Home", icon: Home },
        { link: "/game", label: "Game", icon: Gamepad2 },
        { link: "/chat", label: "Chat", icon: MessageCircle },
        { link: "/users", label: "Friends", icon: ContactRound },
        { link: currentUser ? `/users/${currentUser.id}` : "/profile", label: "Profile", icon: User2 },
        { link: "/settings", label: "Settings", icon: Settings },
    ]

    return (
        <>
            {/* Backdrop - Mobile only */}
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen z-50
                            w-20 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/50
                            transform transition-all duration-300 ease-in-out
                            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                {/* Logo/Brand */}
                <div className="flex items-center justify-center h-20 border-b border-slate-800/50">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col items-center py-6 space-y-2 px-3">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.link

                        return (
                            <Link
                                key={item.link}
                                to={item.link}
                                onClick={onClose}
                                className={`group relative w-14 h-14 rounded-xl flex items-center justify-center
                                          transition-all duration-200
                                          ${isActive ? "bg-slate-800" : "hover:bg-slate-800/50"}`}
                                title={item.label}
                            >
                                <Icon
                                    className={`w-6 h-6 transition-colors duration-200
                                              ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"}`}
                                />

                                {/* Tooltip */}
                                <div
                                    className="absolute left-full ml-4 px-3 py-2 bg-slate-900 border border-slate-700 
                                              rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                              transition-all duration-200 whitespace-nowrap z-50 pointer-events-none"
                                >
                                    <span className="text-sm font-medium text-white">{item.label}</span>
                                </div>
                            </Link>
                        )
                    })}
                </nav>
            </aside>
        </>
    )
}

