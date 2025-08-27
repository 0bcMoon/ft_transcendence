import { useEffect, useRef, useState } from "react";
import { GameState, Side } from "../types/types";

export function useLocalGame() {
    const gameStateRef = useRef<GameState | null>(null);
    const keysPressed = useRef({ w: false, s: false, ArrowUp: false, ArrowDown: false });
    const loopRef = useRef<number | null>(null);

    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<Side | null>(null);
    const [countdown, setCountdown] = useState<number | null>(3);

    const MAX_SCORE = 5;

    const initState = (): GameState => ({
        status: "waiting",
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

    // Countdown effect
    useEffect(() => {
        if (countdown === null) return;

        if (countdown === 0) {
            startGame();
            setCountdown(null);
            return;
        }

        const timer = setTimeout(() => setCountdown(prev => prev! - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // Keyboard input
    useEffect(() => {
        const handleKey = (e: KeyboardEvent, pressed: boolean) => {
            if (e.key in keysPressed.current) {
                keysPressed.current[e.key as keyof typeof keysPressed.current] = pressed;
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
        const canvasHeight = 600;
        if (keysPressed.current.w) state.paddles.left.y -= speed;
        if (keysPressed.current.s) state.paddles.left.y += speed;
        if (keysPressed.current.ArrowUp) state.paddles.right.y -= speed;
        if (keysPressed.current.ArrowDown) state.paddles.right.y += speed;

        state.paddles.left.y = Math.max(0, Math.min(canvasHeight - state.paddles.left.height, state.paddles.left.y));
        state.paddles.right.y = Math.max(0, Math.min(canvasHeight - state.paddles.right.height, state.paddles.right.y));
    };

    const moveBall = (state: GameState) => {
        if (state.status !== "playing") return; // ️ Prevent ball movement before countdown ends

        state.ball.x += state.ball.speedX;
        state.ball.y += state.ball.speedY;

        if (state.ball.y - state.ball.radius < 0 || state.ball.y + state.ball.radius > 600) {
            state.ball.speedY *= -1;
        }

        const { left, right } = state.paddles;
        const ball = state.ball;

        if (
            ball.x - ball.radius < left.x + left.width &&
            ball.y > left.y &&
            ball.y < left.y + left.height
        ) {
            ball.speedX *= -1;
            ball.x = left.x + left.width + ball.radius;
        }

        if (
            ball.x + ball.radius > right.x &&
            ball.y > right.y &&
            ball.y < right.y + right.height
        ) {
            ball.speedX *= -1;
            ball.x = right.x - ball.radius;
        }

        if (ball.x < 0) {
            state.score.right++;
            checkGameOver(state, "right");
        } else if (ball.x > 800) {
            state.score.left++;
            checkGameOver(state, "left");
        }
    };

    const checkGameOver = (state: GameState, scorer: Side) => {
        if (state.score[scorer] >= MAX_SCORE) {
            state.status = "ended";
            setIsGameOver(true);
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
        setCountdown(3); // ️ Only set countdown, don't start game yet
    };

    return {
        gameStateRef,
        countdown,
        isGameOver,
        winner,
        handlePlayAgain,
    };
}

