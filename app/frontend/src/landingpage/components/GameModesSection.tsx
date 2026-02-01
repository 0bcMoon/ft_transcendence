import { Globe, Trophy, Cpu, User } from 'lucide-react';
import GameModeCard from './GameModeCard';

export default function GameModesSection() {
  return (
    <section id="modes" className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Choose Your Arena
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            compete globally, join tournaments, or battle locally
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          <GameModeCard
            icon={<Globe size={32} />}
            title="Remote Game"
            desc="Challenge players from around the world in ranked or casual online matches."
            color="blue-500"
          />
          <GameModeCard
            icon={<Trophy size={32} />}
            title="Tournaments"
            desc="Automated daily and weekly elimination brackets with prize pools and global rankings."
            color="cyan-500"
          />
          <GameModeCard
            icon={<Cpu size={32} />}
            title="AI Challenge"
            desc="Test your skills against our advanced AI with multiple difficulty levels and training modes."
            color="purple-500"
          />
          <GameModeCard
            icon={<User size={32} />}
            title="Local Games"
            desc="Play classic 1v1 matches with a friend on the same keyboard or with shared controllers."
            color="green-500"
          />
        </div>
      </div>
    </section>
  );
};
