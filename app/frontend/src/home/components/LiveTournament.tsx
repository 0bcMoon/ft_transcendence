import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";

export default function LiveTournament() {
    return (
        <section className="mb-10">
            <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-7 shadow-lg border border-slate-900/60 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600/90 text-white">LIVE</span>
                        <span className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-full text-xs font-semibold ml-1">
                            2,384 PLAYERS
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-2 mb-1">
                        <Trophy className="w-8 h-8 inline" /> Spring Masters
                    </h2>
                    <p className="text-base sm:text-lg text-slate-300 mb-5">
                        <span className="font-semibold text-white">Elimination Bracket</span> •
                        Prize: <span className="font-bold text-amber-100">PingPod Pro Set</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow transition"
                            to="/tournaments" >
                            Join Now
                        </Link>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-blue-800 text-blue-200 font-semibold text-xs tracking-wide">
                            Next: Ava vs Leo • 15:00
                        </span>
                        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-rose-600 border border-rose-400 text-white text-xs font-bold">
                            3d 5h left
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
