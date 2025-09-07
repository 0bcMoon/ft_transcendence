import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { GameState, Side } from "../types/types";

export function useLocalGame() {
    const location = useLocation();
    const { player1, player2 } = location.state;

    const playerNames = { left: player1, right: player2 };

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
    const [finalScore, setFinalScore] = useState<{ left: number; right: number } | null>(null);

    const MAX_SCORE = 5;
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;

    const initState = (): GameState => ({
        status: "ended",
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
        gameStateRef.current.status = "playing";
        loopRef.current = requestAnimationFrame(gameLoop);
    };

    const gameLoop = () => {
        const state = gameStateRef.current!;
        movePaddles(state);
        moveBall(state);
        loopRef.current = requestAnimationFrame(gameLoop);
    };

    const movePaddles = (state: GameState) => {
        const speed = 8;
        const { left, right } = state.paddles;

        if (keysPressed.current.w) left.y -= speed;
        if (keysPressed.current.s) left.y += speed;
        if (keysPressed.current.ArrowUp) right.y -= speed;
        if (keysPressed.current.ArrowDown) right.y += speed;

        left.y = Math.max(0, Math.min(CANVAS_HEIGHT - left.height, left.y));
        right.y = Math.max(0, Math.min(CANVAS_HEIGHT - right.height, right.y));
    };

    const moveBall = (state: GameState) => {
        if (state.status !== "playing") return;

        const ball = state.ball;
        const { left, right } = state.paddles;

        ball.x += ball.speedX;
        ball.y += ball.speedY;

        // Bounce off top/bottom
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > CANVAS_HEIGHT) {
            ball.speedY *= -1;
        }

        // Collision with left paddle
        if (
            ball.x - ball.radius < left.x + left.width &&
            ball.y > left.y &&
            ball.y < left.y + left.height
        ) {
            ball.speedX *= -1;
            ball.x = left.x + left.width + ball.radius;
        }

        // Collision with right paddle
        if (
            ball.x + ball.radius > right.x &&
            ball.y > right.y &&
            ball.y < right.y + right.height
        ) {
            ball.speedX *= -1;
            ball.x = right.x - ball.radius;
        }

        // Score logic
        if (ball.x < 0) {
            state.score.right++;
            checkGameOver(state, "right");
        } else if (ball.x > CANVAS_WIDTH) {
            state.score.left++;
            checkGameOver(state, "left");
        }
    };

    const checkGameOver = (state: GameState, scorer: Side) => {
        if (state.score[scorer] >= MAX_SCORE) {
            state.status = "ended";
            setIsGameOver(true);
            setFinalScore(state.score);
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
        setCountdown(3);
    };

    return {
        gameStateRef,
        countdown,
        isGameOver,
        winner,
        finalScore,
        handlePlayAgain,
        playerNames,
    };
}

