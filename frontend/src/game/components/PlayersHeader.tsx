import { GameSession } from "../types/types";

type PlayersHeaderProps = {
    game: GameSession;
};

export default function PlayersHeader(props: PlayersHeaderProps) {
    return (
        <div className="bg-white px-6 py-5 border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
                <div className="flex items-center space-x-3">
                    <img
                        src={props.game.playerAvatars?.left}
                        alt={props.game.playerNames?.left}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 object-cover"
                    />
                    <span className="text-lg font-semibold text-gray-900">
                        {props.game.playerNames?.left}
                    </span>
                </div>

                <div className="px-4 py-2 bg-gray-100 rounded-lg">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">VS</span>
                </div>

                {/* Right Player */}
                <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-900">
                        {props.game.playerNames?.right}
                    </span>
                    <img
                        src={props.game.playerAvatars?.right}
                        alt={props.game.playerNames?.right || 'Player 2'}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 object-cover"
                    />
                </div>
            </div>
        </div>
    );
}
