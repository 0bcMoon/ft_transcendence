import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, Loader2, Gamepad2 } from "lucide-react";
import { gameApi, Tournament as ApiTournament, TournamentPlayer } from "@/api/game";
import { useAuthStore } from "@/state/authStore";

// Types kept minimal and local
type Player = { id: string; name: string };
type Match = {
    id: string;
    gameId: number;
    round: number;
    player1: Player | null;
    player2: Player | null;
    score1: number | null;
    score2: number | null;
    winner: Player | null;
    status: string;
};

type TournamentBracket = {
    id: string;
    name: string;
    players: Player[];
    matches: Match[];
    status: string;
    maxPlayers: number;
};

// Helpers
function roundName(round: number, totalRounds: number) {
    if (round === totalRounds) return "Final";
    if (round === totalRounds - 1) return "Semifinals";
    if (round === totalRounds - 2) return "Quarterfinals";
    return `Round ${round}`;
}

function buildPlayersWithPlaceholders(registered: Player[], maxPlayers: number): Player[] {
    const out = [...registered];
    for (let i = out.length; i < maxPlayers; i++) {
        out.push({ id: `ph-${i + 1}`, name: "TBD" });
    }
    return out;
}

function buildMatchesFromBracketData(bracketData: any, players: Player[]): Match[] {
    if (!bracketData?.games || bracketData.games.length === 0) {
        // Fallback: build empty bracket structure
        return buildEmptyMatches(players);
    }

    // Convert API games to Match format
    const matches: Match[] = bracketData.games.map((game: any) => {
        const player1 = game.player1_id
            ? { id: String(game.player1_id), name: game.player1_name || "TBD" }
            : null;
        const player2 = game.player2_id
            ? { id: String(game.player2_id), name: game.player2_name || "TBD" }
            : null;

        let winner: Player | null = null;
        if (game.winner_id) {
            if (game.winner_id === game.player1_id) {
                winner = player1;
            } else if (game.winner_id === game.player2_id) {
                winner = player2;
            }
        }

        return {
            id: `${game.round}-${game.match_order}`,
            gameId: game.game_id,
            round: game.round,
            player1,
            player2,
            score1: game.player1_score ?? null,
            score2: game.player2_score ?? null,
            winner,
            status: game.status || 'waiting',
        };
    });

    return matches;
}

function buildEmptyMatches(players: Player[]): Match[] {
    const totalPlayers = players.length;
    const totalRounds = Math.log2(totalPlayers) | 0;
    const matches: Match[] = [];

    // Round 1
    for (let i = 0; i < totalPlayers; i += 2) {
        matches.push({
            id: `1-${i / 2 + 1}`,
            gameId: 0,
            round: 1,
            player1: players[i] ?? null,
            player2: players[i + 1] ?? null,
            score1: null,
            score2: null,
            winner: null,
            status: 'waiting',
        });
    }

    // Future rounds placeholders
    for (let r = 2; r <= totalRounds; r++) {
        const matchCount = Math.pow(2, totalRounds - r);
        for (let i = 0; i < matchCount; i++) {
            matches.push({
                id: `${r}-${i + 1}`,
                gameId: 0,
                round: r,
                player1: null,
                player2: null,
                score1: null,
                score2: null,
                winner: null,
                status: 'waiting',
            });
        }
    }
    return matches;
}

function MatchCard({ match }: { match: Match }) {
    const playerClasses = (isWinner: boolean) =>
        `px-2 sm:px-4 py-1 sm:py-2 rounded-lg border shadow-sm text-sm sm:text-base ${isWinner
            ? "bg-green-100 border-green-400 text-green-700 font-semibold"
            : "bg-gray-100 border-gray-300 text-gray-700"
        }`;

    const showScores = match.score1 !== null || match.score2 !== null;

    return (
        <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 w-36 sm:w-48 text-center">
            <div className={playerClasses(match.winner?.id === match.player1?.id)}>
                <div className="flex justify-between items-center">
                    <span className="truncate">{match.player1?.name || "TBD"}</span>
                    {showScores && <span className="font-bold ml-2">{match.score1 ?? 0}</span>}
                </div>
            </div>
            <div className="text-gray-400 my-1 font-medium">vs</div>
            <div className={playerClasses(match.winner?.id === match.player2?.id)}>
                <div className="flex justify-between items-center">
                    <span className="truncate">{match.player2?.name || "TBD"}</span>
                    {showScores && <span className="font-bold ml-2">{match.score2 ?? 0}</span>}
                </div>
            </div>

        </div>
    );
}

export default function TournamentBracket() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);

    const [loading, setLoading] = useState(true);
    const [bracket, setBracket] = useState<TournamentBracket | null>(null);

    useEffect(() => {
        const tid = Number(id);
        if (!tid) {
            setLoading(false);
            return;
        }

        const load = async () => {
            setLoading(true);
            try {
                // Fetch tournament and players
                const [tournament, registered] = await Promise.all([
                    gameApi.getTournament(tid),
                    gameApi.listPlayers(tid),
                ]);

                if (!tournament) {
                    setBracket(null);
                    return;
                }

                const regPlayers: Player[] = registered
                    .sort((a: TournamentPlayer, b: TournamentPlayer) => a.registered_at.localeCompare(b.registered_at))
                    .map(p => ({ id: String(p.user_id), name: p.alias }));

                const players = buildPlayersWithPlaceholders(regPlayers, tournament.max_players);

                // If tournament has started, fetch bracket data
                let matches: Match[];
                if (tournament.status === "active" || tournament.status === "finished") {
                    try {
                        const bracketData = await gameApi.getBracket(tid);
                        matches = buildMatchesFromBracketData(bracketData, players);
                    } catch (err) {
                        console.error("Failed to fetch bracket:", err);
                        matches = buildEmptyMatches(players);
                    }
                } else {
                    // Registration phase: build empty structure
                    matches = buildEmptyMatches(players);
                }

                setBracket({
                    id: String(tournament.id),
                    name: tournament.name,
                    players,
                    matches,
                    status: tournament.status,
                    maxPlayers: tournament.max_players,
                });
            } catch (err) {
                console.error("Failed to load tournament:", err);
                setBracket(null);
            } finally {
                setLoading(false);
            }
        };

        load();

        // Auto-refresh during active tournament
        const interval = setInterval(() => {
            if (bracket?.status === "active") {
                load();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [id]);

    const grouped = useMemo(() => {
        if (!bracket) return { rounds: [] as number[], byRound: {} as Record<number, Match[]>, final: undefined as Match | undefined };
        const byRound: Record<number, Match[]> = {};
        for (const m of bracket.matches) (byRound[m.round] ||= []).push(m);
        const rounds = Object.keys(byRound).map(Number).sort((a, b) => a - b);
        const final = byRound[rounds[rounds.length - 1]]?.[0];
        return { rounds, byRound, final };
    }, [bracket]);

    // Find user's active game
    const myActiveGame = useMemo(() => {
        if (!user || !bracket) return null;
        const userId = String(user.id);

        return bracket.matches.find(match =>
            (match.status === 'waiting' || match.status === 'playing') &&
            (match.player1?.id === userId || match.player2?.id === userId)
        );
    }, [bracket, user]);

    const handlePlayGame = () => {
        if (myActiveGame && myActiveGame.gameId) {
            navigate(`/game/tournament/play/${myActiveGame.gameId}`);
        }
    };

    if (loading) {
        return (
            <div className="col-span-13 flex items-center justify-center h-full text-gray-500">
                <Loader2 className="animate-spin mr-2" /> Loading bracket...
            </div>
        );
    }

    if (!bracket) {
        return (
            <div className="col-span-13 flex items-center justify-center h-full text-gray-500">
                No tournament data found.
            </div>
        );
    }

    const totalRounds = grouped.rounds.length;
    const finalRound = grouped.rounds[totalRounds - 1];
    const finalMatch = grouped.byRound[finalRound]?.[0];

    return (
        <div className="col-span-13 flex flex-col items-center w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 px-2 sm:px-4 py-4 sm:py-8 overflow-x-auto">
            {/* Title */}
            <div className="text-center mb-4 sm:mb-6">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow">
                    <Trophy size={24} className="sm:size-8 text-blue-600" />
                </div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-800">{bracket.name}</h1>
                <p className="text-sm text-gray-600 mt-2">
                    Status: {bracket.status} • {bracket.players.filter(p => !p.id.startsWith("ph-")).length}/{bracket.maxPlayers} joined
                </p>
            </div>

            {/* Play Game Button (when user has an active game) */}
            {myActiveGame && (
                <div className="mb-6">
                    <button
                        onClick={handlePlayGame}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition-colors animate-pulse"
                    >
                        <Gamepad2 size={20} />
                        {myActiveGame.status === 'playing' ? 'Continue Game' : 'Start Your Game'}
                    </button>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                        {myActiveGame.player1?.name} vs {myActiveGame.player2?.name}
                    </p>
                </div>
            )}

            {/* Bracket Grid */}
            <div
                className="grid gap-x-4 sm:gap-x-8 md:gap-x-16"
                style={{ gridTemplateColumns: `repeat(${totalRounds + 1}, minmax(140px, 1fr))`, alignItems: "center" }}
            >
                {grouped.rounds.map((round) => {
                    const matches = grouped.byRound[round];
                    const rowSpan = Math.pow(2, round - 1);
                    return (
                        <div key={round} className="grid" style={{ gap: "1.5rem" }}>
                            <h2 className="text-center font-semibold text-gray-700 text-sm sm:text-base mb-2 sm:mb-4">
                                {roundName(round, totalRounds)}
                            </h2>
                            {matches.map((match, idx) => (
                                <div
                                    key={match.id}
                                    style={{ gridRowStart: idx * rowSpan + 1, gridRowEnd: `span ${rowSpan}` }}
                                    className="flex justify-center"
                                >
                                    <MatchCard match={match} />
                                </div>
                            ))}
                        </div>
                    );
                })}

                {/* Champion */}
                <div className="grid">
                    <h2 className="text-center font-semibold text-gray-700 text-sm sm:text-base mb-2 sm:mb-4">Champion</h2>
                    <div className="flex justify-center items-center" style={{ gridRowStart: 1, gridRowEnd: `span ${Math.pow(2, (totalRounds || 1) - 1)}` }}>
                        {finalMatch?.winner ? (
                            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-md p-2 sm:p-4 w-36 sm:w-48 text-center">
                                <div className="flex flex-col items-center gap-1 font-bold text-yellow-700 text-sm sm:text-base">
                                    <Trophy className="text-yellow-500" size={20} /> {finalMatch.winner.name}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-100 border border-gray-300 rounded-lg shadow-md p-2 sm:p-4 w-36 sm:w-48 text-center text-gray-500 text-sm sm:text-base">
                                TBD
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
