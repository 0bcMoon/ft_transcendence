import { Link } from "react-router-dom"
import { Trophy } from "lucide-react"
import { useGetTopPlayers } from "@/game/hooks/queries"

export default function TopPlayers() {

    const { data: topPlayers = [], isLoading, isError } = useGetTopPlayers(6)

    return (
        <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-blue-400" />
                    Top Players
                </h2>
                <Link to="/leaderboard" className="text-blue-400 hover:text-blue-300 font-semibold text-sm px-3 transition">
                    See leaderboard
                </Link>
            </div>
            
            <div className="rounded-2xl bg-slate-900 shadow-xl border border-slate-800 overflow-hidden p-0">
                {isLoading && (
                    <div className="space-y-3 p-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-2 px-4 rounded-xl bg-slate-800/60 animate-pulse">
                                <div className="w-8 h-8 bg-slate-700 rounded" />
                                <div className="w-12 h-12 rounded-full bg-slate-700" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-32 bg-slate-700 rounded" />
                                    <div className="h-3 w-24 bg-slate-800 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {isError && (
                    <div className="py-10 text-center text-red-400 font-semibold text-base">
                        Failed to load top players
                    </div>
                )}
                
                {!isLoading && !isError && topPlayers.length === 0 && (
                    <div className="py-10 text-center text-slate-400 text-base">
                        No players found
                    </div>
                )}
                
                {!isLoading && !isError && topPlayers.length > 0 && (
                    <ul className="divide-y divide-slate-800">
                        {topPlayers. map((player, index) => (
                            <li key={player.id}>
                                <Link
                                    to={`/users/${player.id}`}
                                    className="group flex items-center gap-4 py-4 px-6 bg-transparent hover:bg-blue-900/30 transition rounded-xl block" >
                                    {/* Rank Number */}
                                    <div className="w-8 text-center flex-shrink-0">
                                        <span className="text-lg font-bold text-slate-400 group-hover:text-blue-300 transition">
                                            {index + 1}
                                        </span>
                                    </div>
                                    
                                    {/* Avatar */}
                                    <img
                                        src={player.profile_picture}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 flex-shrink-0" />
                                    
                                    {/* Player Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-blue-200 group-hover:text-white transition">
                                                {player.username}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Stats */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-bold text-blue-300">
                                            {player.total_xp} XP
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}
