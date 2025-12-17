import { GameModeCard } from '../components/GameModeCard';
import { Globe, Trophy, Users, X } from 'lucide-react';

function GameModes() {
    return (
        < div className="h-full overflow-y-auto bg-slate-950 no-scrollbar flex items-center justify-center py-24 px-6" >
            <div className="max-w-7xl w-full">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                        Choose Your Geme Mode
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Four distinct ways to play and prove your mastery over the table.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <GameModeCard
                        to="/game/local/play"
                        icon={<Users size={32} />}
                        title="Local Games"
                        description="Play classic 1v1 matches with a friend on the same keyboard or with shared controllers."
                        colorClass="green"
                    />
                    <GameModeCard
                        to="/game/quick/play"
                        icon={<Globe size={32} />}
                        title="Remote Game"
                        description="Challenge players from around the world in ranked or casual online matches."
                        colorClass="blue"
                    />

                    <GameModeCard
                        to="/game/ai/play"
                        icon={<X size={32} />}
                        title="TIC-TAC-TOE"
                        description="Test your skills against our advanced AI with multiple difficulty levels and training modes."
                        colorClass="purple"
                    />

                    <GameModeCard
                        to="/game/tournaments"
                        icon={<Trophy size={32} />}
                        title="Tournaments"
                        description="Automated daily and weekly elimination brackets with prize pools and global rankings."
                        colorClass="cyan"
                    />


                </div>
            </div>
        </div >
    );
}

export default GameModes;
