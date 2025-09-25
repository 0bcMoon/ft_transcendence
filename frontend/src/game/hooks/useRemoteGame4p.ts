import { useEffect, useRef, useState } from "react";
import {
    GameState,
    ServerMessage,
    Side,
    PlayerNames,
    PlayerAvatars,
    Scores,
} from "../types/types";
import { useAuthStore } from "@/state/authStore";
import { useNavigate } from "react-router-dom";

const WS_URL = "ws://localhost:3000/game";

type Keys4 = {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
};

export function useRemoteGame4p() {
    const user = useAuthStore((state) => state.user);
    const username = user?.username;
    const avatar = user?.profile_picture;

    const navigate = useNavigate();

    const wsRef = useRef<WebSocket | null>(null);
    const gameStateRef = useRef<GameState | null>(null);
    const keysPressed = useRef<Keys4>({
        up: false,
        down: false,
        left: false,
        right: false,
    });

    // UI/game flags
    const [side, setSide] = useState<Side | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<Side | null>(null);
    const [waiting, setWaiting] = useState(true);

    // Players and score
    const [playerNames, setPlayerNames] = useState<PlayerNames | null>(null);
    const [playerAvatars, setPlayerAvatars] = useState<PlayerAvatars | null>(null);
    const [finalScore, setFinalScore] = useState<Scores | null>(null);

    // Refs to avoid stale-closure issues inside ws.onmessage / intervals
    const isGameOverRef = useRef(isGameOver);
    const countdownRef = useRef(countdown);
    useEffect(() => {
        isGameOverRef.current = isGameOver;
    }, [isGameOver]);
    useEffect(() => {
        countdownRef.current = countdown;
    }, [countdown]);

    // Open socket and wire server messages
    useEffect(() => {
        if (!username) return;

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    type: "joinGame",
                    mode: "4p",
                    username,
                    avatar,
                })
            );
        };

        ws.onmessage = ({ data }) => {
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
                    setWaiting(false);
                    break;
                }
                case "state": {
                    if (!isGameOverRef.current) gameStateRef.current = msg.state;
                    break;
                }
                case "gameOver": {
                    setIsGameOver(true);
                    setWinner(msg.winner);
                    setFinalScore(msg.score);
                    setCountdown(null);
                    setWaiting(false);
                    break;
                }
                case "leaveGame": {
                    resetGameState();
                    break;
                }
            }
        };

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [username, avatar]);

    // Countdown -> send ready
    useEffect(() => {
        if (countdown === null) return;
        if (countdown === 0) {
            wsRef.current?.send(JSON.stringify({ type: "ready" }));
            setCountdown(null);
            return;
        }
        const timer = setTimeout(
            () => setCountdown((prev) => (prev == null ? null : prev - 1)),
            1000
        );
        return () => clearTimeout(timer);
    }, [countdown]);

    // Send movement at ~60 FPS when playing
    useEffect(() => {
        const interval = setInterval(() => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            if (!side || countdownRef.current !== null || isGameOverRef.current) return;

            const { up, down, left, right } = keysPressed.current;
            if (up || down || left || right) {
                wsRef.current.send(JSON.stringify({ type: "move", up, down, left, right }));
            }
        }, 16);

        return () => clearInterval(interval);
    }, [side]);

    // Keyboard handlers: Arrow keys and WASD
    useEffect(() => {
        const handleKey = (pressed: boolean, key: string) => {
            if (key === "ArrowUp" || key === "w") keysPressed.current.up = pressed;
            if (key === "ArrowDown" || key === "s") keysPressed.current.down = pressed;
            if (key === "ArrowLeft" || key === "a") keysPressed.current.left = pressed;
            if (key === "ArrowRight" || key === "d") keysPressed.current.right = pressed;
        };

        const down = (e: KeyboardEvent) => handleKey(true, e.key);
        const up = (e: KeyboardEvent) => handleKey(false, e.key);

        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);

    // Helpers
    const resetGameState = () => {
        setWaiting(true);
        setSide(null);
        setPlayerNames(null);
        setPlayerAvatars(null);
        setIsGameOver(false);
        setWinner(null);
        setFinalScore(null);
        setCountdown(null);
        gameStateRef.current = null;
    };

    const handlePlayAgain = () => {
        wsRef.current?.send(JSON.stringify({ type: "playAgain", mode: "4p" }));
        keysPressed.current = { up: false, down: false, left: false, right: false };
        resetGameState();
    };

    const handleGoHome = () => {
        wsRef.current?.send(JSON.stringify({ type: "leaveGame" }));
        wsRef.current?.close();
        navigate("/");
    };

    return {
        gameStateRef,
        side,
        countdown,
        isGameOver,
        winner,
        waiting,
        playerNames,
        playerAvatars,
        finalScore,
        handlePlayAgain,
        handleGoHome,
    };
}
