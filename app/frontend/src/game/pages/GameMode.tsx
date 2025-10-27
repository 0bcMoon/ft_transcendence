import React from "react";
import { Link } from "react-router-dom";
import { Users, Award, Users2, Bot } from "lucide-react";
import "@/App.css";

interface GameModeCardProps {
    to: string;
    icon: React.ReactNode;
    iconColor: string;
    bgColor: string;
    title: string;
    description: string;
}

const GameModeCard: React.FC<GameModeCardProps> = ({ to, icon, iconColor, bgColor, title, description }) => {
    return (
        <Link
            to={to}
            className="flex items-center p-4 hover:bg-gray-50 rounded-xl transition-all group"
            aria-label={`Play ${title}`} >
            <div className={`${bgColor} ${iconColor} p-3 rounded-xl mr-4 group-hover:scale-105 transition-transform`}>
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <div className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all">
                →
            </div>
        </Link>
    );
};

const GameMode: React.FC = () => {
    // Define game modes data for better maintainability
    const gameModes: GameModeCardProps[] = [
        {
            to: "/game/local",
            icon: <Users2 size={20} />,
            iconColor: "text-purple-500",
            bgColor: "bg-orange-50",
            title: "Local Game",
            description: "Play with a friend"
        },
        {
            to: "/game/quick/play",
            icon: <Users size={20} />,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-50",
            title: "Casual Match",
            description: "Practice and have fun"
        },
        {
            to: "/game/tournament/list",
            icon: <Award size={20} />,
            iconColor: "text-purple-500",
            bgColor: "bg-purple-50",
            title: "Tournament",
            description: "Join championships"
        },
        {
            to: "/game/ai",
            icon: <Bot size={20} />,
            iconColor: "text-purple-500",
            bgColor: "bg-cyan-50",
            title: "Play vs AI",
            description: "Challenge our AI opponent"
        },
        {
            to: "/game/multiplayer/play",
            icon: <Users size={20} />,
            iconColor: "text-red-500",
            bgColor: "bg-red-50",
            title: "4-Player Remote",
            description: "Play Pong with 4 players"
        }
    ];

    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-5xl mx-auto w-full px-6 py-6">
                <div className="relative overflow-hidden bg-linear-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-2xl p-8 text-white mb-8">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-medium text-center tracking-wide">
                            PING PONG
                        </h1>
                    </div>
                    {/* Visual element for added depth */}
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Game Modes</h2>
                    <div className="space-y-3">
                        {gameModes.map((mode, index) => (
                            <GameModeCard
                                key={index}
                                to={mode.to}
                                icon={mode.icon}
                                iconColor={mode.iconColor}
                                bgColor={mode.bgColor}
                                title={mode.title}
                                description={mode.description}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameMode;
