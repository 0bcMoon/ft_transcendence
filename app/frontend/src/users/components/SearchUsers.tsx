import type React from "react"

import { useState, useRef } from "react"
import { Search, User2 } from "lucide-react"
import UserCard from "./UserCard"
import LoadingSpinner from "./LoadingSpinner"
import { useSearchUsers } from "../hooks/useApi"
import { useNavigate } from "react-router-dom"

const SearchUsers = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const navigate = useNavigate()
    const { data: users = [], isLoading, error } = useSearchUsers(searchTerm)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }
        const value = e.target.value
        timerRef.current = setTimeout(() => {
            setSearchTerm(value)
        }, 400)
    }

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                    name="search"
                    type="text"
                    placeholder="Search for people..."
                    onChange={handleChange}
                    className="w-full pl-14 pr-6 py-3 border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            </div>

            {/* Search Results */}
            {searchTerm.length > 0 ? (
                <>
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner size="md" />
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <p className="text-red-400">Error searching users. Please try again.</p>
                        </div>
                    )}

                    {!isLoading && !error && (
                        <>
                            {users.length > 0 && (
                                <p className="text-slate-400">
                                    {users.length} {users.length === 1 ? "result" : "results"} found
                                </p>
                            )}

                            {/* Results Grid */}
                            {users.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {users.map((user) => (
                                        <UserCard
                                            key={user.id}
                                            user={user}
                                            actions={[
                                                {
                                                    label: "View Profile",
                                                    icon: User2,
                                                    onClick: () => navigate(`/users/${user.id}`),
                                                    primary: true,
                                                },
                                            ]}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-400">No users found matching "{searchTerm}"</p>
                                </div>
                            )}
                        </>
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400">Start typing to search for people</p>
                </div>
            )}
        </div>
    )
}

export default SearchUsers

