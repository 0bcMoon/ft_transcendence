import { Link, useNavigate } from "react-router-dom";
import { History, ArrowLeft, Gamepad2, Loader2, AlertCircle } from "lucide-react";
import { useGetGlobalMatches } from "@/game/hooks/queries";
import { useState } from "react";
import Pagination from "@/component/Pagination";

export default function HistoryPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const limit = 15;

    const { data: matches = [], isLoading, isError } = useGetGlobalMatches(page, limit);

    const hasMatches = matches.length > 0;
    const hasNextPage = matches.length === limit;

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-6 sm:py-8">
            <div className="max-w-6xl mx-auto space-y-6">

                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition" >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="flex items-center gap-3">
                    <History className="w-6 h-6 text-blue-400" />
                    <h1 className="text-3xl font-bold text-white">
                        Global Match History
                    </h1>
                </div>

                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    {isLoading && (
                        <div className="flex items-center justify-center p-20">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        </div>
                    )}

                    {isError && (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <AlertCircle className="w-16 h-16 text-red-500" />
                            <p className="text-xl text-slate-300">Failed to load matches</p>
                        </div>
                    )}

                    {!isLoading && !isError && !hasMatches && (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center">
                                <Gamepad2 className="w-8 h-8 text-slate-600" />
                            </div>
                            <div className="text-center">
                                <p className="text-xl text-slate-300 mb-2">No Matches Yet</p>
                                <p className="text-sm text-slate-500">
                                    No matches have been played yet
                                </p>
                            </div>
                        </div>
                    )}

                    {!isLoading && !isError && hasMatches && (
                        <ul className="divide-y divide-slate-800">
                            {matches.map((match) => (
                                <li key={match.id}>
                                    <Link
                                        to={`/history/${match.id}`}
                                        className="flex items-center gap-4 p-6 hover:bg-slate-800 transition" >

                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <img
                                                src={match.player1_profile_picture}
                                                alt={match.player1_username}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-700" />
                                            <span className="text-sm font-semibold text-slate-300 truncate">
                                                {match.player1_username}
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-center gap-1">
                                            <div className="text-lg font-bold">
                                                <span className="text-white">{match.player1_score}</span>
                                                <span className="text-slate-600 mx-2">-</span>
                                                <span className="text-white">{match.player2_score}</span>
                                            </div>
                                            <span className="text-xs text-slate-500 uppercase">
                                                {match.mode}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                                            <span className="text-sm font-semibold text-slate-300 truncate text-right">
                                                {match.player2_username}
                                            </span>
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
