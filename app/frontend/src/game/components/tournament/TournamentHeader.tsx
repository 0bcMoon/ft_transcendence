interface TournamentHeaderProps {
    tournament: {
        name: string;
        status: 'registration' | 'active' | 'finished' | 'cancelled';
        player_count: number;
        max_players: number;
        is_registered: boolean;
    };
    onRegister: () => void;
    onStart: () => void;
    isRegistering: boolean;
    isStarting: boolean;
}

const StatusBadge = ({ status }: { status: TournamentHeaderProps['tournament']['status'] }) => {
    switch (status) {
        case 'registration':
            return (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                    Open for Registration
                </div>
            );
        case 'active':
            return (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live Now
                </div>
            );
        case 'finished':
            return (
                <div className="px-3 py-1.5 rounded-full bg-slate-700 text-slate-300 text-xs font-semibold">
                    Finished
                </div>
            );
        case 'cancelled':
            return (
                <div className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-500 text-xs font-semibold">
                    Cancelled
                </div>
            );
        default:
            return null;
    }
};

export function TournamentHeader({ tournament, onRegister, isRegistering, }: TournamentHeaderProps) {
    const isTournamentFull = tournament.player_count >= tournament.max_players;

    return (
        <div className="relative bg-slate-900 rounded-2xl p-12 text-center border border-slate-800 shadow-xl shadow-black/20 overflow-hidden">

            <div className="flex justify-center mb-4">
                <StatusBadge status={tournament.status} />
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white">
                {tournament.name}
            </h1>

            <div className="mt-8 flex justify-center">
                {tournament.status === 'registration' && (
                    <>
                        {tournament.is_registered ? (
                            <div className="flex items-center gap-3 text-lg font-bold px-8 py-4 rounded-xl bg-green-500/20 text-green-400">
                                <span className="text-2xl">✓</span>
                                <span>You're Registered!</span>
                            </div>
                        ) : (
                            <button
                                onClick={onRegister}
                                disabled={isTournamentFull || isRegistering}
                                className="flex items-center justify-center gap-3 h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20
                                           disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100"
                            >
                                {isRegistering
                                    ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Registering...</span></>
                                    : isTournamentFull ? '🔒 Tournament Full' : '🎮 Join Tournament'
                                }
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

