import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { useGetUserEloProgression } from "@/game/api/queries"

interface EloLineChartProps {
    userId: number
    defaultLimit?: number
}

const PRESET_LIMITS = [5, 10, 30, 100, 500, 1000]

export default function EloLineChart({ userId, defaultLimit = 100 }: EloLineChartProps) {
    const [limit, setLimit] = useState<number>(defaultLimit)
    const { data, isLoading, isError } = useGetUserEloProgression(userId, limit)

    const chartData = (data || []).map((point, idx) => ({
        game: idx + 1,
        elo: point.new_elo,
        date: new Date(point.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }))

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">ELO Progress</h3>
                <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-sm outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                    {PRESET_LIMITS.map((val) => (
                        <option key={val} value={val}>
                            {val === 1000 ? "All (max 1000)" : `Last ${val}`}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                    <span className="text-slate-400">Loading ELO progression...</span>
                </div>
            ) : isError || !data ? (
                <div className="flex items-center justify-center h-[300px]">
                    <span className="text-red-400">Failed to load ELO progression.</span>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />

                        <XAxis
                            dataKey="game"
                            tick={{ fontSize: 12, fill: "#94a3b8" }}
                            label={{ value: "Game", position: "insideBottom", offset: -5, fill: "#94a3b8", fontSize: 12 }}
                            stroke="#475569"
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: "#94a3b8" }}
                            domain={["auto", "auto"]}
                            allowDecimals={false}
                            label={{ value: "ELO", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 12 }}
                            stroke="#475569"
                        />

                        <Tooltip
                            contentStyle={{
                                background: "#1e293b",
                                borderRadius: 8,
                                border: "1px solid #334155",
                                fontSize: 13,
                                color: "#f1f5f9",
                            }}
                            labelStyle={{ color: "#94a3b8", fontWeight: 600 }}
                            formatter={(value: any) => [value, "ELO"]}
                            labelFormatter={(_, payload: any) =>
                                payload && payload.length ? `Game: ${payload[0].payload.game} (${payload[0].payload.date})` : ""
                            }
                        />

                        <Line
                            type="monotone"
                            dataKey="elo"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#1e40af" }}
                            activeDot={{ r: 6, fill: "#3b82f6", stroke: "#60a5fa", strokeWidth: 2 }}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}

