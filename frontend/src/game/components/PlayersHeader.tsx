export default function PlayersHeader({ game }: { game: any }) {
    return (
        <div className="bg-gray-50 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between max-w-md mx-auto">
                <div className="flex items-center">
                    <img
                        src={"/default-avatar.png"}
                        className="w-8 h-8 rounded-full mr-3 border border-gray-200 object-cover"
                    />
                    <span className="font-medium text-gray-900">{game.playerNames.left}</span>
                </div>

                <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm">
                    VS
                </div>

                <div className="flex items-center">
                    <span className="font-medium text-gray-900">{game.playerNames.right}</span>
                    <img
                        src={"/default-avatar.png"}
                        className="w-8 h-8 rounded-full ml-3 border border-gray-200 object-cover"
                    />
                </div>
            </div>
        </div>
    );
}

