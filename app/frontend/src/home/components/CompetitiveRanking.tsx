const ranks = [
    {
        name: "Bronze",
        icon: "🥉",
        color: "#CD7F32",
        range: "100 – 4,999 XP",
    },
    {
        name: "Silver",
        icon: "🥈",
        color: "#C0C0C0",
        range: "5,000 – 9,999 XP",
    },
    {
        name: "Gold",
        icon: "🥇",
        color: "#FFD700",
        range: "10,000 – 19,999 XP",
    },
    {
        name: "Platinum",
        icon: "💎",
        color: "#5EEAD4",
        range: "20,000 – 49,999 XP",
    },
    {
        name: "Master",
        icon: "👑",
        color: "#A78BFA",
        range: "50,000+ XP",
    },
];

export default function CompetitiveRanking() {
    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Competitive Ranks</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {ranks.map((rank) => (
                    <div
                        key={rank.name}
                        className="flex flex-col items-center p-4 sm:p-6 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition"
                    >
                        <div className="text-4xl mb-3">{rank.icon}</div>
                        <h3
                            className="text-base font-bold mb-1"
                            style={{ color: rank.color }}
                        >
                            {rank.name}
                        </h3>
                        <p className="text-sm text-slate-400 text-center">{rank.range}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
