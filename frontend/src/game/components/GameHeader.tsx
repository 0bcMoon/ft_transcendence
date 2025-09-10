import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function GameHeader({ game }: { game: any }) {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white mb-5 shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Live Match</h1>
                    <p className="text-blue-100">
                        {game.waiting
                            ? "Searching for opponent..."
                            : game.isGameOver
                                ? "Match completed"
                                : "Game in progress"}
                    </p>
                </div>
                <Link to="/" className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center" >
                    <ArrowLeft size={18} className="mr-2" />
                    Home
                </Link>
            </div>
        </div>
    );
}
