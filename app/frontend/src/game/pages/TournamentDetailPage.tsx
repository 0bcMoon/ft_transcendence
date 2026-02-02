import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { TournamentHeader } from "../components/tournament/TournamentHeader";
import { TournamentTabs } from "../components/tournament/TournamentTabs";

type TabType = 'overview' | 'bracket' | 'players';

export default function TournamentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const tournamentId = parseInt(id || '0', 10);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    if (isNaN(tournamentId) || tournamentId <= 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Tournament Not Found</h2>
                    <p className="text-slate-400 mb-8">
                        Tournament doesn't exist or ID is invalid.
                    </p>
                    <Link
                        to="/game/tournaments"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 hover:text-white transition"
                    >
                        <ArrowLeft size={18} />
                        Back to Tournaments
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link
                        to="/game/tournaments"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 hover:text-white transition" >
                        <ArrowLeft size={18} />
                        Back to Tournaments
                    </Link>
                </div>
                <TournamentHeader tournamentId={tournamentId} />
                <TournamentTabs
                    tournamentId={tournamentId}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>
        </div>
    );
}
