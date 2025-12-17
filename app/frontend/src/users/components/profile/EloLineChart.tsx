import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
    { game: '1', elo: 900 },
    { game: '2', elo: 920 },
    { game: '3', elo: 950 },
    { game: '4', elo: 940 },
    { game: '5', elo: 960 },
    { game: '6', elo: 1000 },
    { game: '7', elo: 1012 },
    { game: '8', elo: 1050 },
    { game: '9', elo: 1030 },
    { game: '10', elo: 1080 },
];

const EloLineChart: React.FC = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 mb-8">
        <h3 className="mb-4 text-base font-semibold text-gray-700 dark:text-gray-100">ELO Progress</h3>
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-slate-700" />
                <XAxis dataKey="game" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} domain={['auto', 'auto']} />
                <Tooltip
                    contentStyle={{
                        background: '#fff',
                        borderRadius: 12,
                        border: '1px solid #e5e7eb',
                        fontSize: 13,
                        color: '#0f172a'
                    }}
                    labelStyle={{ color: '#64748b', fontWeight: 600 }}
                />
                <Line
                    type="monotone"
                    dataKey="elo"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#6366f1' }}
                    activeDot={{ r: 5, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }}
                />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export default EloLineChart;
