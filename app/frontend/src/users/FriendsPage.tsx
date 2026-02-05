import { useState } from "react"
import { Search, Users, UserPlus, UserX, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import FriendsList from "./components/FriendsList"
import SearchUsers from "./components/SearchUsers"
import FriendRequests from "./components/FriendRequests"
import BlockedUsers from "./components/BlockedUsers"

type TabType = "friends" | "search" | "requests" | "blocked"

const FriendsPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>("friends")
    const navigate = useNavigate()

    const handleGoBack = () => navigate(-1)

    const tabs = [
        { id: "friends" as TabType, label: "Friends", icon: Users },
        { id: "search" as TabType, label: "Search Users", icon: Search },
        { id: "requests" as TabType, label: "Requests", icon: UserPlus },
        { id: "blocked" as TabType, label: "Blocked", icon: UserX },
    ]

    const RenderContent = () => {
        switch (activeTab) {
            case "friends":
                return <FriendsList />
            case "search":
                return <SearchUsers />
            case "requests":
                return <FriendRequests />
            case "blocked":
                return <BlockedUsers />
            default:
                return <FriendsList />
        }
    }

    return (
        <div className="h-full overflow-y-auto no-scrollbar bg-slate-950 py-6 px-4">
            <div className="max-w-6xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Friends</h1>
                    <p className="text-base text-slate-400">Manage your connections and discover new people</p>
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-800 mb-6 overflow-hidden shadow-sm">
                    <div className="flex overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center justify-center gap-2 px-6 sm:px-8
                                                py-4 font-semibold whitespace-nowrap transition-all duration-200
                                                border-b-2 text-base flex-1 sm:flex-initial
                                        ${isActive
                                            ? "text-blue-400 border-blue-400 bg-blue-500/10"
                                            : "text-slate-400 border-transparent hover:text-white hover:bg-slate-800"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 sm:p-8 shadow-sm">
                    <RenderContent />
                </div>
            </div>
        </div>
    )
}

export default FriendsPage

