// components/tournament/tabs/OverviewTab.tsx

import { TournamentDetails } from "../../../types/tournament";
import { Calendar, Users, User, Trophy, Clock, Target } from "lucide-react";

interface OverviewTabProps {
    tournament: TournamentDetails;
}

export function OverviewTab({ tournament }: OverviewTabProps) {
    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    // A reusable sub-component for rows, keeping your original layout
    const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
        <div className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-slate-400">{label}</span>
            </div>
            <span className="font-semibold text-white">{value}</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-white mb-4">
                    Tournament Information
                </h3>
                {/* Themed container, preserving your original list structure */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 divide-y divide-slate-800">

                    <InfoRow
                        icon={
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <Target size={20} className="text-purple-400" />
                            </div>
                        }
                        label="Tournament Format"
                        value="Single Elimination"
                    />

                    <InfoRow
                        icon={
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <Users size={20} className="text-blue-400" />
                            </div>
                        }
                        label="Player Capacity"
                        value={`${tournament.player_count} / ${tournament.max_players}`}
                    />

                    {(tournament.status === 'active' || tournament.status === 'finished') && (
                        <InfoRow
                            icon={
                                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                    <span className="font-bold text-orange-400">R{tournament.current_round}</span>
                                </div>
                            }
                            label="Current Round"
                            value={`Round ${tournament.current_round}`}
                        />
                    )}

                    <InfoRow
                        icon={
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                <User size={20} className="text-indigo-400" />
                            </div>
                        }
                        label="Organized By"
                        value={
                            <div className="flex items-center gap-2">
                                {tournament.creator.avatar_url ? (
                                    <img src={tournament.creator.avatar_url} alt={tournament.creator.username} className="w-6 h-6 rounded-full" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                                        <User size={14} className="text-slate-400" />
                                    </div>
                                )}
                                <span>{tournament.creator.username}</span>
                            </div>
                        }
                    />

                    <InfoRow
                        icon={
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                <Calendar size={20} className="text-slate-400" />
                            </div>
                        }
                        label="Created On"
                        value={formatDate(tournament.created_at)}
                    />

                    {tournament.started_at && (
                        <InfoRow
                            icon={
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                    <Clock size={20} className="text-green-400" />
                                </div>
                            }
                            label="Started At"
                            value={formatDate(tournament.started_at)}
                        />
                    )}

                    {tournament.ended_at && (
                        <InfoRow
                            icon={
                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                    <Calendar size={20} className="text-slate-400" />
                                </div>
                            }
                            label="Ended On"
                            value={formatDate(tournament.ended_at)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

