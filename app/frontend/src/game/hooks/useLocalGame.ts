import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { GameState, Side, Scores, KeysPressed, PlayerAvatars } from "../types/types";
import { initState, movePaddles, moveBall, resetBall, checkGameOver } from "../utils/physics";
import { useCreateGame, useStartGame, useUpdateScore, useFinishGame } from "../../api/gameMutations";
import { useAuthStore } from "@/state/authStore";

export function useLocalGame() {
    const location = useLocation();
    // Always set player2 as the real player, and player1 as the computer
    const { player1, player2 } = (location.state ?? { player1: "Computer", player2: "You" }) as {
        player1: string;
        player2: string;
    };

    const user = useAuthStore((state) => state.user);

    const playerNames = { left: player1, right: player2 };
    const playerAvatars: PlayerAvatars | null = null;

    // Simulation refs
    const gameStateRef = useRef<GameState | null>(null);
    const keysPressed = useRef<KeysPressed>({ w: false, s: false, ArrowUp: false, ArrowDown: false });
    const loopId = useRef<number | null>(null);
    const isGameOverRef = useRef(false);
    const hasStartedRef = useRef(false);
    const gameIdRef = useRef<number | null>(null);

    // UI state
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<Side | null>(null);
    const [countdown, setCountdown] = useState<number | null>(3);
    const [finalScore, setFinalScore] = useState<Scores | null>(null);
    const [score, setScore] = useState<Scores>({ left: 0, right: 0 });
    const [gameId, setGameId] = useState<number | null>(null);
    const [side] = useState<Side>("right");

    // DB mutations
    const createGameMutation = useCreateGame();
    const startGameMutation = useStartGame();
    const updateScoreMutation = useUpdateScore();
    const finishGameMutation = useFinishGame();

    // Only update score if changed
    const prevScoreRef = useRef<Scores>({ left: 0, right: 0 });
    useEffect(() => {
        let rafId = 0;
        const sync = () => {
            const s = gameStateRef.current?.score;
            if (s) {
                const prev = prevScoreRef.current;
                if (s.left !== prev.left || s.right !== prev.right) {
                    prevScoreRef.current = { left: s.left, right: s.right };
                    setScore({ left: s.left, right: s.right });
                }
            }
            rafId = requestAnimationFrame(sync);
        };
        rafId = requestAnimationFrame(sync);
        return () => cancelAnimationFrame(rafId);
    }, []);

    // Simulation mount/reset
    useEffect(() => {
        gameStateRef.current = initState();
        setCountdown(3);
        setIsGameOver(false);
        setWinner(null);
        setFinalScore(null);
        isGameOverRef.current = false;
        hasStartedRef.current = false;
        setGameId(null);
        gameIdRef.current = null;

        return () => {
            if (loopId.current !== null) {
                cancelAnimationFrame(loopId.current);
                loopId.current = null;
            }
        };
    }, []);

    // Persist finished game -- always uses gameIdRef.current
    const persistFinishedGame = useCallback(
        async (final: Scores, sideWinner: Side | null) => {
            const id = gameIdRef.current;
            if (id == null) {
                console.error("No gameId to persist game results!");
                return;
            }
            try {
                // Computer is position 1, YOU are position 2
                await updateScoreMutation.mutateAsync({ gameId: id, score: final.left ?? 0, position: 1 });
                await updateScoreMutation.mutateAsync({ gameId: id, score: final.right ?? 0, position: 2 });

                // Winner: right = user, left = computer
                let winnerId: number | null = null;
                if (sideWinner === "right") {
                    winnerId = user?.id ?? null;
                } else if (sideWinner === "left") {
                    winnerId = null; // Computer
                }
                await finishGameMutation.mutateAsync({ gameId: id, winnerId });
            } catch (err) {
                console.error("Failed to persist finished local game:", err);
            }
        },
        [updateScoreMutation, finishGameMutation, user]
    );

    // Scoring/game over
    const handleScore = useCallback(
        (scorer: Side) => {
            const state = gameStateRef.current;
            if (!state || isGameOverRef.current) return;

            if (checkGameOver(state, scorer)) {
                if (loopId.current !== null) {
                    cancelAnimationFrame(loopId.current);
                    loopId.current = null;
                }
                isGameOverRef.current = true;
                setIsGameOver(true);
                setWinner(scorer);
                setFinalScore({ ...state.score });
                void persistFinishedGame(state.score, scorer);
            } else {
                resetBall(state, scorer);
            }
        },
        [persistFinishedGame]
    );

    // Game loop
    const gameLoop = useCallback(() => {
        const state = gameStateRef.current;
        if (!state || isGameOverRef.current) return;
        movePaddles(state, keysPressed.current);
        moveBall(state, handleScore);
        loopId.current = requestAnimationFrame(gameLoop);
    }, [handleScore]);

    const startLoop = useCallback(() => {
        if (!gameStateRef.current || loopId.current !== null) return;
        loopId.current = requestAnimationFrame(gameLoop);
    }, [gameLoop]);

    // Create and start game, only ONCE, at countdown 0
    const ensureCreatedAndStart = useCallback(async () => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;
        try {
            let id = gameIdRef.current;
            if (id == null) {
                const res = await createGameMutation.mutateAsync({
                    mode: "local",
                    players: [
                        { user_id: null, position: 1 },             // Computer is always position 1
                        { user_id: user?.id ?? null, position: 2 }, // YOU are always position 2
                    ],
                });
                id = res?.game?.id ?? null;
                if (id == null) {
                    console.error("Failed to create game! No id returned.");
                    return;
                }
                gameIdRef.current = id;
                setGameId(id); // for UI
            }
            await startGameMutation.mutateAsync(id);
            startLoop();
        } catch (e) {
            console.error("Failed to create/start local game:", e);
            hasStartedRef.current = false;
        }
    }, [createGameMutation, startGameMutation, startLoop, user]);

    // Stable ref for starter
    const ensureCreatedAndStartRef = useRef(ensureCreatedAndStart);
    useEffect(() => {
        ensureCreatedAndStartRef.current = ensureCreatedAndStart;
    }, [ensureCreatedAndStart]);

    // Countdown: only call starter at countdown === 0
    useEffect(() => {
        if (isGameOver || countdown === null) return;
        if (countdown === 0) {
            ensureCreatedAndStartRef.current?.();
            setCountdown(null);
            return;
        }
        const timer = setTimeout(() => {
            setCountdown(prev => (prev === null ? null : prev - 1));
        }, 1000);
        return () => clearTimeout(timer);
    }, [countdown, isGameOver]);

    // Keyboard
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

    // Reset
    const handlePlayAgain = useCallback(() => {
        if (loopId.current !== null) {
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
        setGameId(null);
        gameIdRef.current = null;
        prevScoreRef.current = { left: 0, right: 0 };
        setScore({ left: 0, right: 0 });
    }, []);

    return {
        gameStateRef,
        countdown,
        isGameOver,
        winner,
        finalScore,
        score,
        side,
        playerNames,
        playerAvatars,
        gameId,
        handlePlayAgain,
    };
}
