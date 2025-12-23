import { Link } from "react-router-dom";
import { Trophy, Calendar, ChevronRight } from "lucide-react";

// Assuming 'Tournament' type is defined elsewhere
import { Tournament } from "../api/gameApi";

interface TournamentCardProps {
    tournament: Tournament;
}

// --- Sub-Component for a clean Status Badge ---
const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'registration':
            // "Registration" is the actionable state, so we won't show a simple badge.
            // The parent component will show a "Join" button instead.
            return null;
        case 'active':
            return (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Live
                </div>
            );
        case 'finished':
            return <div className="px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-xs font-medium">Finished</div>;
        case 'cancelled':
            return <div className="px-3 py-1 rounded-full bg-slate-800 text-slate-500 text-xs font-medium">Cancelled</div>;
        default:
            return null;
    }
};

export function TournamentCard({ tournament }: TournamentCardProps) {
    const isJoinable = tournament.status === 'registration';

    return (
        // The entire card is a Link for semantic correctness and better accessibility
        <Link
            to={`/game/tournament/${tournament.id}`}
            className="block bg-slate-900 rounded-2xl border border-slate-800 p-6 
                       transition-all duration-300 group
                       hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-600/10 hover:-translate-y-1"
        >
            <div className="flex items-start justify-between gap-6">

                {/* Left Side: Icon and Info */}
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-1">
                        <Trophy className="text-slate-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                            {tournament.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            {tournament.started_at && (
                                <>
                                    <span className="text-slate-700">•</span>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        {/* Using a more robust date formatting */}
                                        <span>{new Date(tournament.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Status or Join Button */}
                <div className="flex items-center flex-shrink-0 h-full mt-1">
                    {isJoinable ? (
                        // A clear Call-to-Action button for joinable tournaments
                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
                            Join Tournament <ChevronRight size={16} />
                        </div>
                    ) : (
                        <StatusBadge status={tournament.status} />
                    )}
                </div>

            </div>
        </Link>
    );
}

