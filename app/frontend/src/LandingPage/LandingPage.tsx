import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Trophy, Activity, ChevronRight, Menu, X, Globe, Cpu, User } from 'lucide-react';

// Import your newly created components
import { Button } from './components/Button';
import { FeatureBox } from './components/FeatureBox';
import { GameModeCard } from './components/GameModeCard';

export default function LandingPage() {
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
                        <span>PONG<span className="text-blue-500">.1337</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#modes" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Game Modes</a>
                        <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
                        <Button variant="primary" to="/register" className="py-2 px-4 text-sm">Start Playing</Button>
                    </div>
                    <button className="md:hidden text-slate-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-slate-800 p-6 flex flex-col gap-4 shadow-2xl">
                        <a href="#modes" className="text-lg font-medium text-slate-300" onClick={() => setIsMobileMenuOpen(false)}>Game Modes</a>
                        <a href="#features" className="text-lg font-medium text-slate-300" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                        <Link to="/login" className="text-lg font-medium text-slate-300" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                        <Button variant="primary" to="/register" className="w-full justify-center">Start Playing</Button>
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
                        <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2"></div>
                        <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom opacity-50"></div>
                            <div className="absolute left-20 top-1/2 -translate-y-1/2 w-4 h-24 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse"></div>
                            <div className="absolute right-20 top-1/2 -translate-y-1/2 w-4 h-24 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)]"></div>
                            <div className="w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10"></div>
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
                        <GameModeCard icon={<Globe size={32} />} title="Remote Game" desc="Challenge players from around the world in ranked or casual online matches." color="blue-500" />
                        <GameModeCard icon={<Trophy size={32} />} title="Tournaments" desc="Automated daily and weekly elimination brackets with prize pools and global rankings." color="cyan-500" />
                        <GameModeCard icon={<Cpu size={32} />} title="AI Challenge" desc="Test your skills against our advanced AI with multiple difficulty levels and training modes." color="purple-500" />
                        <GameModeCard icon={<User size={32} />} title="Local Games" desc="Play classic 1v1 matches with a friend on the same keyboard or with shared controllers." color="green-500" />
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
                        <FeatureBox icon={<Trophy size={24} />} title="Ranked Leagues" desc="Climb the ladder from Iron to Challenger.  Seasonal rewards and profile badges for top players." />
                        <FeatureBox icon={<Activity size={24} />} title="Real-time Physics" desc="Powered by a custom WebSocket engine ensuring 60fps synchronization and zero lag." />
                        <FeatureBox icon={<Play size={24} />} title="Instant Replays" desc="Watch your last match automatically recorded and save your best highlights to your profile." />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 border-t border-slate-800 py-8 relative z-10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-slate-500 text-sm">© 2025 Pong.1337. All rights reserved. </p>
                </div>
            </footer>
        </div>
    );
}

