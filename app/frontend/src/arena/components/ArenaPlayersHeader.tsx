export default function ArenaPlayersHeader({
    playerNames,
    playerAvatars,
  }: {
    playerNames: { p1: string; p2: string } | null;
    playerAvatars: { p1: string | null; p2: string | null } | null;
  }) {
    if (!playerNames) return null;
  
    const getAvatar = (avatar: string | null, name: string) =>
      avatar
        ? `${import.meta.env.VITE_API_URL}/public/${avatar}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=64`;
  
    return (
      <div className="relative w-full max-w-5xl mx-auto flex items-center justify-between px-4 py-3 pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <img
            src={getAvatar(playerAvatars?.p1 ?? null, playerNames.p1)}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-blue-500 object-cover shadow-lg"
          />
          <span className="text-white font-semibold truncate max-w-[140px] text-center">
            {playerNames.p1}
          </span>
        </div>
  
        <div className="flex flex-col items-center gap-2">
          <img
            src={getAvatar(playerAvatars?.p2 ?? null, playerNames.p2)}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-red-500 object-cover shadow-lg"
          />
          <span className="text-white font-semibold truncate max-w-[140px] text-center">
            {playerNames.p2}
          </span>
        </div>
      </div>
    );
  }
  