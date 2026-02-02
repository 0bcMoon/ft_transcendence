import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Trophy, Activity, ChevronRight, Menu, X, Globe, Cpu, User } from 'lucide-react';
// import { Privacy_Policy } from './Privacy_policy/Privacy_policy';

// --- Types ---
interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'outline';
    children: React.ReactNode;
    to?: string;
    className?: string;
}

interface FeatureBoxProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
}

interface GameModeCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
    color: string;
}

// --- Reusable Components ---
const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, to, className = '' }) => {
    const baseStyle = "px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 active:scale-95";
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]",
        secondary: "bg-white text-slate-950 hover:bg-slate-200",
        outline: "border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white bg-transparent backdrop-blur-sm"
    };
    const classes = `${baseStyle} ${variants[variant]} ${className}`;
    return to ? (
        <Link to={to} className={classes}>
            {children}
        </Link>
    ) : (
        <button className={classes}>
            {children}
        </button>
    );
};

const FeatureBox: React.FC<FeatureBoxProps> = ({ icon, title, desc }) => (
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

const GameModeCard: React.FC<GameModeCardProps> = ({ icon, title, desc, color }) => (
    <div className={`p-8 rounded-2xl border border-slate-800 backdrop-blur-sm bg-slate-900/50 hover:border-${color}/50 transition-all duration-300 group`}>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-${color}/20 text-${color} group-hover:shadow-lg transition-all`}>
            {icon}
        </div>
        <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-slate-400">{desc}</p>
    </div>
);

// --- Main Page ---
const LandingPage: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-blue-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-[100%] blur-[100px] opacity-50"></div>
            </div>
            {/* Navbar */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-slate-800 py-4' : 'bg-transparent border-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Activity size={18} className="text-white" />
                        </div>
                        PONG<span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">.1337</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#modes" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Game Modes</a>
                        <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                            Sign In
                        </Link>
                        <Button variant="primary" to="/register" className="py-2 px-4 text-sm">
                            Start Playing
                        </Button>
                    </div>
                    <button className="md:hidden text-slate-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-slate-800 p-6 flex flex-col gap-4 shadow-2xl">
                        <a href="#modes" className="text-lg font-medium text-slate-300" onClick={() => setIsMobileMenuOpen(false)}>Game Modes</a>
                        <a href="#features" className="text-lg font-medium text-slate-300" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                        <Link to="/login" className="text-lg font-medium text-slate-300" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                        <Button variant="primary" to="/register" className="w-full justify-center">
                            Start Playing
                        </Button>
                    </div>
                )}
            </nav>
            {/* Hero Section */}
            <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                    The Future of <br className="hidden md:block" />
                    Competitive <span className="text-blue-500">Ping Pong</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Experience low-latency gameplay, real-time physics, and global tournaments directly in your browser. No download required.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-20">
                    <Button variant="primary" to="/register" className="w-full md:w-auto text-lg h-12 px-8">
                        Play Now <ChevronRight size={18} />
                    </Button>
                </div>
                {/* 3D Dashboard Preview */}
                <div className="relative mx-auto max-w-5xl">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur-lg opacity-20"></div>
                    <div className="relative rounded-xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden aspect-[16/9] flex flex-col group">
                        {/* Fake Browser Header (icons removed) */}
                        <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                            {/* The red, yellow, and green dots were removed from here */}
                        </div>
                        {/* Game UI Content */}
                        <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom opacity-50"></div>
                            {/* Paddle Left */}
                            <div className="absolute left-20 top-1/2 -translate-y-1/2 w-4 h-24 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse"></div>
                            {/* Paddle Right */}
                            <div className="absolute right-20 top-1/2 -translate-y-1/2 w-4 h-24 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)]"></div>
                            {/* Ball */}
                            <div className="w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10"></div>
                            {/* Score HUD */}
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-8 font-mono text-4xl font-bold opacity-20">
                                <span>04</span>
                                <span>:</span>
                                <span>02</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {/* Game Modes Section */}
            <section id="modes" className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Choose Your Arena 🏆</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Four distinct ways to play and prove your mastery over the table.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        <GameModeCard
                            icon={<Globe size={32} />}
                            title="Remote Game"
                            desc="Challenge players from around the world in ranked or casual online matches."
                            color="blue-500"
                        />
                        <GameModeCard
                            icon={<Trophy size={32} />}
                            title="Tournaments"
                            desc="Automated daily and weekly elimination brackets with prize pools and global rankings."
                            color="cyan-500"
                        />
                        <GameModeCard
                            icon={<Cpu size={32} />}
                            title="AI Challenge"
                            desc="Test your skills against our advanced AI with multiple difficulty levels and training modes."
                            color="purple-500"
                        />
                        <GameModeCard
                            icon={<User size={32} />}
                            title="Local Games"
                            desc="Play classic 1v1 matches with a friend on the same keyboard or with shared controllers."
                            color="green-500"
                        />
                    </div>
                </div>
            </section>
            <hr className="border-slate-800 max-w-7xl mx-auto" />
            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-950 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">Core Platform Features</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            The technology powering the next generation of digital table tennis.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureBox
                            icon={<Trophy size={24} />}
                            title="Ranked Leagues"
                            desc="Climb the ladder from Iron to Challenger.  Seasonal rewards and profile badges for top players."
                        />
                        <FeatureBox
                            icon={<Activity size={24} />}
                            title="Real-time Physics"
                            desc="Powered by a custom WebSocket engine ensuring 60fps synchronization and zero lag."
                        />
                        <FeatureBox
                            icon={<Play size={24} />}
                            title="Instant Replays"
                            desc="Watch your last match automatically recorded and save your best highlights to your profile."
                        />
                    </div>
                </div>
            </section>
            {/* Footer */}
            <footer className="bg-slate-950 border-t border-slate-800 py-8 relative z-10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    {/* onrievacy_Policy/> */}
                     {/* <div onClick={Navigate("privacy-policy")}>Privacy_Policy </div> */}
                    <p className="text-slate-500 text-sm">© 2025 Pong.1337. All rights reserved. </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

