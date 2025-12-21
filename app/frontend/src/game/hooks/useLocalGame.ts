import { useCallback, useEffect, useRef, useState } from "react";
import { GameState, Side, Scores, KeysPressed, PlayerNames } from "../types/types";
import { initState, movePaddles, moveBall, checkGameOver } from "../utils/physics";
import { useCreateGame, useStartGame, useUpdateScore, useFinishGame } from "../../game/api/mutations";
import { useAuthStore } from "@/state/authStore";
import { useNavigate } from "react-router-dom";

export function useLocalGame() {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const [playerNames, setPlayerNames] = useState<PlayerNames>({
        left: "",
        right: "",
    });

    const gameStateRef = useRef<GameState | null>(null); // Holds the physics state (ball, paddles)
    const keysPressed = useRef<KeysPressed>({ w: false, s: false, ArrowUp: false, ArrowDown: false });
    const loopId = useRef<number | null>(null);       // The ID of the requestAnimationFrame loop
    const isGameOverRef = useRef(false);                // Stops the game loop when true
    const hasStartedRef = useRef(false);                // Prevents starting the game twice
    const gameIdRef = useRef<number | null>(null);      // Stores the database game ID

    const [score, setScore] = useState<Scores>({ left: 0, right: 0 });
    const [countdown, setCountdown] = useState<number | null>(3);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<Side | null>(null);
    const [finalScore, setFinalScore] = useState<Scores | null>(null);

    const createGameMutation = useCreateGame();
    const startGameMutation = useStartGame();
    const updateScoreMutation = useUpdateScore();
    const finishGameMutation = useFinishGame();


    const setupGame = useCallback(() => {
        if (loopId.current) {
            cancelAnimationFrame(loopId.current);
            loopId.current = null;
        }

        gameStateRef.current = initState(); // Get new physics state
        isGameOverRef.current = false;
        hasStartedRef.current = false;
        gameIdRef.current = null;

        setIsGameOver(false);
        setWinner(null);
        setFinalScore(null);
        setCountdown(3);
        setScore({ left: 0, right: 0 });
    }, []);


    const persistFinishedGame = useCallback(async (score: Scores, sideWinner: Side | null) => {
        const id = gameIdRef.current;
        if (id === null)
            return;

        try {
            await updateScoreMutation.mutateAsync({ gameId: id, score: score.left, position: 1 });
            await updateScoreMutation.mutateAsync({ gameId: id, score: score.right, position: 2 });

            const winnerId = (sideWinner === "right") ? user?.id ?? null : null;
            await finishGameMutation.mutateAsync({ gameId: id, winnerId });

        } catch (err) {
            console.error("Failed to persist finished local game:", err);
        }
    }, [updateScoreMutation, finishGameMutation, user]);

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
            void persistFinishedGame(state.score, scorer);
        }
    }, [persistFinishedGame]);

    const gameLoop = useCallback(() => {
        if (isGameOverRef.current)
            return; // Stop loop if game is over

        const state = gameStateRef.current;
        if (state) {
            movePaddles(state, keysPressed.current);
            moveBall(state, handleScore); // This will trigger score checks
        }
        loopId.current = requestAnimationFrame(gameLoop);
    }, [handleScore]);

    const startLoop = useCallback(() => {
        if (!loopId.current) {
            loopId.current = requestAnimationFrame(gameLoop);
        }
    }, [gameLoop]);

    const ensureCreatedAndStart = useCallback(async () => {
        if (hasStartedRef.current) return; // Only run once
        hasStartedRef.current = true;

        try {
            // 1. Create game entry in DB
            const res = await createGameMutation.mutateAsync({
                mode: "local",
                players: [
                    { user_id: null, position: 1 },
                    { user_id: user?.id ?? null, position: 2 },
                ],
            });

            const id = res?.game?.id;
            if (!id)
                throw new Error("Failed to create game, no ID returned.");
            gameIdRef.current = id;

            await startGameMutation.mutateAsync(id);

            startLoop();
        } catch (e) {
            console.error("Failed to create/start local game:", e);
            hasStartedRef.current = false;
        }
    }, [createGameMutation, startGameMutation, startLoop, user]);


    useEffect(() => {
        setupGame();
        return () => {
            if (loopId.current) {
                cancelAnimationFrame(loopId.current);
            }
        };
    }, [setupGame]);

    useEffect(() => {
        if (!playerNames.left || !playerNames.right) return;
        if (isGameOver || countdown === null)
            return;

        if (countdown === 0) {
            void ensureCreatedAndStart();
            setCountdown(null);
            return;
        }

        const timer = setTimeout(() => { setCountdown(prev => (prev ? prev - 1 : 0)); }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, isGameOver, ensureCreatedAndStart]);

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
    }, [setupGame]);


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
