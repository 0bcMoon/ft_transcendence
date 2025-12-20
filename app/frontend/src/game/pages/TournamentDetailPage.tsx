import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertTriangle, Play, Swords } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/state/authStore";

import { useRegisterTournament, useStartTournament } from "../hooks/mutations/useTournamentMutations";
import { useTournament, useUserMatch } from "../hooks/queries/useTournamentQueries";
import { TournamentHeader } from "../components/tournament/TournamentHeader";
import { TournamentTabs } from "../components/tournament/TournamentTabs";

type TabType = 'overview' | 'bracket' | 'players';

const BackButton = ({ to, children }: { to: string, children: React.ReactNode }) => (
    <Link
        to={to}
        className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors font-semibold text-sm"
    >
        <ArrowLeft size={18} />
        {children}
    </Link>
);

export default function TournamentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const tournamentId = parseInt(id || '0', 10);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const user = useAuthStore((state) => state.user);

    // Fetch tournament data
    const { data: tournament, isLoading, error } = useTournament(tournamentId);

    const { data: userMatch, isLoading: isLoadingMatch } = useUserMatch(tournamentId, !!user && tournament?.status === 'active');
    console.log('User Match:', userMatch);

    const { mutate: register, isPending: isRegistering } = useRegisterTournament();
    const { mutate: startTournament, isPending: isStarting } = useStartTournament();

    const handleRegister = () => register(tournamentId);

    const handleStart = () => {
        if (window.confirm('Are you sure you want to start this tournament? This action cannot be undone.')) {
            startTournament(tournamentId);
        }
    };

    const handlePlayMatch = () => {
        if (userMatch?.id) {
            navigate(`/game/tournament/${tournamentId}/match/${userMatch.id}`);
        }
    };

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center">
                    <Loader2 className="animate-spin text-blue-400" size={32} />
                    <p className="text-slate-400 mt-4">Loading tournament...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !tournament || isNaN(tournamentId) || tournamentId <= 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="text-center bg-slate-900 border border-slate-800 rounded-2xl p-12 max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
                        <AlertTriangle className="text-red-400" size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                        Tournament Not Found
                    </h2>
                    <p className="text-slate-400 mt-2 mb-6">
                        {error instanceof Error ? error.message : "The tournament you're looking for doesn't exist or the ID is invalid."}
                    </p>
                    <BackButton to="/game/tournaments">Back to Tournaments</BackButton>
                </div>
            </div>
        );
    }

    // Main Content
    return (
        <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                <div className="mb-6">
                    <BackButton to="/game/tournaments">Back to Tournaments</BackButton>
                </div>

                {/* Loading Match State */}
                {isLoadingMatch && tournament.status === 'active' && (
                    <div className="mb-6 bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center justify-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                            <span className="text-sm text-slate-400">Checking for your match...</span>
                        </div>
                    </div>
                )}

                {/* Play Match Button */}
                {userMatch && !isLoadingMatch && (
                    <div className="mb-6 bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-purple-900/50 border-2 border-purple-500/50 rounded-xl p-6 shadow-2xl">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative w-14 h-14">
                                    <div className="absolute inset-0 bg-purple-500/20 rounded-full flex items-center justify-center animate-bounce">
                                        <Swords className="w-7 h-7 text-purple-400" />
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping"></div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        Your Match is Ready!
                                        <span className="text-xl animate-bounce">⚔️</span>
                                    </h3>
                                    <p className="text-sm text-purple-300 mt-1">
                                        Round {userMatch.round} • Match #{userMatch.match_number}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {userMatch.player1?.username} vs {userMatch.player2?.username}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handlePlayMatch}
                                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-lg"
                            >
                                <Play className="w-5 h-5" />
                                <span>Play Match Now</span>
                            </button>
                        </div>
                    </div>
                )}

                <TournamentHeader
                    tournament={tournament}
                    onRegister={handleRegister}
                    onStart={handleStart}
                    isRegistering={isRegistering}
                    isStarting={isStarting}
                />

                <div className="mt-8">
                    <TournamentTabs
                        tournament={tournament}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </div>
            </div>
        </div>
    );
}
