import { useEffect, useRef, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GameMessage, GameState } from "./game.protocol";
import { GameCanvas } from "./GameCanvas";

const GAME_WS_URL = "ws://localhost:3000/game";

type Status =
    | "connecting"
    | "waiting"
    | "matched"
    | "playing"
    | "gameover"
    | "error";

const PADDLE_SPEED = 15; // px per frame (60fps) for smooth movement

const GameQuick: React.FC = () => {
    const [status, setStatus] = useState<Status>("connecting");
    const [error, setError] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");
    const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [winner, setWinner] = useState<1 | 2 | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const intentionalCloseRef = useRef(false);
    const gameOverRef = useRef(false);
    const navigate = useNavigate();

    // --- For smooth movement ---
    const moveDirectionRef = useRef<"up" | "down" | null>(null);
    const lastSendTimeRef = useRef(0);
    const SEND_INTERVAL = 33; // ~30fps to reduce server load
    const animationFrameRef = useRef<number>();
    const isMovingRef = useRef(false);

    // WebSocket lifecycle
    useEffect(() => {
        let isMounted = true;
        intentionalCloseRef.current = false;
        gameOverRef.current = false;

        const ws = new WebSocket(GAME_WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            if (isMounted) setStatus("waiting");
        };

        ws.onmessage = (event) => {
            if (!isMounted) return;
            try {
                const msg: GameMessage = JSON.parse(event.data);
                switch (msg.type) {
                    case "game_start":
                        setRoomId(msg.data.roomId);
                        setPlayerNumber(msg.data.playerNumber);
                        setGameState(msg.data.gameState);
                        setWinner(null);
                        setStatus("playing");
                        break;
                    case "waiting":
                        setStatus("waiting");
                        break;
                    case "game_state":
                        if (msg.data) setGameState(msg.data);
                        break;
                    case "game_over":
                        if (msg.data) {
                            setWinner(msg.data.winner);
                            setStatus("gameover");
                            gameOverRef.current = true;
                        }
                        break;
                }
            } catch (err) {
                console.error("Error parsing message:", err);
                if (isMounted) {
                    setStatus("error");
                    setError("Invalid server message.");
                }
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            if (isMounted && !gameOverRef.current) {
                setStatus("error");
                setError("Could not connect to game server.");
            }
        };

        ws.onclose = (event) => {
            console.log("WebSocket closed:", event);
            if (
                isMounted &&
                !intentionalCloseRef.current &&
                !gameOverRef.current &&
                status !== "gameover" &&
                status !== "playing"
            ) {
                setStatus("error");
                setError("Connection closed.");
            }
        };

        return () => {
            isMounted = false;
            intentionalCloseRef.current = true;
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // --- Smooth paddle controls ---
    useEffect(() => {
        if (status !== "playing" || !gameState || !wsRef.current) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === "w" ||
                e.key === "s" ||
                e.key === "ArrowUp" ||
                e.key === "ArrowDown"
            ) {
                e.preventDefault();
            }

            // Only set direction if this is the correct player's controls
            if (playerNumber === 1) {
                if (e.key === "w") moveDirectionRef.current = "up";
                else if (e.key === "s") moveDirectionRef.current = "down";
            } else if (playerNumber === 2) {
                if (e.key === "ArrowUp") moveDirectionRef.current = "up";
                else if (e.key === "ArrowDown") moveDirectionRef.current = "down";
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            // Only clear direction if this is the correct player's controls
            if (
                (playerNumber === 1 && (e.key === "w" || e.key === "s")) ||
                (playerNumber === 2 && (e.key === "ArrowUp" || e.key === "ArrowDown"))
            ) {
                e.preventDefault();
                // Only clear if the released key matches the current movement
                if (
                    (e.key === "w" && moveDirectionRef.current === "up") ||
                    (e.key === "s" && moveDirectionRef.current === "down") ||
                    (e.key === "ArrowUp" && moveDirectionRef.current === "up") ||
                    (e.key === "ArrowDown" && moveDirectionRef.current === "down")
                ) {
                    moveDirectionRef.current = null;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        // Animation loop for paddle movement
        const animate = () => {
            if (
                moveDirectionRef.current &&
                gameState &&
                wsRef.current?.readyState === WebSocket.OPEN
            ) {
                const now = Date.now();
                // Throttle sending messages to avoid overwhelming the server
                if (now - lastSendTimeRef.current >= SEND_INTERVAL) {
                    const paddleKey = playerNumber === 1 ? "paddle1Y" : "paddle2Y";
                    const paddleHeight =
                        typeof gameState.paddleHeight === "number"
                            ? gameState.paddleHeight
                            : 80;
                    const maxY = 600 - paddleHeight;
                    const minY = 0;
                    const currentY = gameState[paddleKey];
                    const dy =
                        moveDirectionRef.current === "up" ? -PADDLE_SPEED : PADDLE_SPEED;
                    const newY = Math.max(minY, Math.min(maxY, currentY + dy));

                    // Only send update if position changed
                    if (currentY !== newY) {
                        try {
                            wsRef.current.send(
                                JSON.stringify({ type: "paddle_move", data: { y: newY } }),
                            );
                            lastSendTimeRef.current = now;
                        } catch (error) {
                            console.error("Failed to send paddle move:", error);
                        }
                    }
                }
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            if (animationFrameRef.current)
                cancelAnimationFrame(animationFrameRef.current);
        };
    }, [gameState, playerNumber, status]);

    /**
     * Play Again: cleanly reconnect and reset state.
     */
    const handlePlayAgain = () => {
        intentionalCloseRef.current = true;
        if (wsRef.current) {
            wsRef.current.close();
        }

        setStatus("connecting");
        setError("");
        setRoomId("");
        setPlayerNumber(1);
        setGameState(null);
        setWinner(null);

        gameOverRef.current = false;

        const ws = new WebSocket(GAME_WS_URL);
        wsRef.current = ws;

        ws.onopen = () => setStatus("waiting");
        ws.onmessage = (event) => {
            try {
                const msg: GameMessage = JSON.parse(event.data);
                switch (msg.type) {
                    case "game_start":
                        setRoomId(msg.data.roomId);
                        setPlayerNumber(msg.data.playerNumber);
                        setGameState(msg.data.gameState);
                        setWinner(null);
                        setStatus("playing");
                        break;
                    case "waiting":
                        setStatus("waiting");
                        break;
                    case "game_state":
                        if (msg.data) setGameState(msg.data);
                        break;
                    case "game_over":
                        if (msg.data) {
                            setWinner(msg.data.winner);
                            setStatus("gameover");
                            gameOverRef.current = true;
                        }
                        break;
                }
            } catch (err) {
                console.error("Error parsing message:", err);
                setStatus("error");
                setError("Invalid server message.");
            }
        };
        ws.onerror = () => {
            if (!gameOverRef.current) {
                setStatus("error");
                setError("Could not connect to game server.");
            }
        };
        ws.onclose = () => {
            if (
                !intentionalCloseRef.current &&
                !gameOverRef.current &&
                status !== "gameover" &&
                status !== "playing"
            ) {
                setStatus("error");
                setError("Connection closed.");
            }
        };
        intentionalCloseRef.current = false;
    };

    /**
     * Return Home: clean up and navigate.
     */
    const handleReturnHome = () => {
        intentionalCloseRef.current = true;
        if (wsRef.current) {
            wsRef.current.close();
        }
        navigate("/");
    };

    /**
     * Game Canvas Only UI
     */
    const renderGameCanvas = () => (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden">
            <GameCanvas gameState={gameState!} />
            <div className="mt-4 text-center text-gray-200 font-medium text-lg">
                {playerNumber === 1
                    ? "You are Player 1 — W/S to move"
                    : "You are Player 2 — ↑/↓ to move"}
            </div>
        </div>
    );

    if (status === "playing" && gameState) {
        return renderGameCanvas();
    }

    // All other states: render menus, loaders, etc.
    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar">
            <div className="max-w-xl mx-auto w-full px-4 py-10">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="bg-green-100 p-4 rounded-full mb-4">
                        <Users size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Quick Match</h2>
                    <p className="text-gray-600 mb-6 text-center">
                        Connects you to another player for a real-time match.
                    </p>
                    {status === "connecting" && (
                        <div className="flex items-center gap-2 text-blue-600 font-semibold">
                            <Loader2 className="animate-spin" size={20} />
                            Connecting to server…
                        </div>
                    )}
                    {status === "waiting" && (
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 text-green-600 font-semibold animate-pulse">
                                <Loader2 className="animate-spin" size={20} />
                                Waiting for opponent…
                            </div>
                            <div className="text-gray-500 text-xs mt-2">
                                Keep this tab open
                            </div>
                        </div>
                    )}
                    {status === "matched" && (
                        <div className="text-blue-600 font-bold">
                            Match found! Get ready…
                        </div>
                    )}
                    {status === "error" && (
                        <div className="text-red-600 font-semibold">{error}</div>
                    )}
                    {status === "gameover" && (
                        <div className="w-full flex flex-col items-center">
                            <div className="text-xl mt-4 font-bold text-gray-800">
                                {winner === playerNumber ? "You Win!" : "You Lose"}
                            </div>
                            <div className="mt-6 flex gap-4">
                                <button
                                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors"
                                    onClick={handlePlayAgain}
                                >
                                    Play Again
                                </button>
                                <button
                                    className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded hover:bg-gray-400 transition-colors"
                                    onClick={handleReturnHome}
                                >
                                    Return Home
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameQuick;
