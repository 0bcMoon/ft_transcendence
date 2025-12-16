import HeroHeader from "./components/HeroHeader";
import QuickActions from "./components/QuickActions";
import LiveTournament from "./components/LiveTournament";
// import StatsGrid from "./components/StatsGrid";
import RecentMatches from "./components/RecentMatches";
import TopPlayers from "./components/TopPlayers";
import CompetitiveRanking from "./components/CompetitiveRanking"; // new -- see below

function Home() {
    return (
        <div className="h-full overflow-y-auto bg-slate-950 no-scrollbar flex items-start justify-center py-20 px-8">
            <div className="max-w-7xl w-full">
                <HeroHeader />
                {/* <QuickActions /> */}
                <LiveTournament />
                <CompetitiveRanking />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="col-span-2">
                        {/* <StatsGrid /> */}
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

export default Home;
