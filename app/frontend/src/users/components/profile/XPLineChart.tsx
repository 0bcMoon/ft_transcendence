import { useState } from "react";
import { useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useGetUserXPProgression } from "@/game/hooks/queries";

const PRESET_LIMITS = [5, 10, 30, 100, 500];

export default function XPLineChart() {
    const { user_id } = useParams<{ user_id: string }>();
    const userId = Number(user_id);

    const [limit, setLimit] = useState<number>(30);
    const { data, isLoading, isError } = useGetUserXPProgression(userId, limit);

    const chartData = (data || []).map((point, idx) => ({
        game: idx + 1,
        xp: point.total_xp,
        level: point.level.toFixed(2),
        xpGained: point.xp_gained,
        date: new Date(point.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-72 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-slate-400">Loading XP progression...</span>
            </div>
        );
    }

    if (isError || !data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-72 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-slate-400">
                    {isError ? "Failed to load XP progression." : "No XP data available."}
                </span>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-6">
            {/* Header + Limit Selector */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">XP Progress</h3>
                <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-sm outline-none focus:border-blue-500 cursor-pointer hover:bg-slate-700"
                >
                    {PRESET_LIMITS.map((val) => (
                        <option key={val} value={val}>Last {val} games</option>
                    ))}
                </select>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                        dataKey="game"
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        label={{ value: "Games Played", position: "insideBottom", offset: -5, fill: "#94a3b8", fontSize: 12 }}
                        stroke="#475569"
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        domain={["auto", "auto"]}
                        allowDecimals={false}
                        label={{ value: "Total XP", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 12 }}
                        stroke="#475569"
                    />
                    <Tooltip
                        contentStyle={{ background: "#1e293b", borderRadius: 8, border: "1px solid #334155", fontSize: 13, color: "#f1f5f9", padding: "12px" }}
                        labelStyle={{ color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}
                        // formatter={(value: any, name: string) => (name === "xp" ? [value.toLocaleString(), "Total XP"] : [value, name])}
                        labelFormatter={(_, payload: any) => payload?.[0]?.payload ? `Game ${payload[0].payload.game} • ${payload[0].payload.date}` : ""}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
                                        <p className="text-slate-400 text-xs mb-2 font-semibold">Game {data.game} • {data.date}</p>
                                        <p className="text-white font-bold">{data.xp.toLocaleString()} <span className="text-slate-400 text-xs font-normal">XP</span></p>
                                        <p className="text-blue-400 text-sm">Level {data.level}</p>
                                        <p className="text-green-400 text-xs">+{data.xpGained} XP gained</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="xp"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#1e40af" }}
                        activeDot={{ r: 6, fill: "#3b82f6", stroke: "#60a5fa", strokeWidth: 2 }}
                        isAnimationActive
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

