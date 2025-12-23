import { Medal, Gem, Crown } from "lucide-react"

const ranks = [
    {
        name: "Bronze",
        icon: <Medal color="#b87333" size={32} strokeWidth={2.4} />,
        colorClass: "text-[rgb(184,115,51)]",
        range: "0 – 999",
    },
    {
        name: "Silver",
        icon: <Medal color="#C0C0C0" size={32} strokeWidth={2.4} />,
        colorClass: "text-[rgb(192,192,192)]",
        range: "1000 – 1199",
    },
    {
        name: "Gold",
        icon: <Medal color="#FFD700" size={32} strokeWidth={2.4} />,
        colorClass: "text-yellow-300",
        range: "1200 – 1399",
    },
    {
        name: "Platinum",
        icon: <Gem color="#60e6d0" size={32} strokeWidth={2.4} />,
        colorClass: "text-emerald-200",
        range: "1400 – 1599",
    },
    {
        name: "Master",
        icon: <Crown color="#a78bfa" size={32} strokeWidth={2.4} />,
        colorClass: "text-indigo-300",
        range: "1600+",
    },
]

export default function CompetitiveRanking() {
    return (
        <div className="mb-12 bg-white/[0.04] backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-7 tracking-wide">Competitive Ranking</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {ranks.map((rank) => (
                    <div key={rank.name} className="text-center p-6 rounded-xl bg-slate-800/60 border border-white/10">
                        <div className={`flex justify-center mb-2 text-3xl ${rank.colorClass}`}>{rank.icon}</div>
                        <div className={`text-base font-extrabold mb-1 tracking-wide uppercase ${rank.colorClass}`}>
                            {rank.name}
                        </div>
                        <div className="text-lg text-slate-300 font-bold">{rank.range}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

