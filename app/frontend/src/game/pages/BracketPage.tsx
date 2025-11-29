import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, Loader2, Gamepad2, Users, Crown, Sparkles } from "lucide-react";
import { useAuthStore } from "@/state/authStore";
import { useGetBracketData } from "../api/queries";
import { BracketMatch, roundName } from "../utils/tournamentUtils";
import { MatchCard } from "../components/MatchCard";

export default function TournamentBracketDisplay() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);

    const { data: bracket, isLoading, isError } = useGetBracketData(Number(id));

    const groupedRounds = useMemo(() => {
        if (!bracket) return [];
        const byRound: Record<number, BracketMatch[]> = {};
        bracket.matches.forEach(match => {
            (byRound[match.round] = byRound[match.round] || []).push(match);
        });
        const totalRounds = Math.log2(bracket.maxPlayers);
        return Object.keys(byRound)
            .map(Number)
            .sort((a, b) => a - b)
            .map(roundNum => ({
                round: roundNum,
                name: roundName(roundNum, totalRounds),
                matches: byRound[roundNum],
            }));
    }, [bracket]);

    const myActiveGame = useMemo(() => {
        if (!user || !bracket) return null;
        return bracket.matches.find(
            match => (match.status === 'waiting' || match.status === 'playing') &&
                (match.player1?.id === user.id || match.player2?.id === user.id)
        );
    }, [bracket, user]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 mr-3" size={32} />
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading bracket... </span>
            </div>
        );
    }

    if (isError || !bracket) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <p className="text-lg text-red-600 dark:text-red-400">Error loading tournament</p>
            </div>
        );
    }

    const finalMatch = bracket.matches.find(m => m.round === groupedRounds.length);
    const champion = finalMatch?.winner;
    const activePlayers = bracket.players.filter(p => p.id > 0).length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 overflow-auto">

            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 shadow-lg mb-4">
                    <Trophy size={48} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{bracket.name}</h1>
                <div className="flex items-center justify-center gap-2 text-base text-gray-600 dark:text-gray-400">
                    <Users size={18} />
                    <span className="font-semibold">{activePlayers}/{bracket.maxPlayers} players</span>
                </div>
            </div>

            {myActiveGame && (
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-400/50 dark:border-green-500/40 rounded-xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Gamepad2 size={28} className="text-green-600 dark:text-green-400" />
                            <div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">Your Match is Ready! </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {myActiveGame.status === 'playing' ? 'Continue your game' : 'Start playing now'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/game/tournament/play/${myActiveGame.gameId}`)}
                            className="bg-green-600 hover:bg-green-700 text-white text-lg font-semibold px-6 py-3 rounded-lg transition shadow-lg" >
                            {myActiveGame.status === 'playing' ? 'Continue' : 'Play Now'}
                        </button>
                    </div>
                </div>
            )}

            <div className="flex overflow-x-auto gap-12 justify-center pb-8 items-center">
                {groupedRounds.map(round => (
                    <div key={round.round} className="flex flex-col items-center flex-shrink-0">
                        <div className="mb-6">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 shadow-md">
                                <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                                    {round.name}
                                </h2>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6 justify-center items-center">
                            {round.matches.map(match => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    </div>
                ))}

                {champion && (
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className="mb-6">
                            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 border-2 border-yellow-400/50 dark:border-yellow-500/50 rounded-xl px-5 py-3 shadow-md">
                                <h2 className="text-base font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">
                                    Champion
                                </h2>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400/60 dark:border-yellow-500/60 rounded-2xl p-8 text-center shadow-xl w-64">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Sparkles size={20} className="text-yellow-500 dark:text-yellow-400" />
                                <Crown size={32} className="text-yellow-500 dark:text-yellow-400 animate-pulse" />
                                <Sparkles size={20} className="text-yellow-500 dark:text-yellow-400" />
                            </div>
                            <div className="bg-yellow-400/30 dark:bg-yellow-500/30 p-4 rounded-full inline-flex mb-4">
                                <Trophy size={48} className="text-yellow-600 dark:text-yellow-300" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mb-1">{champion.name}</p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400 font-semibold">Victory Royale</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
