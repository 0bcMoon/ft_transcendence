import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { GameState, Side, Scores, KeysPressed, PlayerAvatars } from "../types/types";
import { initState, movePaddles, moveBall, resetBall, checkGameOver } from "../utils/physics";

export function useLocalGame() {
    const location = useLocation();
    const { player1, player2 } = location.state;

    const playerNames = { left: player1, right: player2 };
    const playerAvatars: PlayerAvatars | null = null;

    const gameStateRef = useRef<GameState | null>(null);
    const keysPressed = useRef<KeysPressed>({ w: false, s: false, ArrowUp: false, ArrowDown: false });
    const loopId = useRef<number | null>(null);
    const isGameOverRef = useRef(false); // <-- ref to track game over immediately

    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<Side | null>(null);
    const [countdown, setCountdown] = useState<number | null>(3);
    const [finalScore, setFinalScore] = useState<Scores | null>(null);

    const [side] = useState<Side>("left");

    useEffect(() => {
        gameStateRef.current = initState();
        setCountdown(3);
        setIsGameOver(false);
        setWinner(null);
        setFinalScore(null);
        isGameOverRef.current = false;

        return () => {
            if (loopId.current !== null) {
                cancelAnimationFrame(loopId.current);
                loopId.current = null;
            }
        };
    }, []);

    const handleScore = useCallback((scorer: Side) => {
        const state = gameStateRef.current;
        if (!state || isGameOverRef.current) return;

        if (checkGameOver(state, scorer)) {
            if (loopId.current !== null) {
                cancelAnimationFrame(loopId.current);
                loopId.current = null;
            }
            isGameOverRef.current = true; // <-- stop immediately
            setIsGameOver(true);
            setWinner(scorer);
            setFinalScore({ ...state.score }); // freeze final score
        } else {
            resetBall(state, scorer);
        }
    }, []);

    const gameLoop = useCallback(() => {
        const state = gameStateRef.current;
        if (!state || isGameOverRef.current) return;

        movePaddles(state, keysPressed.current);
        moveBall(state, handleScore);

        loopId.current = requestAnimationFrame(gameLoop);
    }, [handleScore]);

    const startGame = useCallback(() => {
        if (!gameStateRef.current || loopId.current !== null) return;
        loopId.current = requestAnimationFrame(gameLoop);
    }, [gameLoop]);

    useEffect(() => {
        if (countdown === null) return;
        if (countdown <= 0) {
            startGame();
            setCountdown(null);
            return;
        }
        const timer = setTimeout(() => setCountdown((prev) => (prev == null ? null : prev - 1)), 1000);
        return () => clearTimeout(timer);
    }, [countdown, startGame]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent, pressed: boolean) => {
            const key = e.key as keyof KeysPressed;
            if (key in keysPressed.current) keysPressed.current[key] = pressed;
        };
        const down = (e: KeyboardEvent) => handleKey(e, true);
        const up = (e: KeyboardEvent) => handleKey(e, false);

        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);

    const handlePlayAgain = useCallback(() => {
        if (loopId.current !== null) {
            cancelAnimationFrame(loopId.current);
            loopId.current = null;
        }
        gameStateRef.current = initState();
        setIsGameOver(false);
        isGameOverRef.current = false; // reset ref
        setWinner(null);
        setFinalScore(null);
        setCountdown(3);
    }, []);

    return {
        gameStateRef,
        countdown,
        isGameOver,
        winner,
        finalScore,
        side,
        playerNames,
        playerAvatars,
        handlePlayAgain,
    };
}

