export const tournamentKeys = {
    all: ['tournaments'] as const,
    lists: () => [...tournamentKeys.all, 'list'] as const,
    list: (filters?: any) => [...tournamentKeys.lists(), filters] as const,
    details: () => [...tournamentKeys.all, 'detail'] as const,
    detail: (id: number) => [...tournamentKeys.details(), id] as const,
    players: (id: number) => [...tournamentKeys.detail(id), 'players'] as const,
    bracket: (id: number) => [...tournamentKeys.detail(id), 'bracket'] as const,
    games: (id: number) => [...tournamentKeys.detail(id), 'games'] as const,
    roundGames: (id: number, round: number) => [
        ...tournamentKeys.games(id),
        'round',
        round,
    ] as const,
};
