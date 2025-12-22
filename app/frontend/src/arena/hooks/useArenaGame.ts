import { useCallback, useEffect, useRef, useState } from "react";
import type { ArenaMode, ArenaState, ServerMessage, Side } from "../types";
import { useAuthStore } from "@/state/authStore";
import { useNavigate } from "react-router-dom";

type Keys = { up: boolean; down: boolean; left: boolean; right: boolean };

export function useArenaGame(mode: ArenaMode) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { id: userId, username, profile_picture: avatar } = user ?? {};

  const wsRef = useRef<WebSocket | null>(null);
  const stateRef = useRef<ArenaState | null>(null);
  const keysRef = useRef<Keys>({ up: false, down: false, left: false, right: false });

  const [side, setSide] = useState<Side | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [waiting, setWaiting] = useState(true);

  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<Side | null>(null);
  const [finalScore, setFinalScore] = useState<{ p1: number; p2: number } | null>(null);

  const [playerNames, setPlayerNames] = useState<{ p1: string; p2: string } | null>(null);
  const [playerAvatars, setPlayerAvatars] = useState<{ p1: string | null; p2: string | null } | null>(null);

  const isGameOverRef = useRef(false);
  const countdownRef = useRef<number | null>(null);

  const setCountdownState = (v: number | null) => {
    countdownRef.current = v;
    setCountdown(v);
  };

  const setGameOverState = (v: boolean) => {
    isGameOverRef.current = v;
    setIsGameOver(v);
  };

  const reset = useCallback(() => {
    setSide(null);
    setCountdownState(null);
    setWaiting(true);
    setGameOverState(false);
    setWinner(null);
    setFinalScore(null);
    setPlayerNames(null);
    setPlayerAvatars(null);
    stateRef.current = null;
    keysRef.current = { up: false, down: false, left: false, right: false };
  }, []);

  const handleGoHome = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: "leave" }));
    wsRef.current?.close();
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (!userId || !username) return;

    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/ws/arena`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          mode,
          username,
          avatar: avatar ?? null,
        })
      );
    };

    ws.onmessage = ({ data }) => {
      const msg: ServerMessage = JSON.parse(data);

      switch (msg.type) {
        case "matchFound":
          setWaiting(false);
          setSide(msg.side);
          setPlayerNames(msg.playerNames);
          setPlayerAvatars(msg.playerAvatars);
          setCountdownState(3); // UI countdown mirrors server countdown start
          setGameOverState(false);
          setWinner(null);
          setFinalScore(null);
          break;

        case "countdown":
          if (msg.count <= 0) {
            setCountdownState(null);
            // tell server ready when countdown ends on server
            wsRef.current?.send(JSON.stringify({ type: "ready" }));
          } else {
            setCountdownState(msg.count);
          }
          break;

        case "state":
          if (!isGameOverRef.current) stateRef.current = msg.state;
          break;

        case "gameOver":
          setGameOverState(true);
          setWinner(msg.winner);
          setFinalScore(msg.score);
          setCountdownState(null);
          break;

        case "opponentLeft":
          reset();
          break;

        case "error":
          console.error("Arena error:", msg.message);
          reset();
          break;
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [userId, username, avatar, mode, reset]);

  // send movement ~60 fps
  useEffect(() => {
    const interval = setInterval(() => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      if (!side || countdownRef.current !== null || isGameOverRef.current) return;

      ws.send(JSON.stringify({ type: "move", ...keysRef.current }));
    }, 16);

    return () => clearInterval(interval);
  }, [side]);

  // keys
  useEffect(() => {
    const setKey = (e: KeyboardEvent, pressed: boolean) => {
      if (e.key === "w" || e.key === "ArrowUp") {
        e.preventDefault();
        keysRef.current.up = pressed;
      }
      if (e.key === "s" || e.key === "ArrowDown") {
        e.preventDefault();
        keysRef.current.down = pressed;
      }
      if (e.key === "a" || e.key === "ArrowLeft") {
        e.preventDefault();
        keysRef.current.left = pressed;
      }
      if (e.key === "d" || e.key === "ArrowRight") {
        e.preventDefault();
        keysRef.current.right = pressed;
      }

      if (pressed && e.key === "Enter" && isGameOverRef.current) {
        e.preventDefault();
        handlePlayAgain();
      }
      if (pressed && e.key === "Escape") {
        e.preventDefault();
        handleGoHome();
      }
    };

    const down = (e: KeyboardEvent) => setKey(e, true);
    const up = (e: KeyboardEvent) => setKey(e, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [handleGoHome]);

  const handlePlayAgain = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: "playAgain", mode }));
    reset();
  }, [mode, reset]);

  return {
    stateRef,
    side,
    countdown,
    waiting,
    isGameOver,
    winner,
    finalScore,
    playerNames,
    playerAvatars,
    handlePlayAgain,
    handleGoHome,
  };
}
