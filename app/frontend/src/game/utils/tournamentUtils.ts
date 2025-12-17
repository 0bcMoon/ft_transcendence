// ===================================================================
//  Local UI Types
// ===================================================================

/** A simple player object for the UI { id: 123, name: "Alice" } */
export interface BracketPlayer {
    id: number; // Use number for user IDs
    name: string;
}

/** A simple match object for the UI */
export interface BracketMatch {
    id: string; // Unique string for React key (e.g., "1-1")
    gameId: number;
    round: number;
    player1: BracketPlayer | null;
    player2: BracketPlayer | null;
    score1: number | null;
    score2: number | null;
    winner: BracketPlayer | null;
    status: string;
}

/** The final processed data structure for the component */
export interface TournamentData {
    id: string;
    name: string;
    players: BracketPlayer[];
    matches: BracketMatch[];
    status: string;
    maxPlayers: number;
}

// ===================================================================
//  Helper Functions
// ===================================================================

/** Gets the display name for a round */
export function roundName(round: number, totalRounds: number) {
    if (round === totalRounds) return "Final";
    if (round === totalRounds - 1) return "Semifinals";
    if (round === totalRounds - 2) return "Quarterfinals";
    return `Round ${round}`;
}
