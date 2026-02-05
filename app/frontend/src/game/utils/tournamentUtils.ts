// ===================================================================
//  Local UI Types
// ===================================================================

/** A simple player object for the UI { id: 123, name: "Alice" } */
export interface BracketPlayer {
    id: number; // Use number for user IDs
    name: string;
}

/** The final processed data structure for the component */
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
