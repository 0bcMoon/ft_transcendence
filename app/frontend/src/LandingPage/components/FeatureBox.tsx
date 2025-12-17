import React from 'react';

type FeatureBoxProps = {
    icon: React.ReactNode;
    title: string;
    desc: string;
};

export function FeatureBox({ icon, title, desc }: FeatureBoxProps) {
    return (
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-all duration-500 group">
            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4 border border-slate-800 group-hover:border-blue-500/30 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all">
                <div className="text-slate-400 group-hover:text-blue-400 transition-colors">
                    {icon}
                </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{desc}</p>
        </div>
    );
}
