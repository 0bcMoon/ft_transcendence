import { BracketData } from "../api/gameApi";

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

/** Fills the player list with TBD slots up to the maxPlayer count */
export function fillTournamentSlots(registered: BracketPlayer[], maxPlayers: number): BracketPlayer[] {
    const out = [...registered];
    for (let i = out.length; i < maxPlayers; i++) {
        // Use negative numbers for placeholder IDs
        out.push({ id: -(i + 1), name: "TBD" });
    }
    return out;
}

/** Converts the raw API bracket data into the simple UI-facing Match[] type */
export function buildMatchesFromBracketData(bracketData: BracketData): BracketMatch[] {
    if (!bracketData?.games || bracketData.games.length === 0) return [];

    return bracketData.games.map((game: any) => { // Use 'any' as API shape is complex
        const player1: BracketPlayer | null = game.player1_id ? { id: game.player1_id, name: game.player1_name || "TBD" } : null;
        const player2: BracketPlayer | null = game.player2_id ? { id: game.player2_id, name: game.player2_name || "TBD" } : null;

        let winner: BracketPlayer | null = null;
        if (game.winner_id) {
            if (game.winner_id === game.player1_id) winner = player1;
            else if (game.winner_id === game.player2_id) winner = player2;
        }
        return {
            id: `${game.round}-${game.match_order}`,
            gameId: game.game_id,
            round: game.round,
            player1, player2,
            score1: game.player1_score ?? null,
            score2: game.player2_score ?? null,
            winner,
            status: game.status || 'waiting',
        };
    });
}

/** Creates a placeholder bracket structure if no matches have been created yet */
export function buildEmptyMatches(players: BracketPlayer[]): BracketMatch[] {
    const totalPlayers = players.length;
    // Check if totalPlayers is a power of 2
    if (totalPlayers === 0 || (totalPlayers & (totalPlayers - 1)) !== 0) {
        console.warn("Cannot build empty matches: Player count must be a power of 2.");
        return []; // Cannot build a bracket
    }
    const totalRounds = Math.log2(totalPlayers);
    const matches: BracketMatch[] = [];

    // Round 1
    for (let i = 0; i < totalPlayers; i += 2) {
        matches.push({
            id: `1-${i / 2 + 1}`, gameId: 0, round: 1,
            player1: players[i] ?? null, player2: players[i + 1] ?? null,
            score1: null, score2: null, winner: null, status: 'waiting',
        });
    }
    // Future rounds
    for (let r = 2; r <= totalRounds; r++) {
        const matchCount = Math.pow(2, totalRounds - r);
        for (let i = 0; i < matchCount; i++) {
            matches.push({
                id: `${r}-${i + 1}`, gameId: 0, round: r,
                player1: null, player2: null,
                score1: null, score2: null, winner: null, status: 'waiting',
            });
        }
    }
    return matches;
}
