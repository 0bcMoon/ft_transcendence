export type TournamentStatus = 'open' | 'in_progress' | 'completed';
export type MatchFormat = 'bo1' | 'bo3';

export interface Player {
    id: string;
    name: string;
    isHost: boolean;
}

export interface Tournament {
    id: string; // e.g. "TRN-8F3K"
    name: string;
    maxPlayers: number; // 4 | 8 | 16
    currentPlayers: number;
    isPrivate: boolean;
    status: TournamentStatus;
    format: MatchFormat;
    createdAt: string; // ISO
    players: Player[];
    password?: string; // mock only
}
