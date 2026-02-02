import { useCallback, useState } from "react"
import { Search, MessageCircle, UserX, Users } from "lucide-react"
import UserCard from "./UserCard"
import LoadingSpinner from "./LoadingSpinner"
import { useFriends } from "../hooks/useApi"
import { useNavigate } from "react-router-dom"
import { useActiveChatStore } from "@/state/Store"
import Modal from "@/component/Model"
import type { RemoteUser } from "@/types/types"
import { useUnFriend } from "../hooks/useApi"

const FriendsList = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const { data: friends = [], isLoading, error } = useFriends()
    const navigate = useNavigate()
    const setActiveChat = useActiveChatStore((state) => state.setActiveChat)
    const [currentUserId, setcurrentUserId] = useState<number | undefined>(undefined)
    const { mutate: unfriend, isPending: isUnfriending } = useUnFriend()

    const filteredFriends = useCallback(() => {
        return friends.filter(
            (friend) =>
                friend.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (friend.username && friend.username.toLowerCase().includes(searchTerm.toLowerCase())),
        )
    }, [friends, searchTerm])()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-red-400 font-semibold">Error loading friends</p>
                <p className="text-slate-400 text-sm mt-1">Please try again later</p>
            </div>
        )
    }

    const startChat = (user: RemoteUser) => {
        setActiveChat(user)
        navigate("/chat")
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-500 w-6 h-6" />
                <input
                    name="search"
                    type="text"
                    placeholder="Search for people..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-2 text-lg border border-slate-700 
                               bg-slate-800 text-white 
                               placeholder:text-slate-500
                               rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 
                               focus:border-transparent transition-all duration-200"
                />
            </div>

            {/* Friends Count */}
            <div className="flex items-center justify-between">
                <p className="text-base text-slate-300 font-semibold">
                    {filteredFriends.length} {filteredFriends.length === 1 ? "Friend" : "Friends"}
                    {searchTerm && ` found`}
                </p>
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                        Clear search
                    </button>
                )}
            </div>

            {/* Unfriend Modal */}
            <Modal
                isOpen={currentUserId !== undefined}
                onClose={() => setcurrentUserId(undefined)}
                onDeny={() => setcurrentUserId(undefined)}
                onAccept={() => {
                    unfriend({ user_id: currentUserId! })
                    setcurrentUserId(undefined)
                }}
                title="Unfriend User"
                message="Are you sure you want to unfriend this user?  You can send them a friend request again later."
                acceptText="Unfriend"
                type="warning"
                denyText="Cancel"
            />

            {/* Friends Grid */}
            {filteredFriends.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredFriends.map((friend) => (
                            <UserCard
                                showOnlineStatus={true}
                                key={friend.id}
                                user={friend}
                                actions={[
                                    {
                                        label: "Message",
                                        icon: MessageCircle,
                                        onClick: () => startChat(friend),
                                        primary: true,
                                    },
                                    {
                                        isLoading: isUnfriending,
                                        disabled: isUnfriending,
                                        label: "Unfriend",
                                        icon: UserX,
                                        onClick: () => setcurrentUserId(friend.id),
                                        destructive: true,
                                    },
                                ]}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        {searchTerm ? (
                            <Search className="w-10 h-10 text-slate-600" />
                        ) : (
                            <Users className="w-10 h-10 text-slate-600" />
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        {searchTerm ? "No Friends Found" : "No Friends Yet"}
                    </h3>
                    <p className="text-slate-400">
                        {searchTerm ? `No friends match "${searchTerm}"` : "Start adding friends to see them here"}
                    </p>
                </div>
            )}
        </div>
    )
}

export default FriendsList

