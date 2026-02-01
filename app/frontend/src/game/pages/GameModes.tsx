import { GameModeCard } from '../components/GameModeCard';
import { Globe, Trophy, Users, X } from "lucide-react"

export default function GameModesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    {/* Header */}
                    <div className="text-center mb-12 sm:mb-16">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                            Choose Your{" "}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Game Mode
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
                            Four distinct ways to play and prove your mastery over the table. Select your preferred game mode and
                            start playing.
                        </p>
                    </div>

                    {/* Game Mode Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        <GameModeCard
                            to="/game/local/play"
                            icon={<Users size={24} />}
                            title="Local Games"
                            description="Play classic 1v1 matches with a friend on the same keyboard or with shared controllers."
                            colorClass="green"
                        />
                        <GameModeCard
                            to="/game/quick/play"
                            icon={<Globe size={24} />}
                            title="Remote Game"
                            description="Challenge players from around the world in ranked or casual online matches."
                            colorClass="blue"
                        />
                        <GameModeCard
                            to="/game/tournaments"
                            icon={<Trophy size={24} />}
                            title="Tournaments"
                            description="Automated daily and weekly elimination brackets with prize pools and global rankings."
                            colorClass="cyan"
                        />
                        <GameModeCard
                            to="/arena"
                            icon={<X size={24} />}
                            title="Arena"
                            description="Hahia a kha Mohamed"
                            colorClass="purple"
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}

