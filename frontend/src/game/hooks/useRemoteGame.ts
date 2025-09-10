import { useEffect, useRef, useState } from "react";
import { GameState, ServerMessage } from "../types/types";
import { useAuthStore } from "@/state/authStore";
import { useNavigate } from "react-router-dom";

const WS_URL = "ws://localhost:3000/game";

export function useRemoteGame() {
    const username = useAuthStore((state) => state.user?.username);
    const wsRef = useRef<WebSocket | null>(null);
    const gameStateRef = useRef<GameState | null>(null);
    const keysPressed = useRef({ up: false, down: false });

    const [side, setSide] = useState<"left" | "right" | null>(null);
    const [matchId, setMatchId] = useState<string | null>(null);

    const [countdown, setCountdown] = useState<number | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<"left" | "right" | null>(null);
    const [waiting, setWaiting] = useState(true);
    const [playerNames, setPlayerNames] = useState<{ left: string; right: string } | null>(null);
    const [finalScore, setFinalScore] = useState<{ left: number; right: number } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            if (username)
                ws.send(JSON.stringify({ type: "1v1", username }));
        };

        ws.onmessage = ({ data }) => {
            const msg: ServerMessage = JSON.parse(data);

            switch (msg.type) {
                case "matchFound":
                    setMatchId(msg.id);
                    setSide(msg.side);
                    setPlayerNames({ left: msg.leftUsername, right: msg.rightUsername });
                    setCountdown(3);
                    setIsGameOver(false);
                    setWinner(null);
                    setFinalScore(null);
                    setWaiting(false);
                    break;

                case "state":
                    if (!isGameOver)
                        gameStateRef.current = msg.state;
                    break;

                case "gameOver":
                    setIsGameOver(true);
                    setWinner(msg.winner);
                    setFinalScore(msg.score);
                    setCountdown(null);
                    setWaiting(false);
                    break;

                case "leaveGame":
                    setWaiting(true);
                    setSide(null);
                    setPlayerNames(null);
                    setIsGameOver(false);
                    setWinner(null);
                    setFinalScore(null);
                    setCountdown(null);
                    gameStateRef.current = null;
                    break;
            }
        };

        return () => ws.close();
    }, [username]);

    useEffect(() => {
        if (countdown === null)
            return;

        if (countdown === 0) {
            wsRef.current?.send(JSON.stringify({ type: "play" }));
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
        wsRef.current?.send(JSON.stringify({ type: "playAgain" }));
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
        finalScore,
        handlePlayAgain,
        handleGoHome,
        matchId,
    };
}

