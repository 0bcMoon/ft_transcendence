import { GameModeCardProps } from '../types/types';

export default function GameModeCard({ icon, title, desc, color }: GameModeCardProps) {
  return (
    <div className={`p-8 rounded-2xl border border-slate-800 backdrop-blur-sm bg-slate-900/50 hover:border-${color}/50 transition-all duration-300 group`}>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-${color}/20 text-${color} group-hover:shadow-lg transition-all`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-slate-400">{desc}</p>
    </div>
  );
};
