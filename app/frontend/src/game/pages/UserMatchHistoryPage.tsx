import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { History, ArrowLeft, Gamepad2 } from "lucide-react";

import { useAuthStore } from "@/state/authStore";
import { useGetUserMatches } from "@/game/hooks/queries";
import Pagination from "@/component/Pagination";

export default function UserMatchHistoryPage() {
    const navigate = useNavigate();
    const { userId: userIdParam } = useParams<{ userId: string }>();

    const userId = Number(userIdParam);
    const currentUser = useAuthStore((state) => state.user);

    const [page, setPage] = useState(1);
    const limit = 15;

    const { data, isLoading, isError, } = useGetUserMatches(userId, page, limit);
    console.log(data);

    const matches = data ?? [];

    const isOwnProfile = currentUser?.id === userId;
    const hasMatches = matches.length > 0;
    const hasNextPage = matches.length >= limit;

    useEffect(() => {
        setPage(1);
    }, [userId]);

    if (!userId) {
        return (
            <div className="min-h-screen bg-slate-950 py-8 px-4 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-lg mb-4">Invalid User ID</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-blue-400 hover:text-blue-300"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all font-medium border border-transparent hover:border-slate-800"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <History className="w-6 h-6 text-blue-400" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">
                            {isOwnProfile ? "My Match History" : "Match History"}
                        </h1>
                    </div>
                </div>

                {/* Match List */}
                <div className="rounded-2xl bg-slate-900 shadow-xl border border-slate-800 overflow-hidden">
                    {/* Loading */}
                    {isLoading && (
                        <div className="space-y-3 p-6">
                            {Array.from({ length: 5 }).map((_, i) => (
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
                        <div className="py-16 text-center">
                            <p className="text-red-400 text-lg font-semibold">
                                Failed to load matches
                            </p>
                        </div>
                    )}

                    {/* Empty */}
                    {!isLoading && !isError && !hasMatches && (
                        <div className="py-16 text-center">
                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Gamepad2 className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-base text-slate-400 mb-2 font-semibold">
                                No Matches Yet
                            </p>
                            <p className="text-sm text-slate-500">
                                {isOwnProfile
                                    ? "Start playing to see your match history"
                                    : "This player hasn't played any matches yet"}
                            </p>
                        </div>
                    )}

                    {/* Matches */}
                    {!isLoading && !isError && hasMatches && (
                        <ul className="divide-y divide-slate-800">
                            {matches.map((match) => (
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
                                            <p className="text-sm font-semibold text-slate-400 group-hover:text-white transition">
                                                {match.player1_username}
                                            </p>
                                        </div>

                                        {/* Score */}
                                        <div className="font-extrabold text-lg mx-2 flex-shrink-0">
                                            <span className="text-slate-400">{match.player1_score}</span>
                                            <span className="mx-2 text-slate-500">-</span>
                                            <span className="text-slate-400">{match.player2_score}</span>
                                        </div>

                                        {/* Player 2 */}
                                        <div className="flex items-center gap-3 flex-1 justify-end">
                                            <p className="text-sm font-semibold text-slate-400 group-hover:text-white transition">
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

                {/* Pagination */}
                {!isLoading && !isError && hasMatches && (
                    <Pagination
                        currentPage={page}
                        onPageChange={setPage}
                        hasNextPage={hasNextPage}
                    />
                )}
            </div>
        </div>
    );
}
