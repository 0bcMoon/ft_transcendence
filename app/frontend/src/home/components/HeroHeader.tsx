import { Play, Trophy } from "lucide-react"
import { Link } from "react-router-dom"

export default function HeroHeader() {
    return (
        <header className="relative text-center mb-14">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
                <div className="w-96 h-96 bg-slate-800/70 rounded-full blur-3xl animate-pulse scale-90"></div>
                <div className="w-44 h-44 bg-blue-900/30 rounded-full blur-2xl absolute top-8 right-1/4"></div>
                <div className="w-32 h-32 bg-emerald-900/30 rounded-full blur-2xl absolute bottom-16 left-1/4"></div>
            </div>
            <div className="relative z-10">
                <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-slate-200 via-blue-500 to-blue-300 bg-clip-text text-transparent drop-shadow-lg mb-5 tracking-tight">
                    PingPong Arena
                </h1>
                <p className="text-xl sm:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto text-center">
                    Play <span className="text-blue-300 font-bold">online matches</span>, compete in{" "}
                    <span className="text-sky-300 font-semibold">live tournaments</span>, and climb the{" "}
                    <span className="text-blue-200 font-bold">global leaderboard</span>.<br />
                    Challenge others, improve your rank, and make your mark!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/game/quick/play"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-lg shadow-xl shadow-blue-500/15 transition-transform hover:scale-105 ring-1 ring-blue-400/40"
                    >
                        <Play className="w-6 h-6" />
                        Quick Play
                    </Link>
                    <Link
                        to="/game/tournaments"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-blue-200 font-extrabold text-lg shadow-xl shadow-blue-400/10 border border-blue-700 transition-transform hover:scale-105"
                    >
                        <Trophy className="w-6 h-6" />
                        Live Tournament
                    </Link>
                </div>
            </div>
        </header>
    )
}

