import { Link } from "react-router-dom";
import { Calendar, Users, Clock } from "lucide-react";

interface TournamentCardProps {
    tournament: {
        id: number;
        name: string;
        start_time: string;
        max_players: number;
        status: string;
        created_at: string;
    };
}

export function TournamentCard({ tournament }: TournamentCardProps) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-slate-800 transition">
            {/* Left info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8 flex-1 text-white">
                <div className="font-semibold text-lg truncate">{tournament.name}</div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar size={16} />
                    <span>{tournament.start_time ? new Date(tournament.start_time).toLocaleString() : "Not set"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Users size={16} />
                    <span>Max: {tournament.max_players}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock size={16} />
                    <span>Created: {new Date(tournament.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Right status + view */}
            <div className="flex items-center gap-4 mt-3 sm:mt-0">
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${tournament.status === "registration"
                            ? "bg-yellow-500 text-black"
                            : tournament.status === "active"
                                ? "bg-green-500 text-black"
                                : "bg-gray-500 text-white"
                        }`}
                >
                    {tournament.status.toUpperCase()}
                </span>
                <Link
                    to={`/game/tournament/${tournament.id}`}
                    className="py-1 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition"
                >
                    View
                </Link>
            </div>
        </div>
    );
}

