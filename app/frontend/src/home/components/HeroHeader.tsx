import { Play, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroHeader() {
    return (
        <div className="relative bg-slate-900 border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    <h1 className="text-6xl sm:text-7xl font-black text-white mb-6 tracking-tight">
                        PingPong<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> Arena</span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-2xl mb-10">
                        Master your skills in <span className="text-blue-400 font-semibold">real-time matches</span>, compete in <span className="text-cyan-400 font-semibold">tournaments</span>, and climb the <span className="text-blue-300 font-semibold">leaderboards</span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/game/quick/play"
                            className="group inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all duration-300 hover:scale-105" >
                            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" />
                            Quick Play
                        </Link>
                        
                        <Link
                            to="/game/tournaments"
                            className="group inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg shadow-lg border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105" >
                            <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform text-cyan-400" />
                            Tournaments
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
