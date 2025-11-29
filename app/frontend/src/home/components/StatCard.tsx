import React from 'react';

type Props = {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
};

export default function StatCard({ title, value, icon, trend }: Props) {
    const iconElement = React.isValidElement(icon) ? React.cloneElement(icon, { size: 24, strokeWidth: 1.5 } as any) : null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className="text-gray-900 dark:text-white">{iconElement}</div>
                {trend && (
                    <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                        {trend}
                    </div>
                )}
            </div>

            <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            </div>
        </div>
    );
}
