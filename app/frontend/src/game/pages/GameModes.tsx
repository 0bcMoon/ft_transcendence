import { Users, Award, Users2, Bot } from "lucide-react";
import { GameModeCard } from "../components/GameModeCard";

export default function GameMode() {
    const gameModes = [
        {
            to: "/game/quick/play",
            icon: <Users size={48} strokeWidth={1.5} />,
            title: "Quick Match",
            description: "Play online against other players"
        },
        {
            to: "/game/local/play",
            icon: <Users2 size={48} strokeWidth={1.5} />,
            title: "Local Game",
            description: "Play with a friend nearby"
        },
        {
            to: "/game/ai/play",
            icon: <Bot size={48} strokeWidth={1.5} />,
            title: "VS AI",
            description: "Practice against computer"
        },
        {
            to: "/game/tournament",
            icon: <Award size={48} strokeWidth={1.5} />,
            title: "Tournament",
            description: "Compete in ranked matches"
        },
    ];

    return (
        <div className="h-full overflow-y-auto no-scrollbar bg-gray-50 py-8 px-4 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-6 py-12">

                <div className="text-center mb-16">
                    <div className="inline-block mb-6">
                        <div className="w-20 h-20 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-white dark:border-gray-900 rounded-full" />
                        </div>
                    </div>

                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Ping Pong Arena
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Choose your game mode and start playing. Challenge friends, compete in tournaments, or practice your skills.
                    </p>
                </div>

                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        Game Modes
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {gameModes.map((mode) => (
                            <GameModeCard
                                key={mode.title}
                                to={mode.to}
                                icon={mode.icon}
                                title={mode.title}
                                description={mode.description}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
