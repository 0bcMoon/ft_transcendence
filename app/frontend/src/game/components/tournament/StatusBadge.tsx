export function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'ongoing':
            return (
                <span className="inline-flex items-center gap-1. 5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Live Now
                </span>
            );
        case 'registration':
            return <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-semibold">Registration Open</span>;
        case 'upcoming':
            return <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-semibold">Upcoming</span>;
        case 'completed':
            return <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-semibold">Completed</span>;
        default:
            return null;
    }
}
