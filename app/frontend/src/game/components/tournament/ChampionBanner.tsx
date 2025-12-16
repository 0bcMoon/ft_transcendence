import { Crown } from "lucide-react";

export function ChampionBanner({ championName }: { championName: string }) {
    return (
        <div className="bg-gradient-to-br bg-slate-800 rounded-2xl p-8 text-center mb-8">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50"></div>
                    <Crown className="relative text-yellow-400" size={64} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">🏆 CHAMPION 🏆</h2>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-3xl shadow-2xl">
                            {championName.charAt(0)}
                        </div>
                        <div className="text-left">
                            <p className="text-4xl font-bold text-white">{championName}</p>
                            <p className="text-blue-200 text-lg">Tournament Winner</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
