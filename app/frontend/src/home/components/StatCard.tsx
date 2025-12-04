import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
}

export default function StatCard({ title, value, icon, trend }: StatCardProps) {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 backdrop-blur-sm 
            border border-gray-200 dark:border-slate-800 
            hover:border-gray-300 dark:hover:border-slate-700 
            hover:shadow-lg dark:hover:shadow-none
            transition-all duration-300 group hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 
                    flex items-center justify-center text-blue-600 dark:text-blue-400 
                    group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                {trend && (
                    <span className="text-sm font-medium text-green-600 dark:text-green-400 
                        bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded">
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
}
