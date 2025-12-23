import { useCallback, useEffect, useRef, useState } from "react";
import { GameState, ServerMessage, Side, PlayerNames, PlayerAvatars, Scores } from "../types/types";
import { useAuthStore } from "@/state/authStore";
import { useNavigate } from "react-router-dom";

type KeysPressed = { up: boolean; down: boolean };

export function useTournamentMatch(tournamentId: number, matchId: number) {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const { id: userId, username, profile_picture: avatar } = user ?? {};

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
    const [waiting, setWaiting] = useState(true);
    const [round, setRound] = useState<number>(1);
    const [matchNumber, setMatchNumber] = useState<number>(1);

    const isGameOverRef = useRef(isGameOver);
    const countdownRef = useRef(countdown);

    const setCountdownState = (value: number | null) => {
        countdownRef.current = value;
        setCountdown(value);
    };

    const setIsGameOverState = (value: boolean) => {
        isGameOverRef.current = value;
        setIsGameOver(value);
    };

    const resetGameState = useCallback(() => {
        setSide(null);
        setPlayerNames(null);
        setPlayerAvatars(null);
        setIsGameOverState(false);
        setWinner(null);
        setFinalScore(null);
        setCountdownState(null);
        setScore({ left: 0, right: 0 });
        gameStateRef.current = null;
        keysPressed.current = { up: false, down: false };
        setWaiting(true);
    }, []);

    useEffect(() => {
        if (!userId || !username) {
            console.log("User not loaded, WebSocket connection aborted.");
            return;
        }

        const websocket = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/game`);
        wsRef.current = websocket;

        websocket.onopen = () => {
            console.log(`WebSocket connected. Joining tournament match...`);
            websocket.send(
                JSON.stringify({
                    type: "joinGame",
                    mode: "tournament",
                    username: username,
                    avatar: avatar,
                    tournamentId,
                    matchId,
                })
            );
        };

        websocket.onmessage = ({ data }) => {
            const msg: ServerMessage = JSON.parse(data);

            switch (msg.type) {
                case "tournamentInfo":
                    setRound(msg.round);
                    setMatchNumber(msg.matchNumber);
                    setSide(msg.side);
                    break;

                case "matchFound":
                    setWaiting(false);
                    setPlayerNames(msg.playerNames);
                    setPlayerAvatars(msg.playerAvatars);
                    setCountdownState(3);
                    setIsGameOverState(false);
                    setWinner(null);
                    setFinalScore(null);
                    setScore({ left: 0, right: 0 });
                    break;

                case "countdown":
                    setCountdownState(msg.count);
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
                    setIsGameOverState(true);
                    setWinner(msg.winner);
                    setFinalScore(msg.score);
                    setCountdownState(null);
                    break;

                case "leaveGame":
                    resetGameState();
                    break;

                case "error":
                    setTimeout(() => {
                        navigate(`/game/tournaments/${tournamentId}`);
                    }, 2000);
                    break;
            }
        };

        websocket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        websocket.onclose = () => {
            console.log("WebSocket disconnected");
            wsRef.current = null;
        };

        return () => {
            if (websocket.readyState === WebSocket.OPEN) {
                websocket.send(JSON.stringify({ type: "leaveGame" }));
            }
            websocket.close();
            wsRef.current = null;
        };
    }, [userId, username, avatar, tournamentId, matchId, resetGameState, navigate]);

    useEffect(() => {
        if (countdown === null || countdown === undefined) return;

        if (countdown === 0) {
            wsRef.current?.send(JSON.stringify({ type: "ready" }));
            setCountdownState(null);
            return;
        }

        const timer = setTimeout(() => {
            setCountdownState(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            if (!side || countdownRef.current !== null || isGameOverRef.current) return;

            wsRef.current.send(
                JSON.stringify({
                    type: "move",
                    up: keysPressed.current.up,
                    down: keysPressed.current.down,
                })
            );
        }, 16);

        return () => clearInterval(interval);
    }, [side]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent, pressed: boolean) => {
            if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
                e.preventDefault();
                keysPressed.current.up = pressed;
            }
            if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
                e.preventDefault();
                keysPressed.current.down = pressed;
            }
            if (pressed && e.key === "Escape") {
                e.preventDefault();
                wsRef.current?.send(JSON.stringify({ type: "leaveGame" }));
                wsRef.current?.close();
                navigate(`/game/tournament/${tournamentId}`);
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
    }, [tournamentId, navigate]);

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
        round,
        matchNumber,
    };
}
