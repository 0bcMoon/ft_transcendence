import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { GameState, Side, Scores, PlayerNames } from "../types/types";
import { GameSession } from "../types/types";

interface LocationState {
    player1: string;
    player2: string;
}

export function useLocalGame(): GameSession {
    const location = useLocation();
    // Defensive: fallback if location.state is missing
    const state = (location.state ?? {}) as Partial<LocationState>;
    const player1 = state.player1 ?? "Player 1";
    const player2 = state.player2 ?? "Player 2";

    const playerNames: PlayerNames = { left: player1, right: player2 };

    const gameStateRef = useRef<GameState | null>(null);
    const keysPressed = useRef({
        w: false,
        s: false,
        ArrowUp: false,
        ArrowDown: false,
    });
    const loopRef = useRef<number | null>(null);

    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<Side | null>(null);
    const [countdown, setCountdown] = useState<number | null>(3);
    const [finalScore, setFinalScore] = useState<Scores | null>(null);

    const MAX_SCORE = 5;
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;

    const initState = (): GameState => ({
        paddles: {
            left: { x: 30, y: 260, width: 10, height: 80 },
            right: { x: 760, y: 260, width: 10, height: 80 },
        },
        ball: { x: 400, y: 300, radius: 10, speedX: 4, speedY: 4 },
        score: { left: 0, right: 0 },
    });

    useEffect(() => {
        gameStateRef.current = initState();
        setCountdown(3);
        setIsGameOver(false);
        setWinner(null);
        setFinalScore(null);
    }, []);

    useEffect(() => {
        if (countdown === null) return;
        if (countdown === 0) {
            startGame();
            setCountdown(null);
            return;
        }
        const timer = setTimeout(() => setCountdown((prev) => prev! - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent, pressed: boolean) => {
            const key = e.key as keyof typeof keysPressed.current;
            if (key in keysPressed.current) {
                keysPressed.current[key] = pressed;
            }
        };

        const downHandler = (e: KeyboardEvent) => handleKey(e, true);
        const upHandler = (e: KeyboardEvent) => handleKey(e, false);

        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);

        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }, []);

    const startGame = () => {
        if (!gameStateRef.current) return;
        loopRef.current = requestAnimationFrame(gameLoop);
    };

    const gameLoop = () => {
        const state = gameStateRef.current;
        if (!state) return;
        movePaddles(state);
        moveBall(state);
        loopRef.current = requestAnimationFrame(gameLoop);
    };

    const movePaddles = (state: GameState) => {
        const speed = 8;
        const paddles = state.paddles;

        // Defensive: ensure paddles exist
        const left = paddles.left;
        const right = paddles.right;

        if (!left || !right) return;

        if (keysPressed.current.w) left.y -= speed;
        if (keysPressed.current.s) left.y += speed;
        if (keysPressed.current.ArrowUp) right.y -= speed;
        if (keysPressed.current.ArrowDown) right.y += speed;

        left.y = Math.max(0, Math.min(CANVAS_HEIGHT - left.height, left.y));
        right.y = Math.max(0, Math.min(CANVAS_HEIGHT - right.height, right.y));
    };

    const moveBall = (state: GameState) => {
        if (!state.paddles.left || !state.paddles.right) return;

        const ball = state.ball;
        const left = state.paddles.left;
        const right = state.paddles.right;

        ball.x += ball.speedX;
        ball.y += ball.speedY;

        if (ball.y - ball.radius < 0 || ball.y + ball.radius > CANVAS_HEIGHT) {
            ball.speedY *= -1;
        }

        if (
            ball.x - ball.radius < left.x + left.width &&
            ball.y > left.y &&
            ball.y < left.y + left.height &&
            ball.speedX < 0
        ) {
            ball.speedX = Math.abs(ball.speedX);
            ball.x = left.x + left.width + ball.radius;
        }

        if (
            ball.x + ball.radius > right.x &&
            ball.y > right.y &&
            ball.y < right.y + right.height &&
            ball.speedX > 0
        ) {
            ball.speedX = -Math.abs(ball.speedX);
            ball.x = right.x - ball.radius;
        }

        if (ball.x < 0) {
            state.score.right = (state.score.right ?? 0) + 1;
            checkGameOver(state, "right");
        } else if (ball.x > CANVAS_WIDTH) {
            state.score.left = (state.score.left ?? 0) + 1;
            checkGameOver(state, "left");
        }
    };

    const checkGameOver = (state: GameState, scorer: Side) => {
        const scoreValue = state.score[scorer] ?? 0;
        if (scoreValue >= MAX_SCORE) {
            setIsGameOver(true);
            setFinalScore({ ...state.score });
            setWinner(scorer);
            if (loopRef.current) cancelAnimationFrame(loopRef.current);
        } else {
            resetBall(state, scorer);
        }
    };

    const resetBall = (state: GameState, direction: Side) => {
        state.ball.x = 400;
        state.ball.y = 300;
        state.ball.speedX = direction === "left" ? -4 : 4;
        state.ball.speedY = 4;
    };

    const handlePlayAgain = () => {
        gameStateRef.current = initState();
        setIsGameOver(false);
        setWinner(null);
        setFinalScore(null);
        setCountdown(3);
    };

    // For local games, we set unused remote fields to sensible defaults
    return {
        gameStateRef,
        countdown,
        isGameOver,
        winner,
        finalScore,
        handlePlayAgain,
        playerNames,
        waiting: false,
        side: null,
        playerAvatars: null,
        handleGoHome: () => { },
    };
}
