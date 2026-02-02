import HeroHeader from "./components/HeroHeader";
import RecentMatches from "./components/RecentMatches";
import TopPlayers from "./components/TopPlayers";
import CompetitiveRanking from "./components/CompetitiveRanking";

export default function HomePage() {
    return (
        <div className="h-full overflow-y-auto bg-slate-950 no-scrollbar">
            <HeroHeader />

            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
                <div className="mb-12">
                    <CompetitiveRanking />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <RecentMatches />
                    </div>
                    <div>
                        <TopPlayers />
                    </div>
                </div>
            </div>
        </div>
    );
}

