interface StatData {
    label: string;
    value: number;
    color: string;
}

interface StatisticsChartProps {
    data: StatData[];
    title: string;
}

export default function StatisticsChart({ data, title }: StatisticsChartProps) {
    const maxValue = Math.max(...data.map(item => item.value));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-6">{title}</h3>
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index} className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {item.label}
                                </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                                {item.value}
                            </span>
                        </div>
                        <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                            <div
                                className="h-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${(item.value / maxValue) * 100}%`,
                                    backgroundColor: item.color
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
