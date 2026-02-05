import { Link, useParams, Navigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { TournamentHeader } from "../components/tournament/TournamentHeader";
import { TournamentTabs } from "../components/tournament/TournamentTabs";
import { useTournamentBasic } from "../hooks/queries";
import { toast } from "react-hot-toast";

type TabType = "overview" | "bracket" | "players";

export default function TournamentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const tournamentId = parseInt(id || "0", 10);
    const [activeTab, setActiveTab] = useState<TabType>("overview");
    const { data: tournament, isLoading, isError } = useTournamentBasic(tournamentId);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }

    if (isError || !tournament) {
        toast.error("Tournament not found");
        return <Navigate to="/game/tournaments" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <Link
                    to="/game/tournaments"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition" >
                    <ArrowLeft className="w-4 h-4" />

                    Back
                </Link>

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
