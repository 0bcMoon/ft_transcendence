import { useParams, useNavigate } from "react-router-dom";
import {
    Trophy, Users, Calendar, ArrowLeft,
    UserPlus, Award, Zap, GitBranch,
    Info, UserCircle, FileText, UserMinus, Crown
} from "lucide-react";
import { useState } from "react";

// Mock data - replace with your API call
const mockTournament = {
    id: "1",
    name: "Weekly Championship",
    status: "completed", // 'upcoming' | 'registration' | 'ongoing' | 'completed'
    startTime: new Date("2025-12-10T18:00:00"),
    maxPlayers: 16,
    currentPlayers: 16,
    format: "Single Elimination",
    matchFormat: "Best of 3",
    prizePool: 1000,
    registrationDeadline: new Date("2025-12-09T23:59:59"),
    createdBy: "Admin",
    description: "Join our weekly championship and compete for amazing prizes!",
    champion: "Player1", // Winner of the tournament
    rules: [
        "Players must be online 10 minutes before their match",
        "No cheating or exploitation allowed",
        "Respect your opponents",
        "Match results are final"
    ],
    participants: [
        { id: "1", username: "Player1", rank: "Gold", seed: 1 },
        { id: "2", username: "Player2", rank: "Silver", seed: 2 },
        { id: "3", username: "Player3", rank: "Bronze", seed: 3 },
        { id: "4", username: "Player4", rank: "Gold", seed: 4 },
        { id: "5", username: "Player5", rank: "Silver", seed: 5 },
        { id: "6", username: "Player6", rank: "Gold", seed: 6 },
        { id: "7", username: "Player7", rank: "Bronze", seed: 7 },
        { id: "8", username: "Player8", rank: "Silver", seed: 8 },
    ],
    bracket: {
        rounds: [
            {
                name: "Quarter Finals",
                matches: [
                    { id: "1", player1: "Player1", player2: "Player8", score1: 2, score2: 0, winner: "Player1", status: "completed" },
                    { id: "2", player1: "Player4", player2: "Player5", score1: 2, score2: 1, winner: "Player4", status: "completed" },
                    { id: "3", player1: "Player3", player2: "Player6", score1: 1, score2: 2, winner: "Player6", status: "completed" },
                    { id: "4", player1: "Player2", player2: "Player7", score1: 2, score2: 1, winner: "Player2", status: "completed" },
                ]
            },
            {
                name: "Semi Finals",
                matches: [
                    { id: "5", player1: "Player1", player2: "Player4", score1: 2, score2: 0, winner: "Player1", status: "completed" },
                    { id: "6", player1: "Player6", player2: "Player2", score1: 1, score2: 2, winner: "Player2", status: "completed" },
                ]
            },
            {
                name: "Final",
                matches: [
                    { id: "7", player1: "Player1", player2: "Player2", score1: 3, score2: 1, winner: "Player1", status: "completed" },
                ]
            }
        ]
    }
};

// Match Card Component
function MatchCard({ match }: { match: any }) {
    const getMatchStatus = () => {
        if (match.status === 'live') {
            return (
                <div className="mb-3">
                    <span className="flex items-center gap-1. 5 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold w-fit">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        LIVE NOW
                    </span>
                </div>
            );
        }
        if (match.status === 'completed') {
            return (
                <div className="mb-3">
                    <span className="px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                        Completed
                    </span>
                </div>
            );
        }
        return (
            <div className="mb-3">
                <span className="px-3 py-1.5 rounded-full bg-slate-500/20 border border-slate-500/30 text-slate-400 text-xs font-semibold">
                    Upcoming
                </span>
            </div>
        );
    };

    const getPlayerStyle = (playerName: string) => {
        if (match.status === 'completed' && match.winner === playerName) {
            return "bg-blue-600 border-blue-500 text-white font-bold shadow-lg";
        }
        if (match.status === 'completed' && match.winner !== playerName) {
            return "bg-slate-800/50 border-slate-700 text-slate-500";
        }
        if (match.status === 'live') {
            return "bg-slate-800 border-blue-500/50 text-white font-semibold";
        }
        return "bg-slate-900 border-slate-800 text-slate-300";
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all hover:shadow-xl">
            {getMatchStatus()}

            <div className="space-y-3">
                {/* Player 1 */}
                <div className={`flex items-center justify-between px-4 py-3. 5 rounded-xl border-2 transition-all ${getPlayerStyle(match.player1)}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-slate-950/50 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {match.player1.charAt(0)}
                        </div>
                        <span className="font-semibold truncate text-base">{match.player1}</span>
                    </div>
                    {match.score1 !== null && (
                        <span className="text-2xl font-bold ml-3">{match.score1}</span>
                    )}
                </div>

                {/* VS Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-800"></div>
                    <span className="text-xs font-bold text-slate-600 px-2">VS</span>
                    <div className="flex-1 h-px bg-slate-800"></div>
                </div>

                {/* Player 2 */}
                <div className={`flex items-center justify-between px-4 py-3. 5 rounded-xl border-2 transition-all ${getPlayerStyle(match.player2)}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-slate-950/50 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {match.player2.charAt(0)}
                        </div>
                        <span className="font-semibold truncate text-base">{match.player2}</span>
                    </div>
                    {match.score2 !== null && (
                        <span className="text-2xl font-bold ml-3">{match.score2}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

type TabType = 'overview' | 'bracket' | 'participants' | 'rules';

export default function TournamentDetailPage() {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('bracket');
    const [isJoined, setIsJoined] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const tournament = mockTournament;

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'overview', label: 'Overview', icon: Info },
        { id: 'bracket', label: 'Bracket', icon: GitBranch },
        { id: 'participants', label: 'Participants', icon: UserCircle },
        { id: 'rules', label: 'Rules', icon: FileText },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ongoing':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Live Now
                    </span>
                );
            case 'registration':
                return <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-semibold">Registration Open</span>;
            case 'upcoming':
                return <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-semibold">Upcoming</span>;
            case 'completed':
                return <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-semibold">Completed</span>;
            default:
                return null;
        }
    };

    const handleJoinTournament = async () => {
        setIsLoading(true);
        try {
            console.log("Joining tournament.. .");
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsJoined(true);
            alert("Successfully joined the tournament!");
        } catch (error) {
            console.error("Failed to join tournament:", error);
            alert("Failed to join tournament. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeaveTournament = async () => {
        setIsLoading(true);
        try {
            console.log("Leaving tournament...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsJoined(false);
            alert("You have left the tournament.");
        } catch (error) {
            console.error("Failed to leave tournament:", error);
            alert("Failed to leave tournament. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors font-medium"
                >
                    <ArrowLeft size={20} />
                    Back
                </button>

                {/* Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 lg:p-8 mb-6 border border-gray-200 dark:border-slate-800">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                                    <Trophy className="text-white" size={32} />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">{tournament.name}</h1>
                                    {getStatusBadge(tournament.status)}
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-slate-400 text-base lg:text-lg">{tournament.description}</p>
                        </div>

                        {tournament.status === 'registration' && (
                            <div className="flex flex-col gap-3">
                                {!isJoined ? (
                                    <button
                                        onClick={handleJoinTournament}
                                        disabled={isLoading || tournament.currentPlayers >= tournament.maxPlayers}
                                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed
                                                 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap"
                                    >
                                        <UserPlus size={22} />
                                        {isLoading ? "Joining..." : tournament.currentPlayers >= tournament.maxPlayers ? "Tournament Full" : "Join Tournament"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleLeaveTournament}
                                        disabled={isLoading}
                                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed
                                                 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap"
                                    >
                                        <UserMinus size={22} />
                                        {isLoading ? "Leaving..." : "Leave Tournament"}
                                    </button>
                                )}
                                {isJoined && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-blue-400 font-semibold text-sm">You're registered!</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>


                {/* Tabs */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">

                    {/* Tab Headers - Grid Layout */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-gray-200 dark:border-slate-800">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-4 font-semibold text-sm transition-all ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 sm:p-6 lg:p-8">

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tournament Information</h3>
                                    <div className="grid gap-4">
                                        <div className="flex justify-between py-3 border-b border-gray-200 dark:border-slate-800">
                                            <span className="text-gray-600 dark:text-slate-400">Format</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{tournament.format}</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-b border-gray-200 dark:border-slate-800">
                                            <span className="text-gray-600 dark:text-slate-400">Match Format</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{tournament.matchFormat}</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-b border-gray-200 dark:border-slate-800">
                                            <span className="text-gray-600 dark:text-slate-400">Max Players</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{tournament.maxPlayers}</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-b border-gray-200 dark:border-slate-800">
                                            <span className="text-gray-600 dark:text-slate-400">Created By</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{tournament.createdBy}</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-b border-gray-200 dark:border-slate-800">
                                            <span className="text-gray-600 dark:text-slate-400">Registration Ends</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {tournament.registrationDeadline.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-3 border-b border-gray-200 dark:border-slate-800">
                                            <span className="text-gray-600 dark:text-slate-400">Starts At</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {tournament.startTime.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bracket Tab */}
                        {activeTab === 'bracket' && (
                            <div>
                                {tournament.status !== 'registration' || tournament.status === 'upcoming' ? (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                                            <GitBranch className="text-slate-600" size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Bracket Not Ready</h3>
                                        <p className="text-gray-600 dark:text-slate-400">
                                            The bracket will be generated when the tournament starts
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Champion Display */}
                                        {tournament.status === 'completed' && tournament.champion && (
                                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-center mb-8">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50"></div>
                                                        <Crown className="relative text-yellow-400" size={64} />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-3xl font-bold text-white mb-2">🏆 CHAMPION 🏆</h2>
                                                        <div className="flex items-center justify-center gap-4 mt-4">
                                                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-3xl shadow-2xl">
                                                                {tournament.champion.charAt(0)}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-4xl font-bold text-white">{tournament.champion}</p>
                                                                <p className="text-blue-200 text-lg">Tournament Winner</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {tournament.bracket.rounds.map((round, roundIndex) => (
                                            <div key={roundIndex}>
                                                <div className="flex items-center gap-2 mb-6">
                                                    <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{round.name}</h3>
                                                </div>
                                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                                    {round.matches.map((match) => (
                                                        <MatchCard key={match.id} match={match} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Participants Tab */}
                        {activeTab === 'participants' && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Registered Players</h3>
                                <div className="space-y-3">
                                    {tournament.participants.map((participant, index) => (
                                        <div
                                            key={participant.id}
                                            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                                        >
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {participant.username.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 dark:text-white">{participant.username}</p>
                                                <p className="text-sm text-gray-600 dark:text-slate-400">{participant.rank} • Seed #{participant.seed}</p>
                                            </div>
                                            <div className="text-2xl font-bold text-slate-600">
                                                #{index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rules Tab */}
                        {activeTab === 'rules' && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tournament Rules</h3>
                                <div className="space-y-4">
                                    {tournament.rules.map((rule, index) => (
                                        <div key={index} className="flex gap-4 items-start">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg">
                                                {index + 1}
                                            </div>
                                            <p className="text-gray-700 dark:text-slate-300 pt-2 text-base">{rule}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
