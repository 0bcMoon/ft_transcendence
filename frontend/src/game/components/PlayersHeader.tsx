import { PlayerNames, PlayerAvatars, Scores } from "../types/types";

type PlayersHeaderProps = {
    playerNames: PlayerNames;
    playerAvatars?: PlayerAvatars | null;
    scores?: Scores | null;
};

export default function PlayersHeader({ playerNames, playerAvatars, scores, }: PlayersHeaderProps) {
    const leftName = playerNames.left ?? "Player 1";
    const rightName = playerNames.right ?? "Player 2";
    const leftScore = scores?.left ?? 0;
    const rightScore = scores?.right ?? 0;

    const renderAvatar = (name: string, avatar?: string | null) => {
        if (avatar) {
            return (
                <img
                    src={avatar}
                    alt={name}
                    className="w-12 h-12 rounded-full border-2 border-gray-800 object-cover bg-black"
                />
            );
        }
        return (
            <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xl border-2 border-gray-800">
                {name.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div className="bg-black px-6 py-5 border-b border-gray-900">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
                {/* Left Player */}
                <div className="flex items-center space-x-3">
                    {renderAvatar(leftName, playerAvatars?.left)}
                    <span className="text-lg font-semibold text-white">{leftName}</span>
                </div>

                {/* Score & VS */}
                <div className="flex items-center space-x-4 bg-gray-900 px-6 py-3 rounded-xl">
                    <span className="text-3xl font-extrabold text-white">{leftScore}</span>
                    <span className="text-xl font-bold text-yellow-500 px-2">VS</span>
                    <span className="text-3xl font-extrabold text-white">{rightScore}</span>
                </div>

                {/* Right Player */}
                <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-white">{rightName}</span>
                    {renderAvatar(rightName, playerAvatars?.right)}
                </div>
            </div>
        </div>
    );
}
