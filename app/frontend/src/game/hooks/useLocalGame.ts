import { useCallback, useEffect, useRef, useState } from "react";
import { GameState, Side, Scores, KeysPressed, PlayerNames } from "../types/types";
import { initState, movePaddles, moveBall, checkGameOver } from "../utils/physics";
import { useCreateGame, useStartGame, useUpdateScore, useFinishGame } from "../../game/api/mutations";
import { useAuthStore } from "@/state/authStore";

export function useLocalGame() {
    const user = useAuthStore((state) => state.user);

    const [playerNames, setPlayerNames] = useState<PlayerNames>({
        left: "",
        right: "",
    });

    // --- State & Refs ---
    // Refs are for high-frequency game logic that shouldn't cause re-renders
    const gameStateRef = useRef<GameState | null>(null); // Holds the physics state (ball, paddles)
    const keysPressed = useRef<KeysPressed>({ w: false, s: false, ArrowUp: false, ArrowDown: false });
    const loopId = useRef<number | null>(null);       // The ID of the requestAnimationFrame loop
    const isGameOverRef = useRef(false);                // Stops the game loop when true
    const hasStartedRef = useRef(false);                // Prevents starting the game twice
    const gameIdRef = useRef<number | null>(null);      // Stores the database game ID

    // State is for low-frequency UI changes that *should* cause re-renders
    const [score, setScore] = useState<Scores>({ left: 0, right: 0 });
    const [countdown, setCountdown] = useState<number | null>(3);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<Side | null>(null);
    const [finalScore, setFinalScore] = useState<Scores | null>(null);

    // --- Database Mutations ---
    const createGameMutation = useCreateGame();
    const startGameMutation = useStartGame();
    const updateScoreMutation = useUpdateScore();
    const finishGameMutation = useFinishGame();

    // --- Core Game Callbacks ---

    /**
     * Resets the game to its initial state.
     * Called on mount and when "Play Again" is clicked.
     */
    const setupGame = useCallback(() => {
        // Stop any existing game loop
        if (loopId.current) {
            cancelAnimationFrame(loopId.current);
            loopId.current = null;
        }

        // Reset all refs and state
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

    /**
     * Persists the final game results to the database.
     */
    const persistFinishedGame = useCallback(async (final: Scores, sideWinner: Side | null) => {
        const id = gameIdRef.current;
        if (id === null) return; // No game ID, cannot save

        try {
            // Assumes Player 1 (left) is local, Player 2 (right) is the logged-in user
            await updateScoreMutation.mutateAsync({ gameId: id, score: final.left, position: 1 });
            await updateScoreMutation.mutateAsync({ gameId: id, score: final.right, position: 2 });

            const winnerId = (sideWinner === "right") ? user?.id ?? null : null;
            await finishGameMutation.mutateAsync({ gameId: id, winnerId });

        } catch (err) {
            console.error("Failed to persist finished local game:", err);
        }
    }, [updateScoreMutation, finishGameMutation, user]);

    /**
     * Callback passed to `moveBall`. Runs *after* a point is scored.
     */
    const handleScore = useCallback((scorer: Side) => {
        const state = gameStateRef.current;
        if (!state || isGameOverRef.current)
            return;

        // Update the React UI state with the new score
        setScore({ ...state.score });

        // Check if this point ended the game
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

    /**
     * Safely starts the game loop.
     */
    const startLoop = useCallback(() => {
        if (!loopId.current) {
            loopId.current = requestAnimationFrame(gameLoop);
        }
    }, [gameLoop]);

    /**
     * Creates the game in the DB, starts it, and begins the game loop.
     * Called once when the countdown finishes.
     */
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
            hasStartedRef.current = false; // Allow retry if it failed
        }
    }, [createGameMutation, startGameMutation, startLoop, user]);


    // 1. Initial setup on mount
    useEffect(() => {
        setupGame();
        // Cleanup on unmount
        return () => {
            if (loopId.current) {
                cancelAnimationFrame(loopId.current);
            }
        };
    }, [setupGame]);

    // 2. Countdown timer
    useEffect(() => {
        if (!playerNames.left || !playerNames.right) return;
        if (isGameOver || countdown === null)
            return; // Stop if game over or countdown finished

        if (countdown === 0) {
            // Time to start!
            void ensureCreatedAndStart();
            setCountdown(null);
            return;
        }

        const timer = setTimeout(() => { setCountdown(prev => (prev ? prev - 1 : 0)); }, 1000);

        return () => clearTimeout(timer); // Cleanup timer
    }, [countdown, isGameOver, ensureCreatedAndStart]);

    // 3. Keyboard Listeners
    useEffect(() => {
        const handleKey = (e: KeyboardEvent, pressed: boolean) => {
            const key = e.key as keyof KeysPressed;
            if (key in keysPressed.current) {
                e.preventDefault(); // Prevent page scrolling with arrow keys
                keysPressed.current[key] = pressed;
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
    }, []);

    return {
        gameStateRef,
        countdown,
        isGameOver,
        winner,
        finalScore,
        score,
        playerNames,
        setPlayerNames,
        handlePlayAgain: setupGame, // Alias setupGame as handlePlayAgain
    };
}
