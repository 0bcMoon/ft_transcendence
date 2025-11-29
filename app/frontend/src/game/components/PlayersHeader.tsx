import { PlayerNames, PlayerAvatars, Scores } from "../../types/types";

type PlayersHeaderProps = {
    playerNames: PlayerNames;
    playerAvatars?: PlayerAvatars | null;
    scores?: Scores | null;
};

const PlayerAvatar = ({ name, avatar }: { name: string; avatar?: string | null }) => (
    avatar ? (
        <img
            src={avatar}
            alt={name}
            className="w-15 h-15 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
        />
    ) : (
        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-2xl text-gray-700 dark:text-gray-200">
            {name.charAt(0).toUpperCase()}
        </div>
    )
);

export default function PlayersHeader({ playerNames, playerAvatars, scores }: PlayersHeaderProps) {
    const leftName = playerNames.left ?? "Player 1";
    const rightName = playerNames.right ?? "Player 2";
    const leftScore = scores?.left ?? 0;
    const rightScore = scores?.right ?? 0;

    return (
        <div className="w-full px-6 py-4 bg-white dark:bg-gray-800 flex items-center justify-between rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
                <PlayerAvatar name={leftName} avatar={playerAvatars?.left} />
                <span className="font-semibold text-lg text-gray-900 dark:text-white">{leftName}</span>
            </div>
            <div className="flex items-center gap-5 bg-gray-100 dark:bg-gray-700 px-6 py-2 rounded-lg">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{leftScore}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-xl">VS</span>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{rightScore}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="font-semibold text-lg text-gray-900 dark:text-white">{rightName}</span>
                <PlayerAvatar name={rightName} avatar={playerAvatars?.right} />
            </div>
        </div>
    );
}

