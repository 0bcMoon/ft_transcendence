import React from "react";
export default function QuickActions() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <a href="/play" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-xl shadow-xl transition group">
                <span className="group-hover:scale-110 transition">🏓</span>
                Quick Play
            </a>
            <a href="/tournaments" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-lg rounded-xl shadow-xl transition group">
                <span className="group-hover:scale-125 transition">🔥</span>
                Live Tournaments
            </a>
            <a href="/profile" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-900 border border-gray-700 text-white font-bold text-lg rounded-xl shadow transition group">
                <span className="group-hover:scale-110 transition">👤</span>
                Profile
            </a>
        </div>
    );
}
