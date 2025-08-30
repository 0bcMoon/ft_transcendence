interface PlayerInfoBarProps {
    playerNames: { left: string; right: string };
}

export default function PlayerInfoBar({ playerNames }: PlayerInfoBarProps) {
    return (
        <div className="w-full max-w-screen-md flex justify-between px-4 sm:px-6 lg:px-8 -mt-3 mb-2 mx-auto">
            {/* Left Player */}
            <div className="flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md">
                    {playerNames.left.charAt(0).toUpperCase()}
                </div>
                <div className="text-green-400 font-semibold text-sm mt-1 text-center truncate max-w-[120px]">
                    {playerNames.left}
                </div>
            </div>

            {/* Right Player */}
            <div className="flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md">
                    {playerNames.right.charAt(0).toUpperCase()}
                </div>
                <div className="text-blue-400 font-semibold text-sm mt-1 text-center truncate max-w-[120px]">
                    {playerNames.right}
                </div>
            </div>
        </div>
    );
}

