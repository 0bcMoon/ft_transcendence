import { useEffect, useRef, useState } from "react";
import { GameState, ServerMessage } from "../types/types";
import { useAuthStore } from "@/state/authStore";

const WS_URL = "ws://localhost:3000/game";

export function useRemoteGame() {
    const username = useAuthStore((state) => state.user?.username);
    const wsRef = useRef<WebSocket | null>(null);
    const gameStateRef = useRef<GameState | null>(null);
    const keysPressed = useRef({ up: false, down: false });

    const [side, setSide] = useState<"left" | "right" | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<"left" | "right" | null>(null);
    const [waiting, setWaiting] = useState(true);
    const [playerNames, setPlayerNames] = useState<{ left: string; right: string } | null>(null);
    const [finalScore, setFinalScore] = useState<{ left: number; right: number } | null>(null);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            if (username) {
                ws.send(JSON.stringify({ type: "identify", username }));
            }
        };

        ws.onmessage = ({ data }) => {
            const msg: ServerMessage = JSON.parse(data);

            switch (msg.type) {
                case "matchFound":
                    setSide(msg.side);
                    setPlayerNames({ left: msg.leftUsername, right: msg.rightUsername });
                    setCountdown(3);
                    setIsGameOver(false);
                    setWinner(null);
                    setFinalScore(null);
                    setWaiting(false);
                    break;
                case "state":
                    if (!isGameOver) gameStateRef.current = msg.state;
                    break;

                case "gameOver":
                    setIsGameOver(true);
                    setWinner(msg.winner);
                    setFinalScore(msg.score);
                    setCountdown(null);
                    setWaiting(false);
                    break;

                case "waitingForOpponent":
                    setWaiting(true);
                    setSide(null); //  Clear match side so UI knows you're waiting
                    break;
            }
        };

        return () => ws.close();
    }, [username, isGameOver]);

    useEffect(() => {
        if (countdown === null) return;
        if (countdown === 0) {
            wsRef.current?.send(JSON.stringify({ type: "start" }));
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
            if (up || down) {
                wsRef.current.send(JSON.stringify({ type: "move", up, down }));
            }
        }, 16);

        return () => clearInterval(interval);
    }, [side, countdown, isGameOver]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent, pressed: boolean) => {
            if (e.key === "ArrowUp" || e.key === "w") keysPressed.current.up = pressed;
            if (e.key === "ArrowDown" || e.key === "s") keysPressed.current.down = pressed;
        };

        const downHandler = (e: KeyboardEvent) => handleKey(e, true);
        const upHandler = (e: KeyboardEvent) => handleKey(e, false);

        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);

        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }, []);

    const handlePlayAgain = () => {
        wsRef.current?.send(JSON.stringify({ type: "playAgain" }));
    };

    const handleGoHome = (navigate: (path: string) => void) => {
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
    };
}

