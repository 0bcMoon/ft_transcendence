import * as React from "react";

const API = "http://localhost:3000";

type ArenaStateMsg = {
  type: "arena:state";
  state: any;
};

export default function ArenaGamePage() {
  const [gameId, setGameId] = React.useState<number | null>(null);
  const [wsStatus, setWsStatus] = React.useState<"idle"|"connecting"|"open"|"closed"|"error">("idle");
  const [state, setState] = React.useState<any>(null);

  const wsRef = React.useRef<WebSocket | null>(null);
  React.useEffect(() => {
    if (!gameId) return;
  
    const down = new Set<string>();
  
    const onDown = (e: KeyboardEvent) => down.add(e.key);
    const onUp = (e: KeyboardEvent) => down.delete(e.key);
  
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
  
    const interval = setInterval(() => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
  
      const input = {
        up: down.has("ArrowUp") || down.has("w"),
        down: down.has("ArrowDown") || down.has("s"),
        left: down.has("ArrowLeft") || down.has("a"),
        right: down.has("ArrowRight") || down.has("d"),
      };
  
      ws.send(JSON.stringify({ type: "arena:input", gameId, input }));
    }, 50);
  
    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [gameId]);
  

  async function createGame() {
    // Example: 2 human players (replace ids with real ones from your app context later)
    const body = {
      players: [
        { user_id: 1, position: 1 },
        { user_id: 2, position: 2 },
      ],
      target_round_wins: 5,
    };

    const res = await fetch(`${API}/api/arena/games`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "Failed to create arena game");
    }

    const data = await res.json();
    setGameId(data.game.id);
  }

  function connectWs(id: number) {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setWsStatus("connecting");
    const ws = new WebSocket(`ws://localhost:3000/ws/arena`);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus("open");
      ws.send(JSON.stringify({ type: "arena:join", gameId: id }));
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as ArenaStateMsg | any;
        if (msg.type === "arena:state") setState(msg.state);
      } catch {}
    };

    ws.onerror = () => setWsStatus("error");
    ws.onclose = () => setWsStatus("closed");
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Arena (dev)</h2>

      <button
        onClick={async () => {
          const id = await createGame().catch((e) => alert(e.message));
        }}
      >
        Create Arena Game
      </button>

      <div style={{ marginTop: 12 }}>
        <div>gameId: {gameId ?? "-"}</div>
        <div>ws: {wsStatus}</div>

        {gameId && (
          <button style={{ marginTop: 8 }} onClick={() => connectWs(gameId)}>
            Connect WS + Join
          </button>
        )}
      </div>

      <pre style={{ marginTop: 16, background: "#111", color: "#0f0", padding: 12 }}>
        {state ? JSON.stringify(state, null, 2) : "no state yet"}
      </pre>
    </div>
  );
}
