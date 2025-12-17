// src/pages/tournament/TournamentMatch.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useTournamentMatch } from '@/game/hooks/useTournamentMatch';
import GameCanvas from '@/game/components/GameCanvas';
import PlayersHeader from '@/game/components/PlayersHeader';
import GameOver from '@/game/components/GameOver';
import WaitingOverlay from '@/game/components/WaitingOverlay';
import TournamentMatchInfo from '@/game/components/tournament/TournamentMatchInfo';
import { Trophy, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TournamentMatch() {
    const { tournamentId, matchId } = useParams<{ tournamentId: string; matchId: string }>();
    const navigate = useNavigate();

    // Validate params
    if (!tournamentId || !matchId) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl text-white mb-4">Invalid tournament or match ID</h2>
                    <Link
                        to="/tournaments"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-block"
                    >
                        Back to Tournaments
                    </Link>
                </div>
            </div>
        );
    }

    const game = useTournamentMatch(Number(tournamentId), Number(matchId));

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

    const handleBackToBracket = () => {
        navigate(`/tournaments/${tournamentId}/bracket`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header Navigation */}
            <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleBackToBracket}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base font-medium">Back to Bracket</span>
                        </button>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                            <span className="text-sm sm: text-base font-semibold text-white">
                                Tournament Match
                            </span>
                        </div>
                    </div>
                </div>
            </div>

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

                            {/* <WaitingOverlay */}
                            {/*     message="Waiting for tournament match to start..." */}
                            {/*     showSpectate={false} */}
                            {/* /> */}
                        </div>
                    )}

                    {gameState === "GAME_OVER" && game.playerNames && game.finalScore && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* <GameOver */}
                            {/*     winner={game.winner} */}
                            {/*     finalScore={game.finalScore} */}
                            {/*     playerNames={game.playerNames} */}
                            {/*     handlePlayAgain={handleBackToBracket} */}
                            {/*     navigate={handleBackToBracket} */}
                            {/*     userSide={game.side ?? 'left'} */}
                            {/* /> */}

                            <div className="text-center">
                                <button
                                    onClick={handleBackToBracket}
                                    className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold rounded-lg shadow-lg shadow-yellow-600/20 transition-all"
                                >
                                    View Tournament Bracket
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState === "PLAYING" && game.playerNames && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Tournament Match Header */}
                            <div className="bg-slate-900/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-800 p-3 sm:p-4 md:p-6">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mb-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">
                                                {game.round ? `Round ${game.round}` : 'Tournament Match'}
                                            </h2>
                                            <p className="text-xs sm:text-sm text-slate-400">
                                                {game.matchNumber ? `Match ${game.matchNumber}` : 'Tournament Game'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <PlayersHeader
                                    playerNames={game.playerNames}
                                    playerAvatars={game.playerAvatars}
                                />
                            </div>

                            {/* Game Canvas */}
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-yellow-600/20 rounded-2xl blur-xl opacity-80"></div>

                                <div className="relative bg-slate-900/80 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-slate-800 shadow-2xl shadow-black/30 overflow-hidden p-3 sm:p-4 md:p-6">
                                    <GameCanvas
                                        gameStateRef={game.gameStateRef}
                                        isGameOver={game.isGameOver}
                                        countdown={game.countdown}
                                    />
                                </div>
                            </div>

                            {/* Match Status Footer */}
                            <div className="bg-slate-900/50 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-800 p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400">
                                    <span>
                                        🎮 Playing as:  <span className="text-white font-medium">
                                            {game.side === 'left' ? 'Left Player' : 'Right Player'}
                                        </span>
                                    </span>
                                    <span>🏆 Tournament Mode</span>
                                    <span className="hidden md:inline">First to 11 points wins</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
