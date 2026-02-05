import { Link } from "react-router-dom";
import { Users, Clock} from "lucide-react";

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
    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case "registration":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "active":
                return "bg-green-500/20 text-green-400 border-green-500/30";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', });
    };

    return (
        <Link
            to={`/game/tournament/${tournament.id}`}
            className="block bg-slate-900 border border-slate-800 rounded-xl p-6 hover:bg-slate-800 hover:border-slate-700 transition" >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-bold text-white truncate">
                        {tournament.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{tournament.max_players} players</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Created {formatDate(tournament.created_at)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusStyle( tournament.status)}`} >
                        {tournament.status.toUpperCase()}
                    </span>
                </div>
            </div>
        </Link>
    );
}
