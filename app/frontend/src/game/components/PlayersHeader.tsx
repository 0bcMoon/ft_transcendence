import { PlayerNames, PlayerAvatars } from "../../types/types";

type PlayersHeaderProps = {
    playerNames: PlayerNames;
    playerAvatars?: PlayerAvatars | null;
};

const PlayerInfo = ({ name, avatar }: { name: string; avatar?: string | null }) => (
    <div className="flex items-center gap-4">
        {avatar ? (
            <img src={avatar} alt={name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-700" />
        ) : (
            <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-xl text-white">
                {name.charAt(0).toUpperCase()}
            </div>
        )}
        <p className="font-bold text-lg text-white truncate max-w-[150px]">{name}</p>
    </div>
);

export default function PlayersHeader({ playerNames, playerAvatars }: PlayersHeaderProps) {
    const leftName = playerNames.left ?? "Player 1";
    const rightName = playerNames.right ?? "Player 2";

    return (
        <div className="relative w-full max-w-4xl mx-auto px-6 py-4 bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl flex items-center justify-between overflow-hidden">

            <PlayerInfo name={leftName} avatar={playerAvatars?.left} />

            <div className="font-mono text-4xl font-bold text-slate-600">
                VS
            </div>

            <div className="flex items-center gap-4 flex-row-reverse">
                <PlayerInfo name={rightName} avatar={playerAvatars?.right} />
            </div>

            <div className="absolute bottom-0 left-0 w-1/3 h-1 bg-blue-500 rounded-r-full blur-sm opacity-80"></div>
            <div className="absolute bottom-0 right-0 w-1/3 h-1 bg-red-500 rounded-l-full blur-sm opacity-80"></div>
        </div>
    );
}

