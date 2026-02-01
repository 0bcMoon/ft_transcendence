import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

const Navbar: React.FC = () => {
    return (
        <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md py-4">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Activity size={18} className="text-white" />
                    </div>
                    PONG<span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">.1337</span>
                </div>

                <div className="flex items-center gap-4">
                    <Link 
                        to="/login" 
                        className="px-4 py-2 text-sm rounded-full font-medium transition-all duration-300 flex items-center gap-2 active:scale-95 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]" >
                        Start Playing
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
