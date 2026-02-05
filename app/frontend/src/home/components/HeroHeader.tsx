import { Play, Trophy, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroHeader() {
    return (
        <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
                <div className="flex flex-col items-center text-center space-y-8">

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-semibold text-blue-300">
                            Real-time Multiplayer Action
                        </span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight">
                        PingPong
                        <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
                            {" "}Arena
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
                        Master your skills, compete in tournaments, and dominate the leaderboards
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link
                            to="/game/quick/play"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg shadow-lg transition-all" >
                            <Play className="w-5 h-5 fill-current" />
                            <span>Quick Play</span>
                        </Link>

                        <Link
                            to="/game/tournaments"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg border border-slate-700 hover:border-cyan-500/50 transition-all" >
                            <Trophy className="w-5 h-5 text-cyan-400" />
                            <span>Tournaments</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
