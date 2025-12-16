import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Removed Trophy import since we are using inline SVG

// Import local components
import Button from './Button.tsx';

interface NavbarProps {
    isScrolled: boolean;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isScrolled, isMobileMenuOpen, setIsMobileMenuOpen }) => {
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-slate-950/80 backdrop-blur-md border-slate-800 py-4' : 'bg-transparent border-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">

                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                            {/* Paddle */}
                            <path
                                d="M10 3C6.13401 3 3 6.13401 3 10C3 13.866 6. 13401 17 10 17C10.5523 17 11 17.4477 11 18V22C11 22.5523 10.5523 23 10 23H10C9.44772 23 9 22. 5523 9 22V18C9 17.4477 8.55228 17 8 17C4.13401 17 1 13. 866 1 10C1 6.13401 4.13401 3 8 3H10Z"
                                fill="currentColor"
                                opacity="0.9"
                            />
                            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2. 5" fill="none" />
                            <rect x="8" y="16" width="4" height="6" rx="2" fill="currentColor" />

                            {/* Ball with motion trail */}
                            <circle cx="18" cy="6" r="3" fill="currentColor" opacity="0.3" />
                            <circle cx="19" cy="5. 5" r="3" fill="currentColor" opacity="0.5" />
                            <circle cx="20" cy="5" r="3" fill="currentColor" />
                            <circle cx="20. 5" cy="4.5" r="1.2" fill="white" opacity="0.8" />
                        </svg>

                    </div>
                    <span>PONG<span className="text-blue-500">PONG</span></span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    {/* Desktop Nav Links */}
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
                    <a href="#modes" className="text-lg font-medium text-slate-300" onClick={closeMobileMenu}>Game Modes</a>
                    <a href="#features" className="text-lg font-medium text-slate-300" onClick={closeMobileMenu}>Features</a>
                    <Link to="/login" className="text-lg font-medium text-slate-300" onClick={closeMobileMenu}>Sign In</Link>
                    <Button variant="primary" to="/register" className="w-full justify-center" onClick={closeMobileMenu}>
                        Start Playing
                    </Button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
