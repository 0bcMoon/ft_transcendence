import StatCard from "./StatCard";

export default function StatsGrid() {
    return (
        <section className="mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-white mb-4">Player Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <StatCard title="Total Wins" value="124" icon="🏆" />
                <StatCard title="Total Losses" value="98" icon="🛡️" />
                <StatCard title="Win Rate" value="55%" icon="📈" />
                <StatCard title="Current Rank" value="#128" icon="⭐" />
            </div>
        </section>
    );
}
