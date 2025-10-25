interface ScoreBoardProps {
    leftScore: number;
    rightScore: number;
    leftName?: string;
    rightName?: string;
}

export default function ScoreBoard({ leftScore, rightScore, leftName, rightName }: ScoreBoardProps) {
    return (
        <div className="flex justify-between items-center w-[800px] mb-4 px-6 py-3 bg-black/40 border-2 border-purple-500/60 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.6)] text-2xl font-bold text-white tracking-wider">
            <span className="text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
                {leftName ?? "Player 1"}: {leftScore}
            </span>
            <span className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                {rightName ?? "Player 2"}: {rightScore}
            </span>
        </div>
    );
}

