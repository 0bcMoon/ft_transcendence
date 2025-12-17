import { Medal, Gem, Crown } from "lucide-react";

type Rank = {
    name: string;
    icon: React.ReactNode;
    colorClass: string;
    range: string;
};

export const ranks: Rank[] = [
    {
        name: "Bronze",
        icon: <Medal color="#b87333" size={32} strokeWidth={2.4} />,
        colorClass: "text-[rgb(184,115,51)]", // Bronze
        range: "0 – 999",
    },
    {
        name: "Silver",
        icon: <Medal color="#C0C0C0" size={32} strokeWidth={2.4} />,
        colorClass: "text-[rgb(192,192,192)]", // Silver
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
];

export function getRankDetails(rank: string) {
    return ranks.find((r) => r.name === rank) ?? {
        name: rank,
        icon: <Medal size={32} />,
        colorClass: "text-gray-400",
        range: "?",
    };
}
