import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GameState, ServerMessage, Side, PlayerNames, PlayerAvatars, Scores } from "../types/types";
import { useAuthStore } from "@/state/authStore";

type KeysPressed = { up: boolean; down: boolean };

export function useTournamentGame() {
    const { gameId } = useParams<{ gameId: string }>();
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const wsRef = useRef<WebSocket | null>(null);
    const gameStateRef = useRef<GameState | null>(null);
    const keysPressed = useRef<KeysPressed>({ up: false, down: false });

    const [side, setSide] = useState<Side | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<Side | null>(null);
    const [playerNames, setPlayerNames] = useState<PlayerNames | null>(null);
    const [playerAvatars, setPlayerAvatars] = useState<PlayerAvatars | null>(null);
    const [finalScore, setFinalScore] = useState<Scores | null>(null);
    const [score, setScore] = useState<Scores>({ left: 0, right: 0 });
    const [error, setError] = useState<string | null>(null);

    const isGameOverRef = useRef(isGameOver);
    const countdownRef = useRef(countdown);

    useEffect(() => {
        isGameOverRef.current = isGameOver;
    }, [isGameOver]);

    useEffect(() => {
        countdownRef.current = countdown;
    }, [countdown]);

    useEffect(() => {
        if (!user?.username || !gameId) {
            setError("Missing user or game ID");
            return;
        }

        const websocket = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/game`);
        wsRef.current = websocket;

        websocket.onopen = () => {
            // Join specific tournament game
            websocket.send(
                JSON.stringify({
                    type: "joinGame",
                    mode: "tournament",
                    gameId: Number(gameId),
                    username: user.username,
                    id: user.id,
                    avatar: user.profile_picture,
                })
            );
        };

        websocket.onmessage = ({ data }) => {
            const msg: ServerMessage = JSON.parse(data);

            switch (msg.type) {
                case "matchFound": {
                    setSide(msg.side);
                    setPlayerNames(msg.playerNames);
                    setPlayerAvatars(msg.playerAvatars);
                    setCountdown(3);
                    setIsGameOver(false);
                    setWinner(null);
                    setFinalScore(null);
                    setScore({ left: 0, right: 0 });
                    setError(null);
                    break;
                }

                case "state": {
                    if (!isGameOverRef.current) {
                        gameStateRef.current = msg.state;
                        if (msg.state?.score) {
                            setScore({ ...msg.state.score });
                        }
                    }
                    break;
                }

                case "gameOver": {
                    setIsGameOver(true);
                    setWinner(msg.winner);
                    setFinalScore(msg.score);
                    setCountdown(null);
                    break;
                }

                case "leaveGame": {
                    resetGameState();
                    break;
                }
            }
        };

        websocket.onerror = () => {
            setError("WebSocket connection error");
        };

        websocket.onclose = () => {
            console.log("WebSocket closed");
        };

        return () => {
            if (websocket.readyState === WebSocket.OPEN) {
                websocket.send(JSON.stringify({ type: "leaveGame" }));
            }
            websocket.close();
            wsRef.current = null;
        };
    }, [user, gameId]);

    // Countdown timer
    useEffect(() => {
        if (countdown === null) return;
        if (countdown === 0) {
            wsRef.current?.send(JSON.stringify({ type: "ready" }));
            setCountdown(null);
            return;
        }
        const timer = setTimeout(() => setCountdown((c) => (c ?? 0) - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // Send movement updates
    useEffect(() => {
        const interval = setInterval(() => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            if (!side || countdownRef.current !== null || isGameOverRef.current) return;

            const { up, down } = keysPressed.current;
            if (up || down) {
                wsRef.current.send(JSON.stringify({ type: "move", up, down }));
            }
        }, 16);

        return () => clearInterval(interval);
    }, [side]);

    // Keyboard controls
    useEffect(() => {
        const handleKey = (pressed: boolean, key: string) => {
            if (key === "ArrowUp" || key === "w" || key === "W") {
                keysPressed.current.up = pressed;
            }
            if (key === "ArrowDown" || key === "s" || key === "S") {
                keysPressed.current.down = pressed;
            }
        };

        const down = (e: KeyboardEvent) => {
            handleKey(true, e.key);
            // Prevent page scrolling
            if (["ArrowUp", "ArrowDown"].includes(e.key)) {
                e.preventDefault();
            }
        };

        const up = (e: KeyboardEvent) => {
            handleKey(false, e.key);
        };

        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);

        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);

    const resetGameState = () => {
        setSide(null);
        setPlayerNames(null);
        setPlayerAvatars(null);
        setIsGameOver(false);
        setWinner(null);
        setFinalScore(null);
        setCountdown(null);
        setScore({ left: 0, right: 0 });
        gameStateRef.current = null;
    };

    const handleBackToBracket = () => {
        wsRef.current?.send(JSON.stringify({ type: "leaveGame" }));
        wsRef.current?.close();

        // Navigate back to tournament bracket
        // Extract tournament ID from gameId or use a better method
        navigate(`/game/tournament/${gameId}`); // You might need to adjust this
    };

    const handleGoHome = () => {
        wsRef.current?.send(JSON.stringify({ type: "leaveGame" }));
        wsRef.current?.close();
        navigate("/");
    };

    return {
        gameStateRef,
        gameId,
        side,
        countdown,
        isGameOver,
        winner,
        playerNames,
        playerAvatars,
        finalScore,
        score,
        error,
        handleBackToBracket,
        handleGoHome,
    };
}
