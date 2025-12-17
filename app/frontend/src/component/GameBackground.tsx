import React from 'react';

interface GameBackgroundProps {
    variant?: 'default' | 'intense' | 'subtle';
}

export const GameBackground: React.FC<GameBackgroundProps> = ({ variant = 'default' }) => {
    const variants = {
        default: {
            color1: 'bg-blue-500/10',
            color2: 'bg-purple-500/10',
            blur: 'blur-3xl',
        },
        intense: {
            color1: 'bg-blue-500/20',
            color2: 'bg-purple-500/20',
            blur: 'blur-2xl',
        },
        subtle: {
            color1: 'bg-blue-500/5',
            color2: 'bg-purple-500/5',
            blur: 'blur-3xl',
        },
    };

    const style = variants[variant];

    return (

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-0 left-1/4 w-96 h-96 ${style.color1} rounded-full ${style.blur} animate-pulse`}></div>
            <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${style.color2} rounded-full ${style.blur} animate-pulse`} style={{ animationDelay: '700ms' }}></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
    );
};

export default GameBackground;
