import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

type Player = { id: string; name: string };
type Match = {
    id: string;
    round: number;
    player1: Player | null;
    player2: Player | null;
    score1: number | null;
    score2: number | null;
    winner: Player | null;
};
type TournamentBracket = {
    id: string;
    name: string;
    players: Player[];
    matches: Match[];
};

export default function TournamentBracket() {
    const [tournament, setTournament] = useState<TournamentBracket | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem("tournament");
        if (stored) {
            setTournament(JSON.parse(stored));
        }
    }, []);

    if (!tournament) {
        return (
            <div className="col-span-13 flex items-center justify-center h-full text-gray-500">
                No tournament data found.
            </div>
        );
    }

    // Group matches by round
    const rounds: Record<number, Match[]> = {};
    tournament.matches.forEach((m) => {
        if (!rounds[m.round]) rounds[m.round] = [];
        rounds[m.round].push(m);
    });

    const sortedRounds = Object.keys(rounds)
        .map(Number)
        .sort((a, b) => a - b);

    const totalRounds = sortedRounds.length;
    const finalRound = sortedRounds[totalRounds - 1];
    const finalMatch = rounds[finalRound][0];

    return (
        <div className="col-span-13 flex flex-col items-center w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 px-2 sm:px-4 py-4 sm:py-8 overflow-x-auto">
            {/* Title */}
            <div className="text-center mb-6 sm:mb-8">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow">
                    <Trophy size={24} className="sm:size-8 text-blue-600" />
                </div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-800">{tournament.name}</h1>
            </div>

            {/* Bracket Grid */}
            <div
                className="grid gap-x-4 sm:gap-x-8 md:gap-x-16"
                style={{
                    gridTemplateColumns: `repeat(${totalRounds + 1}, minmax(140px, 1fr))`, // +1 for champion
                    alignItems: "center",
                }}
            >
                {sortedRounds.map((round) => {
                    const matches = rounds[round];
                    const rowSpan = Math.pow(2, round - 1);

                    return (
                        <div key={round} className="grid" style={{ gap: "1.5rem" }}>
                            <h2 className="text-center font-semibold text-gray-700 text-sm sm:text-base mb-2 sm:mb-4">
                                {roundName(round, totalRounds)}
                            </h2>
                            {matches.map((match, idx) => (
                                <div
                                    key={match.id}
                                    style={{
                                        gridRowStart: idx * rowSpan + 1,
                                        gridRowEnd: `span ${rowSpan}`,
                                    }}
                                    className="flex justify-center"
                                >
                                    <MatchCard match={match} />
                                </div>
                            ))}
                        </div>
                    );
                })}

                {/* Champion Column aligned with Final */}
                <div className="grid">
                    <h2 className="text-center font-semibold text-gray-700 text-sm sm:text-base mb-2 sm:mb-4">
                        Champion
                    </h2>
                    <div
                        className="flex justify-center items-center"
                        style={{
                            gridRowStart: 1,
                            gridRowEnd: `span ${Math.pow(2, finalRound - 1)}`,
                        }}
                    >
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

function MatchCard({ match }: { match: Match }) {
    const playerClasses = (isWinner: boolean) =>
        `px-2 sm:px-4 py-1 sm:py-2 rounded-lg border shadow-sm text-sm sm:text-base ${isWinner
            ? "bg-green-100 border-green-400 text-green-700 font-semibold"
            : "bg-gray-100 border-gray-300 text-gray-700"
        }`;

    return (
        <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 w-36 sm:w-48 text-center">
            <div className={playerClasses(match.winner?.id === match.player1?.id)}>
                {match.player1?.name || "TBD"}
            </div>
            <div className="text-gray-400 my-1 font-medium">vs</div>
            <div className={playerClasses(match.winner?.id === match.player2?.id)}>
                {match.player2?.name || "TBD"}
            </div>
        </div>
    );
}

function roundName(round: number, totalRounds: number) {
    if (round === totalRounds) return "Final";
    if (round === totalRounds - 1) return "Semifinals";
    if (round === totalRounds - 2) return "Quarterfinals";
    return `Round ${round}`;
}

