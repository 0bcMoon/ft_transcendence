import { PlayerNames, PlayerAvatars } from "../types/types";

type PlayersHeaderProps = {
    playerNames: PlayerNames;
    playerAvatars?: PlayerAvatars | null;
};

export default function PlayersHeader({ playerNames, playerAvatars }: PlayersHeaderProps) {
    const leftName = playerNames.left ?? "Player 1";
    const rightName = playerNames.right ?? "Player 2";

    const renderAvatar = (name: string, avatar?: string | null) => {
        if (avatar) {
            return (
                <img src={avatar} alt={name}
                    className="w-12 h-12 rounded-full border-2 border-gray-300 object-cover"
                />
            );
        }
        return (
            <div className="w-12 h-12 rounded-full border-2 border-gray-300 bg-indigo-500 flex items-center justify-center text-white font-bold">
                {name.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div className="bg-white px-6 py-5 border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
                {/* Left Player */}
                <div className="flex items-center space-x-3">
                    {renderAvatar(leftName, playerAvatars?.left)}
                    <span className="text-lg font-semibold text-gray-900">{leftName}</span>
                </div>

                <div className="px-4 py-2 bg-gray-100 rounded-lg">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">VS</span>
                </div>

                {/* Right Player */}
                <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-900">{rightName}</span>
                    {renderAvatar(rightName, playerAvatars?.right)}
                </div>
            </div>
        </div>
    );
}

