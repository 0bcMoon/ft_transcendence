import React from 'react';

interface StatCardProps {
    value: React.ReactNode;
    label: string;
    icon: React.ReactNode;
    iconBgColor?: string;   // E.g. 'bg-blue-100'
    iconColor?: string;     // E.g. 'text-blue-600'
    className?: string;     // For additional custom styling
}

export default function StatCard({
    label,
    value,
    icon,
    iconBgColor = 'bg-blue-100 dark:bg-blue-900/40',
    iconColor = 'text-blue-600 dark:text-blue-300',
    className = "",
}: StatCardProps) {
    return (
        <div
            className={
                `p-4 sm:p-6 rounded-2xl relative overflow-hidden bg-white/80 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-slate-800 
                shadow-md dark:shadow-none group hover:shadow-xl
                transition-all duration-200 cursor-pointer ${className}`
            }
        >
            {/* Icon with glow */}
            <div className="flex items-center mb-5">
                <span className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14`}>
                    {/* Glowing behind-icon effect */}
                    <span className={`absolute inset-0 rounded-xl blur-md opacity-50 ${iconBgColor}`} />
                    <span className={`relative z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${iconBgColor} ${iconColor} shadow-sm`}>
                        {icon}
                    </span>
                </span>
            </div>
            {/* Label */}
            <div className="text-xs sm:text-sm font-semibold tracking-wide text-gray-500 dark:text-slate-400 mb-2 uppercase">
                {label}
            </div>
            {/* Value */}
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-200">
                {value}
            </div>
        </div>
    );
}
