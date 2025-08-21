import { useEffect, useRef } from "react";
import { GameState } from "./game.protocol";

/**
 * Handles smooth, optimistic paddle movement.
 * Paddle moves immediately and smoothly while key is held.
 */
export const usePaddleMovement = (
    status: "playing" | string,
    playerNumber: 1 | 2,
    gameState: GameState | null,
    ws: WebSocket | null,
) => {
    const moveUpRef = useRef(false);
    const moveDownRef = useRef(false);
    const localPaddleYRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number>();
    const lastSentYRef = useRef<number | null>(null);
    const lastSentTimeRef = useRef<number>(0);

    useEffect(() => {
        moveUpRef.current = false;
        moveDownRef.current = false;
        localPaddleYRef.current = null;
        lastSentYRef.current = null;
        lastSentTimeRef.current = 0;
    }, [status, playerNumber]);

    useEffect(() => {
        if (!gameState) return;
        const paddleKey = playerNumber === 1 ? "paddle1Y" : "paddle2Y";
        localPaddleYRef.current = gameState[paddleKey];
    }, [gameState, playerNumber]);

    useEffect(() => {
        if (status !== "playing" || !gameState) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if (playerNumber === 1) {
                if (k === "w") moveUpRef.current = true;
                if (k === "s") moveDownRef.current = true;
            } else if (playerNumber === 2) {
                if (e.key === "ArrowUp") moveUpRef.current = true;
                if (e.key === "ArrowDown") moveDownRef.current = true;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if (playerNumber === 1) {
                if (k === "w") moveUpRef.current = false;
                if (k === "s") moveDownRef.current = false;
            } else if (playerNumber === 2) {
                if (e.key === "ArrowUp") moveUpRef.current = false;
                if (e.key === "ArrowDown") moveDownRef.current = false;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        const PADDLE_SPEED = 10; // Try 10, tweak for responsiveness
        const PADDLE_HEIGHT = gameState.paddleHeight ?? 80;
        const COURT_HEIGHT = 600;
        const SEND_THROTTLE_MS = 16; // ~60fps

        const clampPaddleY = (y: number) =>
            Math.max(0, Math.min(COURT_HEIGHT - PADDLE_HEIGHT, y));

        const animate = () => {
            if (!gameState) {
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }
            const paddleKey = playerNumber === 1 ? "paddle1Y" : "paddle2Y";
            let nextY = localPaddleYRef.current ?? gameState[paddleKey];
            if (moveUpRef.current) nextY -= PADDLE_SPEED;
            if (moveDownRef.current) nextY += PADDLE_SPEED;
            nextY = clampPaddleY(nextY);

            localPaddleYRef.current = nextY;

            // Throttle send to ~60fps
            const now = performance.now();
            if (
                now - lastSentTimeRef.current >= SEND_THROTTLE_MS &&
                (lastSentYRef.current === null ||
                    Math.abs(nextY - lastSentYRef.current) > 0.5)
            ) {
                ws?.send(JSON.stringify({ type: "paddle_move", data: { y: nextY } }));
                lastSentYRef.current = nextY;
                lastSentTimeRef.current = now;
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            if (animationFrameRef.current)
                cancelAnimationFrame(animationFrameRef.current);
            moveUpRef.current = false;
            moveDownRef.current = false;
            localPaddleYRef.current = null;
            lastSentYRef.current = null;
            lastSentTimeRef.current = 0;
        };
    }, [gameState, playerNumber, status, ws]);

    // Return current paddle Y for rendering locally
    return localPaddleYRef;
};
