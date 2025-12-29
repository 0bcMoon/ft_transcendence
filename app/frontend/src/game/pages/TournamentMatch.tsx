import { useParams } from 'react-router-dom';
import { useTournamentMatch } from '@/game/hooks/useTournamentMatch';
import GameCanvas from '@/game/components/GameCanvas';
import PlayersHeader from '@/game/components/PlayersHeader';
import TournamentMatchInfo from '@/game/components/tournament/TournamentMatchInfo';
import { Link } from 'react-router-dom';
import GameInstructions from '@/game/components/GameInstructions';

export default function TournamentMatch() {
    const { tournamentId, matchId } = useParams<{ tournamentId: string; matchId: string }>();

    if (!tournamentId || !matchId) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl text-white mb-4">Invalid tournament or match ID</h2>
                    <Link
                        to="/tournaments"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-block" >
                        Back to Tournaments
                    </Link>
                </div>
            </div>
        );
    }

    const game = useTournamentMatch(Number(tournamentId), Number(matchId));
    console.log("avatars:", game.playerAvatars);

    const getGameState = () => {
        if (!game.playerNames) {
            return "WAITING";
        }
        if (game.isGameOver && game.finalScore) {
            return "GAME_OVER";
        }
        return "PLAYING";
    };

    const gameState = getGameState();

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">

            {/* Main Content */}
            <div className="flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="w-full max-w-7xl mx-auto">
                    {gameState === "WAITING" && (
                        <div className="space-y-4 sm:space-y-6">
                            <TournamentMatchInfo
                                tournamentId={Number(tournamentId)}
                                matchId={Number(matchId)}
                                round={game.round}
                                matchNumber={game.matchNumber}
                            />
                        </div>
                    )}

                    <div className="space-y-6">
                        {game.playerNames && (<PlayersHeader playerNames={game.playerNames} playerAvatars={game.playerAvatars} />)}

                        {/* Game Canvas */}
                        <div className="relative">
                            <div className="absolute -inset-1 bg-blue-600/20 rounded-2xl blur-xl opacity-80"></div>

                            <div className="relative bg-slate-900/80 backdrop-blur-lg rounded-2xl border border-slate-800 shadow-2xl shadow-black/30 overflow-hidden p-4 sm:p-6">
                                <GameCanvas
                                    gameStateRef={game.gameStateRef}
                                    isGameOver={game.isGameOver}
                                    countdown={game.countdown}
                                    waiting={game.waiting}
                                />
                            </div>
                        </div>
                        <GameInstructions
                            userSide={game.side ?? "left"}
                            mode="tournament"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
