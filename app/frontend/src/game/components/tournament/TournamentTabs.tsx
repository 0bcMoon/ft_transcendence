import { Info, GitBranch, Users } from "lucide-react";
import { OverviewTab } from "./tabs/OverviewTab";
import { BracketTab } from "./tabs/BracketTab";
import { PlayersTab } from "./tabs/PlayersTab";
import { TournamentDetails } from "../../types/tournament";

type TabType = 'overview' | 'bracket' | 'players';

interface TournamentTabsProps {
    tournament: TournamentDetails;
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export function TournamentTabs({ tournament, activeTab, onTabChange }: TournamentTabsProps) {
    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: Info },
        { id: 'bracket' as TabType, label: 'Bracket', icon: GitBranch },
        { id: 'players' as TabType, label: 'Players', icon: Users, count: tournament.player_count },
    ];

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl shadow-black/20">

            <div className="flex border-b border-slate-800">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}

                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold text-sm transition-colors relative
                                ${isActive ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`} >

                            <Icon size={18} />
                            <span>{tab.label}</span>

                            {tab.count !== undefined && (
                                <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold
                                    ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`} >
                                    {tab.count}
                                </span>
                            )}

                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="p-6">
                {activeTab === 'overview' && <OverviewTab tournament={tournament} />}
                {activeTab === 'bracket' && <BracketTab tournamentId={tournament.id} />}
                {activeTab === 'players' && <PlayersTab tournamentId={tournament.id} />}
            </div>

        </div>
    );
}

