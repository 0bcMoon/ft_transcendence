import type React from "react"
interface StatCardProps {
    value: React.ReactNode
    label: string
    icon: React.ReactNode
    iconBgColor?: string
    iconColor?: string
    className?: string
}

export default function StatCard({
    label,
    value,
    icon,
    iconBgColor = "bg-blue-500/10",
    iconColor = "text-blue-400",
    className = "",
}: StatCardProps) {
    return (
        <div
            className={`p-6 rounded-xl bg-slate-900 border border-slate-800 
        hover:border-slate-700 hover:bg-slate-800/50
        transition-all duration-200 group ${className}`}
        >
            {/* Icon */}
            <div className="flex items-center mb-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${iconBgColor} ${iconColor}`}>
                    {icon}
                </div>
            </div>

            {/* Label */}
            <div className="text-sm font-medium text-slate-400 mb-1 uppercase tracking-wide">{label}</div>

            {/* Value */}
            <div className="text-3xl font-bold text-white">{value}</div>
        </div>
    )
}

