type GameInstructionsProps = {
    userSide: "left" | "right";
    mode: string;
};

export default function GameInstructions({ userSide, mode}: GameInstructionsProps) {
    return (
        <div className="w-full max-w-[100%] bg-slate-900 rounded-lg border border-slate-800 p-3 sm:p-4 mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
            {userSide && (
                <span className={`font-semibold capitalize whitespace-nowrap ${userSide === "right" ? "text-red-400" : "text-blue-400"}`}>
                    You are on {userSide} side
                </span>
            )}
            {mode && (
                <span className="font-semibold bg-slate-700 px-2 py-0.5 rounded whitespace-nowrap text-slate-300">
                    Mode: {mode}
                </span>
            )}
            
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <span className="text-slate-300 whitespace-nowrap">Move:</span>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white">W</kbd>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white">S</kbd>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white">↑</kbd>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white">↓</kbd>
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                <span className="text-slate-300">Exit:</span>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white">Esc</kbd>
            </div>
            <div className="w-px h-6 bg-slate-700"></div>
            <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                <span className="text-slate-300">Play Again:</span>
                <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white">Enter</kbd>
            </div>
        </div>
    );
}
