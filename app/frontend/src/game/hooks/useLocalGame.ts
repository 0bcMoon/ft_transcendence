import { useCallback, useEffect, useRef, useState } from "react";
import { GameState, Side, Scores, KeysPressed, PlayerNames } from "../types/types";
import { initState, movePaddles, moveBall, checkGameOver } from "../utils/physics";
import { useNavigate } from "react-router-dom";

export function useLocalGame() {
    const navigate = useNavigate();

    const [playerNames, setPlayerNames] = useState<PlayerNames>({ left: "", right: "" });
    const gameStateRef = useRef<GameState | null>(null);
    const keysPressed = useRef<KeysPressed>({ w: false, s: false, ArrowUp: false, ArrowDown: false });
    const loopId = useRef<number | null>(null);
    const isGameOverRef = useRef(false);
    const hasStartedRef = useRef(false);

    const [score, setScore] = useState<Scores>({ left: 0, right: 0 });
    const [countdown, setCountdown] = useState<number | null>(3);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<Side | null>(null);
    const [finalScore, setFinalScore] = useState<Scores | null>(null);

    const setupGame = useCallback(() => {
        if (loopId.current) {
            cancelAnimationFrame(loopId.current);
            loopId.current = null;
        }
        gameStateRef.current = initState();
        isGameOverRef.current = false;
        hasStartedRef.current = false;
        setIsGameOver(false);
        setWinner(null);
        setFinalScore(null);
        setCountdown(3);
        setScore({ left: 0, right: 0 });
    }, []);

    const handleScore = useCallback((scorer: Side) => {
        const state = gameStateRef.current;
        if (!state || isGameOverRef.current)
            return;

        setScore({ ...state.score });

        if (checkGameOver(state)) {
            if (loopId.current) {
                cancelAnimationFrame(loopId.current);
                loopId.current = null;
            }
            isGameOverRef.current = true;
            setIsGameOver(true);
            setWinner(scorer);
            setFinalScore({ ...state.score });
        }
    }, []);

    const gameLoop = useCallback(() => {
        if (isGameOverRef.current)
            return;
        const state = gameStateRef.current;
        if (state) {
            movePaddles(state, keysPressed.current);
            moveBall(state, handleScore);
        }
        loopId.current = requestAnimationFrame(gameLoop);
    }, [handleScore]);

    const startLoop = useCallback(() => {
        if (!loopId.current) {
            loopId.current = requestAnimationFrame(gameLoop);
        }
    }, [gameLoop]);

    const ensureCreatedAndStart = useCallback(() => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;
        startLoop();
    }, [startLoop]);

    useEffect(() => {
        setupGame();
        return () => {
            if (loopId.current) cancelAnimationFrame(loopId.current);
        };
    }, [setupGame]);

    useEffect(() => {
        if (!playerNames.left || !playerNames.right) return;
        if (isGameOver || countdown === null)
            return;

        if (countdown === 0) {
            ensureCreatedAndStart();
            setCountdown(null);
            return;
        }

        const timer = setTimeout(() => { setCountdown(prev => (prev ? prev - 1 : 0)); }, 1000);
        return () => clearTimeout(timer);
    }, [countdown, isGameOver, ensureCreatedAndStart, playerNames.left, playerNames.right]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent, pressed: boolean) => {
            const key = e.key as keyof KeysPressed;
            if (key in keysPressed.current) {
                e.preventDefault();
                keysPressed.current[key] = pressed;
            }
            if (pressed && e.key === "Enter" && isGameOverRef.current) {
                e.preventDefault();
                setupGame();
            }
            if (pressed && e.key === "Escape") {
                e.preventDefault();
                navigate("/game");
            }
        };
        const down = (e: KeyboardEvent) => handleKey(e, true);
        const up = (e: KeyboardEvent) => handleKey(e, false);

        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, [setupGame, navigate]);

    return {
        gameStateRef,
        countdown,
        isGameOver,
        winner,
        finalScore,
        score,
        playerNames,
        setPlayerNames,
    };
}
