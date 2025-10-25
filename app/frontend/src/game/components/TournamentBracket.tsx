import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trophy, Loader2 } from "lucide-react";
import { gameApi, Tournament, TournamentPlayer } from "@/api/game";
import { useAuthStore } from "@/state/authStore";

/* Local types for rendering */
type Player = { id: string; name: string };
type Match = {
    id: string;             // e.g. "1-1" => round 1, match 1
    round: number;          // 1..totalRounds
    player1: Player | null;
    player2: Player | null;
    score1: number | null;
    score2: number | null;
    winner: Player | null;
};
type BracketData = { tournament: Tournament; players: Player[]; matches: Match[] };

/* Helpers */
const roundsCount = (n: number) => Math.log2(n) | 0;
const isPlaceholder = (p: Player | null) => !p || p.id.startsWith("ph-") || p.name.startsWith("Player ");
const roundLabel = (round: number, total: number) =>
    round === total ? "Final" : round === total - 1 ? "Semifinals" : round === total - 2 ? "Quarterfinals" : `Round ${round}`;

const withPlaceholders = (joined: Player[], max: number): Player[] => {
    const out = joined.slice(0, max);
    for (let i = out.length; i < max; i++) out.push({ id: `ph-${i + 1}`, name: `Player ${i + 1}` });
    return out;
};

const buildMatches = (players: Player[]): Match[] => {
    const total = roundsCount(players.length);
    const out: Match[] = [];
    // Round 1 pairs
    for (let i = 0; i < players.length / 2; i++) {
        out.push({
            id: `1-${i + 1}`,
            round: 1,
            player1: players[i * 2] ?? null,
            player2: players[i * 2 + 1] ?? null,
            score1: null,
            score2: null,
            winner: null,
        });
    }
    // Later rounds placeholders
    for (let r = 2; r <= total; r++) {
        const cnt = Math.pow(2, total - r);
        for (let i = 0; i < cnt; i++) {
            out.push({ id: `${r}-${i + 1}`, round: r, player1: null, player2: null, score1: null, score2: null, winner: null });
        }
    }
    return out;
};

// Winner flows into next round: r,i -> r+1, ceil(i/2), slot = player1 if i odd else player2
function propagateWinner(matches: Match[], fromId: string, winner: Player): Match[] {
    const [rStr, iStr] = fromId.split("-");
    const r = Number(rStr);
    const i = Number(iStr);
    const nextRound = r + 1;
    const nextIndex = Math.ceil(i / 2);
    const nextId = `${nextRound}-${nextIndex}`;

    return matches.map((m) => {
        if (m.id !== nextId) return m;
        const putLeft = i % 2 === 1;
        return {
            ...m,
            player1: putLeft ? winner : m.player1,
            player2: !putLeft ? winner : m.player2,
        };
    });
}

/* UI */
function MatchCard({
    match,
    canReport,
    onReportWinner,
    canPlay,
    onPlay,
}: {
    match: Match;
    canReport: boolean;
    onReportWinner: (m: Match, winnerSide: "player1" | "player2") => void;
    canPlay: boolean;
    onPlay: (m: Match) => void;
}) {
    const row = (active: boolean) =>
        `px-3 py-2 rounded-lg border shadow-sm text-sm ${active ? "bg-green-100 border-green-400 text-green-700" : "bg-gray-100 border-gray-300 text-gray-700"
        }`;
    const readyToPlay = !!match.player1 && !!match.player2 && !match.winner;

    return (
        <div className="bg-white rounded-lg shadow-md p-3 w-48 text-center">
            <div className={row(match.winner?.id === match.player1?.id)}>{match.player1?.name || "TBD"}</div>
            <div className="text-gray-400 my-1 font-medium">vs</div>
            <div className={row(match.winner?.id === match.player2?.id)}>{match.player2?.name || "TBD"}</div>

            {/* For development: record the winner manually to advance bracket */}
            {canReport && readyToPlay && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onReportWinner(match, "player1")}
                        className="text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700"
                    >
                        P1 wins
                    </button>
                    <button
                        onClick={() => onReportWinner(match, "player2")}
                        className="text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700"
                    >
                        P2 wins
                    </button>
                </div>
            )}

            {/* Let a participant start the match when both players are known */}
            {canPlay && readyToPlay && (
                <button
                    onClick={() => onPlay(match)}
                    className="mt-2 w-full text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Play this match
                </button>
            )}
        </div>
    );
}

export default function TournamentBracket() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const me = useAuthStore((s) => s.user);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<BracketData | null>(null);

    useEffect(() => {
        const tid = Number(id);
        if (!tid) {
            setError("No tournament selected.");
            setLoading(false);
            return;
        }

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const [tRes, pRes] = await Promise.all([gameApi.getTournamentById(tid), gameApi.getTournamentPlayers(tid)]);

                const t = tRes.data;
                const joined = pRes.data
                    .sort(
                        (a: TournamentPlayer, b: TournamentPlayer) =>
                            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    )
                    .map<Player>((p) => ({ id: String(p.user_id), name: p.alias }));

                const players = withPlaceholders(joined, t.max_players);
                const matches = buildMatches(players);
                setData({ tournament: t, players, matches });
            } catch (e: any) {
                setError(e?.response?.data?.message || e?.message || "Failed to load bracket.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const groups = useMemo(() => {
        if (!data) return { rounds: [] as number[], byRound: {} as Record<number, Match[]>, final: undefined as Match | undefined };
        const byRound: Record<number, Match[]> = {};
        for (const m of data.matches) (byRound[m.round] ||= []).push(m);
        const rounds = Object.keys(byRound)
            .map(Number)
            .sort((a, b) => a - b);
        const final = byRound[rounds[rounds.length - 1]]?.[0];
        return { rounds, byRound, final };
    }, [data]);

    const joinedCount = useMemo(() => data?.players.filter((p) => !isPlaceholder(p)).length ?? 0, [data]);

    if (loading) {
        return (
            <div className="col-span-13 flex items-center justify-center h-full text-gray-600">
                <Loader2 className="animate-spin mr-2" /> Loading bracket...
            </div>
        );
    }

    if (!data) {
        return (
            <div className="col-span-13 flex flex-col items-center justify-center h-full text-gray-500">
                {error || "No bracket data."}
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
                >
                    Back
                </button>
            </div>
        );
    }

    const totalRounds = groups.rounds.length;
    const amParticipant = !!me && data.players.some((p) => p.name === me.username);

    const setWinner = (m: Match, winnerSide: "player1" | "player2") => {
        const winner = winnerSide === "player1" ? m.player1 : m.player2;
        if (!winner) return;

        setData((prev) => {
            if (!prev) return prev;
            // Set winner on this match
            let nextMatches = prev.matches.map((mm) => (mm.id === m.id ? { ...mm, winner } : mm));
            // Propagate to next round
            nextMatches = propagateWinner(nextMatches, m.id, winner);
            return { ...prev, matches: nextMatches };
        });
    };

    const handlePlay = (m: Match) => {
        // Navigate to your tournament play route; if you scope by tournament id, pass it
        navigate(`/game/tournament/play`);
    };

    const champion = groups.final?.winner;

    return (
        <div className="col-span-13 flex flex-col items-center w-full h-full bg-linear-to-br from-gray-50 to-blue-50 px-4 py-8 overflow-x-auto">
            <div className="text-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center shadow">
                    <Trophy size={28} className="text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">{data.tournament.name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                    {joinedCount}/{data.tournament.max_players} joined • Status: {data.tournament.status}
                </p>
            </div>

            <div
                className="grid gap-x-8"
                style={{ gridTemplateColumns: `repeat(${totalRounds + 1}, minmax(192px, 1fr))`, alignItems: "start" }}
            >
                {groups.rounds.map((r) => (
                    <div key={r} className="grid gap-5">
                        <h2 className="text-center font-semibold text-gray-700 text-sm">{roundLabel(r, totalRounds)}</h2>
                        {groups.byRound[r]?.map((m) => {
                            const iAmIn = [m.player1?.name, m.player2?.name].includes(me?.username || "");
                            return (
                                <div key={m.id} className="flex justify-center">
                                    <MatchCard
                                        match={m}
                                        canReport={true} // Simple/manual progression; replace by backend result later
                                        onReportWinner={setWinner}
                                        canPlay={amParticipant && iAmIn}
                                        onPlay={handlePlay}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ))}

                <div className="grid">
                    <h2 className="text-center font-semibold text-gray-700 text-sm">Champion</h2>
                    <div className="flex justify-center items-center">
                        <div className="bg-gray-100 border border-gray-300 rounded-lg shadow-md p-3 w-48 text-center">
                            <span className="text-gray-700 font-medium">{champion?.name || "TBD"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
