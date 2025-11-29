import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, Loader2, Gamepad2 } from "lucide-react";
import { useAuthStore } from "@/state/authStore";
import { MatchCard } from "../components/MatchCard"; // Adjust path as needed
import { useGetBracketData } from "@/api/queries";
import { BracketMatch, roundName } from "@/api/tournamentUtils";
import { ChampionDisplay } from "../components/ChampionDisplay";


function TournamentBracketDisplay() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);
    const tournamentId = Number(id);

    const { data: bracket, isLoading, isError } = useGetBracketData(tournamentId);
    console.log("Bracket data:", bracket);

    const groupedRounds = useMemo(() => {
        if (!bracket)
            return [];
        const byRound: Record<number, BracketMatch[]> = {};
        for (const match of bracket.matches) {
            (byRound[match.round] = byRound[match.round] || []).push(match);
        }
        const totalRounds = Math.log2(bracket.maxPlayers) | 0;
        return Object.keys(byRound).map(Number).sort((a, b) => a - b).map(roundNum => ({
            round: roundNum,
            name: roundName(roundNum, totalRounds),
            matches: byRound[roundNum],
        }));
    }, [bracket]);

    const myActiveGame = useMemo(() => {
        if (!user || !bracket) return null;
        return bracket.matches.find(match =>
            (match.status === 'waiting' || match.status === 'playing') &&
            (match.player1?.id === user.id || match.player2?.id === user.id)
        );
    }, [bracket, user]);

    const handlePlayGame = (gameId: number) => {
        if (gameId > 0) {
            navigate(`/game/tournament/play/${gameId}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 dark:bg-gray-900">
                <Loader2 className="animate-spin mr-2" /> Loading bracket...
            </div>
        );
    }

    if (isError || !bracket) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-500 dark:text-red-400 dark:bg-gray-900">
                Error loading tournament. It may not exist.
            </div>
        );
    }

    const finalMatch = bracket.matches.find(m => m.round === groupedRounds.length);

    return (
        <div className="flex flex-col w-full h-full bg-gray-50 p-4 sm:p-8 dark:bg-gray-900 overflow-auto">

            <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex p-3 rounded-full w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/40 shadow-md">
                    <Trophy size={40} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{bracket.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {bracket.players.filter(p => p.id > 0).length}/{bracket.maxPlayers} players
                </p>
            </div>

            {myActiveGame && (
                <div className="mb-6 text-center">
                    <button
                        onClick={() => handlePlayGame(myActiveGame.gameId)}
                        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white 
                                   font-medium px-6 py-3 rounded-lg shadow-lg transition-colors 
                                   animate-pulse mx-auto
                                   focus:outline-none focus:ring-2 focus:ring-green-500 
                                   focus:ring-offset-2 dark:focus:ring-offset-gray-900" >
                        <Gamepad2 size={20} />
                        {myActiveGame.status === 'playing' ? 'Continue Game' : 'Start Your Match'}
                    </button>
                </div>
            )}

            <div className="flex overflow-x-auto p-4 gap-12 justify-center">

                {groupedRounds.map(round => (
                    <div key={round.round} className="flex flex-col items-center flex-shrink-0">
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 whitespace-nowrap">
                            {round.name}
                        </h2>
                        <div className="flex flex-col gap-6 justify-around h-full">
                            {round.matches.map(match => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    </div>
                ))}

                <ChampionDisplay winner={finalMatch?.winner} />
            </div>
        </div>
    );
}

export default TournamentBracketDisplay;


