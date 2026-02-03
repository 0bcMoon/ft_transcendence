import { useEffect, useRef, useState } from "react";
import { GameState, ServerMessage, Side, PlayerNames, PlayerAvatars, Scores } from "../types/types";
import { useAuthStore } from "@/state/authStore";
import { useNavigate } from "react-router-dom";

type KeysPressed = { up: boolean; down: boolean };

export function useRemoteGame() {
    const userId = useAuthStore((state) => state.user?.id);
    const navigate = useNavigate();

    const wsRef = useRef<WebSocket | null>(null);
    const gameStateRef = useRef<GameState | null>(null);
    const keysPressed = useRef<KeysPressed>({ up: false, down: false });
    const isGameOverRef = useRef(false);
    const countdownRef = useRef<number | null>(null);

    const [side, setSide] = useState<Side | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState<Side | null>(null);
    const [playerNames, setPlayerNames] = useState<PlayerNames | null>(null);
    const [playerAvatars, setPlayerAvatars] = useState<PlayerAvatars | null>(null);
    const [finalScore, setFinalScore] = useState<Scores | null>(null);
    const [score, setScore] = useState<Scores>({ left: 0, right: 0 });
    const [waiting, setWaiting] = useState(true);

    useEffect(() => {
        isGameOverRef.current = isGameOver;
        countdownRef.current = countdown;
    }, [isGameOver, countdown]);

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
        keysPressed.current = { up: false, down: false };
        setWaiting(true);
    };

    useEffect(() => {
        if (!userId) return;

        const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/game`);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "remote" }));
        };

        ws.onmessage = ({ data }) => {
            const msg: ServerMessage = JSON.parse(data);
            if (!msg || !msg.type) {
                console.log("Received message:", msg.state.score);
                return;
            }

            switch (msg.type) {
                case "matchFound":
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
                    gameStateRef.current = msg.state;
                    if (msg.state?.score) {
                        setScore(msg.state.score);
                    }
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

        ws.onclose = () => wsRef.current = null;

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [userId]);

    useEffect(() => {
        if (countdown === null)
            return;

        if (countdown === 0) {
            wsRef.current?.send(JSON.stringify({ type: "ready" }));
            setCountdown(null);
            return;
        }

        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        if (!side) return;

        const interval = setInterval(() => {
            if (countdownRef.current !== null || isGameOverRef.current) return;

            wsRef.current?.send(JSON.stringify({
                type: "move",
                up: keysPressed.current.up,
                down: keysPressed.current.down
            }));
        }, 16);

        return () => clearInterval(interval);
    }, [side]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent, pressed: boolean) => {
            const key = e.key.toLowerCase();

            if (key === "arrowup" || key === "w") {
                e.preventDefault();
                keysPressed.current.up = pressed;
            } else if (key === "arrowdown" || key === "s") {
                e.preventDefault();
                keysPressed.current.down = pressed;
            } else if (pressed && key === "enter" && isGameOverRef.current) {
                e.preventDefault();
                wsRef.current?.send(JSON.stringify({ type: "playAgain", mode: "remote" }));
                resetGameState();
            } else if (pressed && key === "escape") {
                e.preventDefault();
                wsRef.current?.send(JSON.stringify({ type: "leaveGame" }));
                navigate("/game");
            }
        };

        const onKeyDown = (e: KeyboardEvent) => handleKey(e, true);
        const onKeyUp = (e: KeyboardEvent) => handleKey(e, false);

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, [navigate]);

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
    };
}
