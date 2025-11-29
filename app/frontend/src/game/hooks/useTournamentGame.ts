import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // ✅ Import useParams
import { GameState, ServerMessage, Side, PlayerNames, PlayerAvatars, Scores } from "../types/types";
import { useAuthStore } from "@/state/authStore";

// This is the correct key state for a single player
type KeysPressed = { up: boolean; down: boolean };

export function useTournamentGame() {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const { gameId } = useParams<{ gameId: string }>();
    console.log("Using gameId from URL:", gameId);

    const { id: userId, username, profile_picture: avatar } = user ?? {};

    const wsRef = useRef<WebSocket | null>(null);
    const gameStateRef = useRef<GameState | null>(null);
    const keysPressed = useRef<KeysPressed>({ up: false, down: false });

    // --- UI State ---
    const [side, setSide] = useState<Side | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<Side | null>(null);
    const [playerNames, setPlayerNames] = useState<PlayerNames | null>(null);
    const [playerAvatars, setPlayerAvatars] = useState<PlayerAvatars | null>(null);
    const [finalScore, setFinalScore] = useState<Scores | null>(null);
    const [score, setScore] = useState<Scores>({ left: 0, right: 0 });
    const [waiting, setWaiting] = useState(true); // "Waiting for opponent..."

    // Refs for checking state inside stale closures (setInterval, onmessage)
    const isGameOverRef = useRef(isGameOver);
    const countdownRef = useRef(countdown);
    useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);
    useEffect(() => { countdownRef.current = countdown; }, [countdown]);

    useEffect(() => {
        if (!userId || !username || !gameId) {
            console.log("Missing user or gameId, WebSocket connection aborted.");
            return;
        }

        const websocket = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/game`);
        wsRef.current = websocket;

        websocket.onopen = () => {
            console.log("WebSocket connected. Joining tournament game...");
            websocket.send(
                JSON.stringify({
                    type: "joinGame",
                    mode: "tournament",
                    username: username,
                    avatar: avatar,
                    gameId: Number(gameId)
                })
            );
        };

        websocket.onmessage = ({ data }) => {
            const msg: ServerMessage = JSON.parse(data);

            switch (msg.type) {
                case "matchFound": // Server confirms, sends opponent data
                    setWaiting(false);
                    setSide(msg.side);
                    setPlayerNames(msg.playerNames);
                    setPlayerAvatars(msg.playerAvatars);
                    setCountdown(3);
                    setIsGameOver(false);
                    setWinner(null);
                    setFinalScore(null);
                    setScore({ left: 0, right: 0 });
                    break;

                case "state":
                    if (!isGameOverRef.current) {
                        gameStateRef.current = msg.state;
                        if (msg.state?.score) {
                            setScore({ ...msg.state.score });
                        }
                    }
                    break;

                case "gameOver":
                    setIsGameOver(true);
                    setWinner(msg.winner);
                    setFinalScore(msg.score);
                    setCountdown(null);
                    break;

                case "leaveGame":
                    // Opponent disconnected
                    console.log("Opponent left. Navigating home.");
                    // The server will handle the win/loss logic.
                    // We just need to leave the page.
                    handleGoHome();
                    break;
            }
        };

        websocket.onclose = () => {
            console.log("WebSocket disconnected.");
            wsRef.current = null;
        };

        return () => {
            websocket.close();
            wsRef.current = null;
        };
        // ✅ 'gameId' is now a dependency
    }, [userId, username, avatar, gameId]);

    // --- Countdown Timer ---
    useEffect(() => {
        if (countdown === null) return;
        if (countdown === 0) {
            wsRef.current?.send(JSON.stringify({ type: "ready" }));
            setCountdown(null);
            return;
        }
        const timer = setTimeout(() => setCountdown((c) => (c ? c - 1 : 0)), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // --- Input Loop ---
    useEffect(() => {
        const interval = setInterval(() => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            if (!side || countdownRef.current !== null || isGameOverRef.current) return;

            // Always send current key state
            wsRef.current.send(JSON.stringify({
                type: "move",
                up: keysPressed.current.up,
                down: keysPressed.current.down
            }));
        }, 16); // ~60fps

        return () => clearInterval(interval);
    }, [side]); // Re-runs when 'side' is set

    // --- Keyboard Listeners ---
    useEffect(() => {
        const handleKey = (e: KeyboardEvent, pressed: boolean) => {
            if (e.key === "ArrowUp" || e.key === "w") {
                e.preventDefault();
                keysPressed.current.up = pressed;
            }
            if (e.key === "ArrowDown" || e.key === "s") {
                e.preventDefault();
                keysPressed.current.down = pressed;
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
    }, []); // Runs once

    // --- UI Handlers ---

    // ✅ This is the only navigation function needed.
    // It sends 'leaveGame' and goes to the tournament bracket.
    const handleGoHome = useCallback(() => {
        wsRef.current?.send(JSON.stringify({ type: "leaveGame" }));
        wsRef.current?.close();
        // ✅ Navigate back to the bracket, not the site home
        navigate(`/game/tournament/${gameId}`);
    }, [navigate, gameId]); // Depends on navigate and gameId

    // --- Return Values ---
    return {
        gameStateRef,
        side,
        countdown,
        isGameOver,
        winner,
        playerNames,
        playerAvatars,
        finalScore,
        score,
        waiting,
        // ❌ 'handlePlayAgain' is removed
        handleGoHome, // This is the main "exit" function
    };
}
