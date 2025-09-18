export type Position = "top" | "right" | "bottom" | "left";
export type Side = Position;

export interface Player {
    id: number;
    username: string;
    socket: WebSocket | null;
    mode?: GameMode;
    position?: Position;
    avatar?: string;
}

export type GameMode = "1v1" | "ai" | "tournament" | "local" | "4p";

/** Flexible paddles for any mode */
export type Paddles = Partial<Record<Side, Paddle>>;

export interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** Flexible scores for any mode */
export type Scores = Partial<Record<Side, number>>;

export interface GameState {
    ball: {
        x: number;
        y: number;
        speedX: number;
        speedY: number;
        radius: number;
    };
    paddles: Paddles;
    score: Scores;
}

export interface Match {
    game_id: number;
    players: Partial<Record<Side, Player>>;
    state: GameState;
    ready: Partial<Record<Side, boolean>>;
    startTime: number;
    loop?: NodeJS.Timeout;
    mode: GameMode;
}

/** Flexible player names/avatars for any mode */
export type PlayerNames = Partial<Record<Side, string>>;
export type PlayerAvatars = Partial<Record<Side, string>>;

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

export interface RemoteGame {
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
