export default function StatCard({ title, value, icon }: { title: string; value: string; icon?: string }) {
    return (
        <div className="relative p-6 rounded-xl bg-gradient-to-br from-white/10 via-slate-900/40 to-white/10 shadow-lg border border-slate-800 hover:ring-2 hover:ring-emerald-400 transition">
            <div className="absolute top-3 right-3 text-2xl text-sky-200">{icon}</div>
            <div>
                <div className="text-base text-slate-300">{title}</div>
                <div className="text-3xl font-extrabold text-white mt-2">{value}</div>
            </div>
        </div>
    );
}
