import React from "react";
import { Link } from "react-router-dom";

export interface GameModeCardProps {
    to: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    colorClass?: string;
}

export const GameModeCard = ({ to, icon, title, description, colorClass = "blue" }: GameModeCardProps) => {
    // Define color classes for each variant
    const colorVariants: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
        blue: {
            bg: "bg-blue-500/20",
            text: "text-blue-500",
            border: "group-hover:border-blue-500/50",
            shadow: "group-hover:shadow-blue-500/30"
        },
        cyan: {
            bg: "bg-cyan-500/20",
            text: "text-cyan-500",
            border: "group-hover:border-cyan-500/50",
            shadow: "group-hover:shadow-cyan-500/30"
        },
        purple: {
            bg: "bg-purple-500/20",
            text: "text-purple-500",
            border: "group-hover:border-purple-500/50",
            shadow: "group-hover:shadow-purple-500/30"
        },
        green: {
            bg: "bg-green-500/20",
            text: "text-green-500",
            border: "group-hover:border-green-500/50",
            shadow: "group-hover:shadow-green-500/30"
        }
    };

    const colors = colorVariants[colorClass] || colorVariants.blue;

    return (
        <Link
            to={to}
            className={`block w-full p-8 rounded-2xl border border-slate-800 backdrop-blur-sm 
                bg-slate-900/50 hover:bg-slate-800/70 transition-all duration-300 group
                hover:-translate-y-2 hover:shadow-2xl ${colors.border} ${colors.shadow}`}
        >
            <div className="flex flex-col items-center text-center gap-4">
                {/* Icon with gradient background */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center 
                    ${colors.bg} ${colors.text} group-hover:scale-110 transition-all duration-300 
                    group-hover:shadow-lg`}>
                    {icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white group-hover:text-white transition-colors">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {description}
                </p>
            </div>
        </Link>
    );
};
