import { Crown, Sparkles } from "lucide-react";

export function ChampionBanner({ championName }: { championName: string }) {
    return (
        <div className="relative bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20 rounded-2xl p-8 border-2 border-yellow-500/30 overflow-hidden mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5 animate-pulse"></div>
            
            <div className="relative flex flex-col items-center gap-6 text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                    <Crown className="relative text-yellow-400 drop-shadow-lg" size={56} />
                </div>

                <div className="flex items-center gap-2">
                    <Sparkles className="text-yellow-400" size={24} />
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                        CHAMPION
                    </h2>
                    <Sparkles className="text-yellow-400" size={24} />
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl ring-4 ring-yellow-400/30">
                        {championName.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                        <p className="text-3xl font-bold text-white drop-shadow-md">
                            {championName}
                        </p>
                        <p className="text-yellow-300/80 text-sm font-medium">
                            Tournament Winner
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
