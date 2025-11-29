export interface CurrentUser {
    id: number,
    username: string,
    display_name: string,
    email: string,
    profile_picture: string | null,
    oauth_type: 'local' | 'google' | 'intra42';
    two_factor_enabled: boolean;
}


type RelationshipStatus = 'friend' | 'pending' | "waiting" | 'blocking' | 'blocked_by' | 'none';

export interface RemoteUser {
    id: number;
    display_name: string;
    req_id?: number;
    relation_status: RelationshipStatus
    username?: string;
    profile_picture?: string;
    online_status?: boolean;
}

export type GameMode = "1v1" | "ai" | "tournament" | "local";

export type Side = "left" | "right";

export interface GlobalMatchData {
    matchId: number;
    mode: GameMode;
    date: string;
    player1_id?: number | null;
    player1_name: string;
    player1_avatar: string;
    player1_score: number;
    player2_id?: number | null;
    player2_name: string;
    player2_avatar: string;
    player2_score: number;
    winner_id?: number | null;
}


export interface KeysPressed {
    w: boolean;
    s: boolean;
    ArrowUp: boolean;
    ArrowDown: boolean;
}
export interface BracketPlayer {
    id: number;
    name: string;
}

export interface BracketMatch {
    id: string;
    gameId: number;
    round: number;
    player1: BracketPlayer | null;
    player2: BracketPlayer | null;
    score1: number | null;
    score2: number | null;
    winner: BracketPlayer | null;
    status: string;
}

export interface TournamentData {
    id: string;
    name: string;
    players: BracketPlayer[];
    matches: BracketMatch[];
    status: string;
    maxPlayers: number;
}
export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Scores {
    left: number;
    right: number;
}

export interface PlayerNames {
    left: string;
    right: string;
}

export interface PlayerAvatars {
    left: string | null;
    right: string | null;
}

export interface Player {
    id: number;
    username: string;
    socket: WebSocket | null;
    mode?: GameMode;
    side?: Side; // Changed from 'position'
    avatar?: string;
}

export interface Match {
    game_id: number;
    players: {
        left?: Player;
        right?: Player;
    };
    state: GameState;
    ready: {
        left: boolean;
        right: boolean;
    };
    startTime: number;
    loop?: NodeJS.Timeout;
    mode: GameMode;
}
export interface GameState {
    ball: {
        x: number;
        y: number;
        speedX: number;
        speedY: number;
        radius: number;
    };
    leftPaddle: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    rightPaddle: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    score: {
        left: number;
        right: number;
    };
}



export interface LocalGame {
    gameStateRef: React.MutableRefObject<GameState | null>;
    countdown: number | null;
    isGameOver: boolean;
    winner: Side | null;
    finalScore: Scores | null;
    handlePlayAgain: () => void;
    playerNames: PlayerNames;
}

export interface GameSession {
    gameStateRef: React.MutableRefObject<GameState | null>;
    side: Side | null;
    countdown: number | null;
    isGameOver: boolean;
    winner: Side | null;
    waiting: boolean;
    playerNames: PlayerNames | null;
    playerAvatars: PlayerAvatars | null;
    finalScore: Scores | null;
    handlePlayAgain: () => void;
    handleGoHome: () => void;
}

export type ServerMessage =
    | {
        type: "matchFound";
        mode: GameMode;
        side: Side;
        playerNames: PlayerNames;
        playerAvatars: PlayerAvatars;
        id: string;
    }
    | { type: "state"; state: GameState }
    | { type: "gameOver"; winner: Side; score: Scores }
    | { type: "leaveGame" };

