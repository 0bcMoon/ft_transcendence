import { Link } from 'react-router-dom';
import { Trophy, Users, Zap, Cpu } from 'lucide-react';


const gameModes = [
    {
        id: 'quick',
        icon: <Zap size={28} className="text-green-600" />,
        bgColor: 'bg-green-100',
        hoverBorder: 'hover:border-green-200',
        hoverBg: 'hover:bg-green-50/30',
        buttonColor: 'bg-green-600 hover:bg-green-700',
        title: 'Quick Start',
        description: 'Play real-time matches with friends. Climb the leaderboard and earn glory in epic battles.',
        link: '/game/quick',
        buttonText: 'Start'
    },
    {
        id: 'ai',
        icon: <Cpu size={28} className="text-orange-600" />,
        bgColor: 'bg-orange-100',
        hoverBorder: 'hover:border-orange-200',
        hoverBg: 'hover:bg-orange-50/30',
        buttonColor: 'bg-orange-600 hover:bg-orange-700',
        title: 'AI Challenge',
        description: 'Test your skills against artificial intelligence opponents of varying difficulties. Perfect for practice and improvement.',
        link: '/game/ai',
        buttonText: 'Challenge AI'
    },
    {
        id: 'tournament',
        icon: <Trophy size={28} className="text-blue-600" />,
        bgColor: 'bg-blue-100',
        hoverBorder: 'hover:border-blue-200',
        hoverBg: 'hover:bg-blue-50/30',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        title: 'Tournament',
        description: 'Join or create tournaments with multiple players. Compete in bracket-style competitions and win trophies.',
        link: '/game/tournament',
        buttonText: 'Join'
    },
    {
        id: 'local',
        icon: <Users size={28} className="text-purple-600" />,
        bgColor: 'bg-purple-100',
        hoverBorder: 'hover:border-purple-200',
        hoverBg: 'hover:bg-purple-50/30',
        buttonColor: 'bg-purple-600 hover:bg-purple-700',
        title: 'Local Game',
        description: 'Play on the same device with a friend. Perfect for in-person challenges.',
        link: '/game/local',
        buttonText: 'Play'
    }
];

export default function Game() {
    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-6xl mx-auto w-full px-4 py-4 pb-20 md:pb-6">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-5 text-white mb-8 shadow-md text-center">
                    <h1 className="text-2xl font-bold mb-1">Welcome to Pong Arena</h1>
                    <p className="text-blue-100">
                        Challenge players in real-time matches or tournaments to climb the ranks.
                    </p>
                </div>

                {/* Game Options Grid */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-900 text-lg mb-6 text-center">Select Game Mode</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {gameModes.map((mode) => (
                            <div
                                key={mode.id}
                                className={`border border-gray-200 rounded-xl p-6 transition-all flex flex-col items-center text-center ${mode.hoverBorder} ${mode.hoverBg}`}
                            >
                                <div className={`${mode.bgColor} p-3 rounded-full mb-3`}>
                                    {mode.icon}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{mode.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 flex-grow">{mode.description}</p>
                                <Link
                                    to={mode.link}
                                    className={`${mode.buttonColor} text-white py-2 px-6 rounded-lg inline-block transition-colors w-full`}
                                >
                                    {mode.buttonText}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

