import { Link } from "react-router-dom"
import { History } from "lucide-react"
import { useGetGlobalMatches } from "@/game/hooks/queries"

type Props = {
    limit?: number
}

export default function RecentMatches({ limit = 6 }: Props) {
    const { data: matches = [], isLoading, isError } = useGetGlobalMatches(1, limit)

    return (
        <section className="mb-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
                    <History className="w-6 h-6 text-blue-400" />
                    Recent Matches
                </h2>

                <Link
                    to="/history"
                    className="text-blue-400 hover:text-blue-300 font-semibold text-sm px-3 transition" >
                    See all matches
                </Link>

            </div>

            <div className="rounded-2xl bg-slate-900 shadow-xl border border-slate-800 overflow-hidden">
                {/* Loading */}
                {isLoading && (
                    <div className="space-y-3 p-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 py-2 px-4 rounded-xl bg-slate-800/60 animate-pulse"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-700" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-24 bg-slate-700 rounded" />
                                    <div className="h-3 w-16 bg-slate-800 rounded" />
                                </div>
                                <div className="w-12 h-5 bg-slate-700 rounded" />
                                <div className="w-12 h-12 rounded-full bg-slate-700" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="py-10 text-center text-red-400 font-semibold">
                        Failed to load matches
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !isError && matches.length === 0 && (
                    <div className="py-10 text-center text-slate-400">
                        No recent matches
                    </div>
                )}

                {/* Matches */}
                {!isLoading && !isError && matches.length > 0 && (
                    <ul className="divide-y divide-slate-800">
                        {matches.slice(0, limit).map((match) => (
                            <li key={match.id}>
                                <Link
                                    to={`/history/${match.id}`}
                                    className="group flex items-center gap-3 py-4 px-6 hover:bg-blue-900/30 transition rounded-xl"
                                >
                                    {/* Player 1 */}
                                    <div className="flex items-center gap-3 flex-1">
                                        <img
                                            src={match.player1_profile_picture}
                                            alt={match.player1_username}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                                        />
                                        <p className="text-sm font-semibold group-hover:text-white transition">
                                            {match.player1_username}
                                        </p>
                                    </div>

                                    {/* Score + Mode */}
                                    <div className="mx-2 flex-shrink-0 flex flex-col items-center">
                                        <div className="font-extrabold text-lg">
                                            <span className="text-slate-400">
                                                {match.player1_score}
                                            </span>
                                            <span className="mx-2 text-slate-500">-</span>
                                            <span className="text-slate-400">
                                                {match.player2_score}
                                            </span>
                                        </div>

                                        <span className="text-xs text-slate-400 uppercase tracking-wide">
                                            {match.mode}
                                        </span>
                                    </div>

                                    {/* Player 2 */}
                                    <div className="flex items-center gap-3 flex-1 justify-end">
                                        <p className="text-sm font-semibold group-hover:text-white transition text-right">
                                            {match.player2_username}
                                        </p>
                                        <img
                                            src={match.player2_profile_picture}
                                            alt={match.player2_username}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                                        />
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
