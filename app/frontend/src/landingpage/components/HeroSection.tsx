export default function HeroSection() {
    return (
        <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
            {/* Hero Content */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                The Future of <br className="hidden md:block" />
                Competitive <span className="text-blue-500">Ping Pong</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Challenge players worldwide, enter tournaments, or play with friends. Pure Pong action directly in your browser.
            </p>

            {/* 3D Dashboard Preview */}
            <div className="relative mx-auto max-w-5xl">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur-lg opacity-20"></div>

                <div className="relative rounded-xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden aspect-[16/9] flex flex-col group">
                    {/* Fake Browser Header */}
                    <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2"></div>

                    {/* Game UI Content */}
                    <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">

                        {/* Paddle Left */}
                        <div className="absolute left-20 top-1/2 -translate-y-1/2 w-4 h-24 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse"></div>

                        {/* Paddle Right */}
                        <div className="absolute right-20 top-1/2 -translate-y-1/2 w-4 h-24 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse "></div>

                        {/* Ball */}
                        <div className="w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10 animate-pulse"></div>

                        {/* Score HUD */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-8 font-mono text-4xl font-bold opacity-20">
                            <span>0</span>
                            <span>:</span>
                            <span>0</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};
