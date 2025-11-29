import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuthStore } from '@/state/authStore';
import { useUserScoreProgression } from '../../game/api/queries';

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
            <div><b>Date:</b> {payload[0].payload.date}</div>
            <div><b>Score:</b> {payload[0].value}</div>
        </div>
    );
};

export default function RankProgressionLineChart() {
    const user = useAuthStore(s => s.user);
    const userId = user?.id;
    // Load a bigger chunk for scroll demo
    const { data, isLoading, error } = useUserScoreProgression(userId, 5);
    console.log("Score progression data:", data);

    let chartData: Array<{ match: string, score: number, date: string }> =
        (data || []).map((item, idx) => ({
            match: `M${idx + 1}`,
            score: item.score,
            date: item.date ? new Date(item.date).toLocaleDateString() : `Match ${idx + 1}`,
        }));

    // Set the chart width based on how many points you have!
    const chartWidth = Math.max(600, chartData.length * 80);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Score Progression</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">Last {chartData.length} matches</span>
            </div>
            {/* Main scrollable parent */}
            <div style={{ width: '100%', overflowX: 'auto' }}>
                {/* Inner container holds the actual chart */}
                <div style={{ minWidth: chartWidth }}>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis dataKey="match" fontSize={13} tickLine={false} />
                            <YAxis fontSize={13} tickLine={false} domain={['dataMin-5', 'dataMax+5']} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            {isLoading && <div className="text-xs mt-2 text-gray-400">Loading score progression...</div>}
            {error && <div className="text-xs mt-2 text-red-400">Unable to load chart.</div>}
        </div>
    );
}
