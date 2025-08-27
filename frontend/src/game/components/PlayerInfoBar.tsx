interface PlayerInfoBarProps {
    playerNames: { left: string; right: string };
}

export default function PlayerInfoBar({ playerNames }: PlayerInfoBarProps) {
    return (
        <div className="w-[800px] flex justify-between px-4 -mt-3 mb-1">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {playerNames.left.charAt(0).toUpperCase()}
                </div>
                <div className="text-green-400 font-semibold text-sm mt-1">
                    {playerNames.left}
                </div>
            </div>

            <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {playerNames.right.charAt(0).toUpperCase()}
                </div>
                <div className="text-blue-400 font-semibold text-sm mt-1">
                    {playerNames.right}
                </div>
            </div>
        </div>
    );
}

