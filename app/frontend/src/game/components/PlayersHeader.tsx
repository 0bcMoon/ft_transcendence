import { PlayerNames, PlayerAvatars } from "@/game/types/types";

type PlayersHeaderProps = {
    playerNames: PlayerNames | null;
    playerAvatars: PlayerAvatars | null;
};

export default function PlayersHeader({ playerNames, playerAvatars }: PlayersHeaderProps) {
    if (!playerNames) 
        return null;

    return (
        <div className="relative w-full max-w-5xl mx-auto flex items-center justify-between px-4 py-3 pointer-events-none">
            {/* Left Player */}
            <div className="flex flex-col items-center gap-2">
                {playerAvatars?.left ? (
                    <img
                        src={playerAvatars.left}
                        alt={playerNames.left ?? "Player 1"}
                        className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-blue-500 object-cover shadow-lg"
                    />
                ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-slate-700 border-4 border-blue-500 flex items-center justify-center font-bold text-white shadow-lg">
                        {(playerNames.left ?? "P")[0].toUpperCase()}
                    </div>
                )}
                <span className="text-white font-semibold truncate max-w-[140px] text-center text-sm sm:text-base lg:text-lg">
                    {playerNames.left ?? "Player 1"}
                </span>
            </div>

            {/* Right Player */}
            <div className="flex flex-col items-center gap-2">
                {playerAvatars?.right ? (
                    <img
                        src={playerAvatars.right}
                        alt={playerNames.right ?? "Player 2"}
                        className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-red-500 object-cover shadow-lg"
                    />
                ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-slate-700 border-4 border-red-500 flex items-center justify-center font-bold text-white shadow-lg">
                        {(playerNames.right ?? "P")[0].toUpperCase()}
                    </div>
                )}
                <span className="text-white font-semibold truncate max-w-[140px] text-center text-sm sm:text-base lg:text-lg">
                    {playerNames.right ?? "Player 2"}
                </span>
            </div>
        </div>
    );
}

