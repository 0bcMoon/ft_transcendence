import { useEffect, useRef, useState } from "react";
import { GameState, ServerMessage, Side, PlayerNames, PlayerAvatars, Scores } from "../types/types";
import { useAuthStore } from "@/state/authStore";
import { useNavigate } from "react-router-dom";

const WS_URL = "ws://localhost:3000/game";

interface UseRemoteGameResult {
    gameStateRef: React.MutableRefObject<GameState | null>;
    side: Side | null;
    countdown: number | null;
    isGameOver: boolean;
    winner: Side | null;
    waiting: boolean;
    playerNames: PlayerNames | null;
    playerAvatars: PlayerAvatars | null;
    finalScore: Scores | null;
    handlePlayAgain: () => void;
    handleGoHome: () => void;
}

export function useRemoteGame(): UseRemoteGameResult {
    const user = useAuthStore((state) => state.user);
    const username = user?.username;
    const avatar = user?.profile_picture;
    const wsRef = useRef<WebSocket | null>(null);
    const gameStateRef = useRef<GameState | null>(null);
    const keysPressed = useRef({ up: false, down: false });
    const navigate = useNavigate();

    const [side, setSide] = useState<Side | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<Side | null>(null);
    const [waiting, setWaiting] = useState(true);
    const [playerNames, setPlayerNames] = useState<PlayerNames | null>(null);
    const [playerAvatars, setPlayerAvatars] = useState<PlayerAvatars | null>(null);
    const [finalScore, setFinalScore] = useState<Scores | null>(null);

    useEffect(() => {
        if (!username) return;
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "joinGame", mode: "1v1", username, avatar }));
        };

        ws.onmessage = ({ data }) => {
            const msg: ServerMessage = JSON.parse(data);

            if (msg.type === "matchFound") {
                setSide(msg.side);
                setPlayerNames(msg.playerNames);
                setPlayerAvatars(msg.playerAvatars);
                setCountdown(3);
                setIsGameOver(false);
                setWinner(null);
                setFinalScore(null);
                setWaiting(false);
                return;
            }
            if (msg.type === "state" && !isGameOver) {
                gameStateRef.current = msg.state;
                return;
            }

            if (msg.type === "gameOver") {
                setIsGameOver(true);
                setWinner(msg.winner);
                setFinalScore(msg.score);
                setCountdown(null);
                setWaiting(false);
                return;
            }

            if (msg.type === "leaveGame") {
                setWaiting(true);
                setSide(null);
                setPlayerNames(null);
                setPlayerAvatars(null);
                setIsGameOver(false);
                setWinner(null);
                setFinalScore(null);
                setCountdown(null);
                gameStateRef.current = null;
            }
        };

        return () => ws.close();
    }, [username, avatar]);

    useEffect(() => {
        if (countdown === null) return;

        if (countdown === 0) {
            wsRef.current?.send(JSON.stringify({ type: "ready" }));
            setCountdown(null);
            return;
        }

        const timer = setTimeout(() => setCountdown((prev) => prev! - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            if (!side || countdown !== null || isGameOver) return;

            const { up, down } = keysPressed.current;
            if (up || down)
                wsRef.current.send(JSON.stringify({ type: "move", up, down }));
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

        const downHandler = (e: KeyboardEvent) => handleKey(true, e.key);
        const upHandler = (e: KeyboardEvent) => handleKey(false, e.key);

        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);
        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }, []);

    const handlePlayAgain = () => {
        wsRef.current?.send(JSON.stringify({ type: "playAgain", mode: "1v1" }));
        keysPressed.current = { up: false, down: false };
        setIsGameOver(false);
        setWaiting(true);
        setSide(null);
        setFinalScore(null);
        setWinner(null);
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
