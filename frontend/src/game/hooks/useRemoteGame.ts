import { useEffect, useRef, useState } from "react";
import { GameState, ServerMessage, Side, PlayerNames, PlayerAvatars, Scores } from "../types/types";
import { useAuthStore } from "@/state/authStore";
import { useNavigate } from "react-router-dom";

const WS_URL = "ws://localhost:3000/game";

export function useRemoteGame() {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const wsRef = useRef<WebSocket | null>(null);
    const gameStateRef = useRef<GameState | null>(null);
    const keysPressed = useRef({ up: false, down: false });

    const [side, setSide] = useState<Side | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<Side | null>(null);
    const [playerNames, setPlayerNames] = useState<PlayerNames | null>(null);
    const [playerAvatars, setPlayerAvatars] = useState<PlayerAvatars | null>(null);
    const [finalScore, setFinalScore] = useState<Scores | null>(null);

    useEffect(() => {
        if (!user?.username) return;

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: "joinGame",
                mode: "1v1",
                username: user.username,
                avatar: user.profile_picture,
            }));
        };

        ws.onmessage = ({ data }) => handleServerMessage(JSON.parse(data));

        return () => ws.close();
    }, [user]);

    const handleServerMessage = (msg: ServerMessage) => {
        switch (msg.type) {
            case "matchFound":
                setSide(msg.side);
                setPlayerNames(msg.playerNames);
                setPlayerAvatars(msg.playerAvatars);
                setCountdown(3);
                setIsGameOver(false);
                setWinner(null);
                setFinalScore(null);
                break;

            case "state":
                if (!isGameOver) gameStateRef.current = msg.state;
                break;

            case "gameOver":
                setIsGameOver(true);
                setWinner(msg.winner);
                setFinalScore(msg.score);
                setCountdown(null);
                break;

            case "leaveGame":
                resetGameState();
                break;
        }
    };

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

    useEffect(() => {
        const interval = setInterval(() => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
                return;
            if (!side || countdown !== null || isGameOver)
                return;

            const { up, down } = keysPressed.current;
            if (up || down) {
                wsRef.current.send(JSON.stringify({ type: "move", up, down }));
            }
        }, 16);

        return () => clearInterval(interval);
    }, [side, countdown, isGameOver]);

    useEffect(() => {
        const handleKey = (pressed: boolean, key: string) => {
            if (key === "ArrowUp" || key === "w")
                keysPressed.current.up = pressed;
            if (key === "ArrowDown" || key === "s")
                keysPressed.current.down = pressed;
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

    const resetGameState = () => {
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
        wsRef.current?.send(JSON.stringify({ type: "playAgain", mode: "1v1" }));
        keysPressed.current = { up: false, down: false };
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
        playerNames,
        playerAvatars,
        finalScore,
        handlePlayAgain,
        handleGoHome,
    };
}
