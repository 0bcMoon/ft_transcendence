// import { useEffect, useMemo, useState } from "react";
// // import React  from "react";

// type ArenaGame = {
//   id: number;
//   status: string;
//   winner_user_id: number | null;
//   target_round_wins: number;
//   created_at: any;
//   started_at: any | null;
//   ended_at: any | null;
// };

// type ArenaPlayer = {
//   position: number;
//   user_id: number | null;
//   username?: string | null;
//   display_name?: string | null;
//   profile_picture?: string | null;
//   round_wins: number;
//   is_ai: boolean;
// };

// type ApiErrorBody = { message?: string };

// function formatTs(v: any) {
//   if (!v) return "—";
//   if (typeof v === "string") return v;
//   try {
//     return String(v);
//   } catch {
//     return "—";
//   }
// }

// function statusBadge(status: string) {
//   const base =
//     "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";
//   switch (status) {
//     case "finished":
//       return `${base} border-emerald-400/30 bg-emerald-500/10 text-emerald-200`;
//     case "playing":
//       return `${base} border-cyan-400/30 bg-cyan-500/10 text-cyan-200`;
//     case "waiting":
//       return `${base} border-amber-400/30 bg-amber-500/10 text-amber-200`;
//     case "cancelled":
//       return `${base} border-rose-400/30 bg-rose-500/10 text-rose-200`;
//     default:
//       return `${base} border-slate-400/30 bg-slate-500/10 text-slate-200`;
//   }
// }

// function winnerLabel(winner_user_id: number | null) {
//   if (winner_user_id === null) return "AI / null";
//   return `User #${winner_user_id}`;
// }

// const LS_KEY = "public_api_key";

// function getStoredKey() {
//   return localStorage.getItem(LS_KEY) ?? "";
// }

// function setStoredKey(v: string) {
//   localStorage.setItem(LS_KEY, v);
// }

// /**
//  * Minimal "public API client" that automatically injects X-API-Key.
//  * IMPORTANT: browsers cannot ignore self-signed certs; you must accept the TLS warning once.
//  */
// function usePublicApi(baseUrl: string, apiKey: string) {
//   return useMemo(() => {
//     const request = async <T,>(
//       path: string,
//       opts?: RequestInit
//     ): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> => {
//       try {
//         const res = await fetch(`${baseUrl}${path}`, {
//           ...opts,
//           headers: {
//             ...(opts?.headers ?? {}),
//             "X-API-Key": apiKey,
//           },
//         });

//         const text = await res.text();
//         let body: any = null;
//         if (text) {
//           try {
//             body = JSON.parse(text);
//           } catch {
//             body = text;
//           }
//         }

//         if (!res.ok) {
//           const msg =
//             (body && typeof body === "object" && (body as ApiErrorBody).message) ||
//             (typeof body === "string" ? body : "") ||
//             res.statusText ||
//             "Request failed";
//           return { ok: false, status: res.status, error: msg };
//         }

//         return { ok: true, data: (body ?? null) as T };
//       } catch (e: any) {
//         return { ok: false, status: 0, error: e?.message ?? "Network error" };
//       }
//     };

//     return { request };
//   }, [baseUrl, apiKey]);
// }

// export default function PublicArenaDashboard() {
//   // Change this if your nginx exposes a different host/port
//   // (During correction, keep it exactly what you use: https://localhost:8080)
//   const BASE_URL = "https://localhost:8080/api/public";

//   const [apiKey, setApiKey] = useState<string>(() => getStoredKey());
//   const [status, setStatus] = useState<string>("finished");

//   const api = usePublicApi(BASE_URL, apiKey);

//   const [games, setGames] = useState<ArenaGame[]>([]);
//   const [selectedGame, setSelectedGame] = useState<ArenaGame | null>(null);
//   const [players, setPlayers] = useState<ArenaPlayer[] | null>(null);

//   const [loadingGames, setLoadingGames] = useState(false);
//   const [loadingPlayers, setLoadingPlayers] = useState(false);

//   const [error, setError] = useState<string | null>(null);
//   const [hint, setHint] = useState<string | null>(null);

//   useEffect(() => {
//     setStoredKey(apiKey);
//   }, [apiKey]);

//   const prettyError = (statusCode: number, msg: string) => {
//     if (statusCode === 401) return `401 Unauthorized — ${msg} (check X-API-Key)`;
//     if (statusCode === 429) return `429 Too Many Requests — ${msg} (rate limit works ✅)`;
//     if (statusCode === 0)
//       return `Network error — ${msg}. If this is the first time: open ${BASE_URL}/arena/games in the browser and accept the HTTPS warning.`;
//     return `${statusCode || 500} — ${msg}`;
//   };

//   const loadGames = async () => {
//     setError(null);
//     setHint(null);
//     setSelectedGame(null);
//     setPlayers(null);

//     if (!apiKey.trim()) {
//       setError("Please paste your X-API-Key first.");
//       return;
//     }

//     setLoadingGames(true);
//     const r = await api.request<{ games: ArenaGame[] }>(`/arena/games?status=${encodeURIComponent(status)}`);
//     setLoadingGames(false);

//     if (!r.ok) {
//       setError(prettyError(r.status, r.error));
//       return;
//     }

//     setGames(r.data.games ?? []);
//     if ((r.data.games ?? []).length === 0) {
//       setHint("No games for this status yet.");
//     }
//   };

//   const loadPlayers = async (game: ArenaGame) => {
//     setError(null);
//     setHint(null);
//     setSelectedGame(game);
//     setPlayers(null);

//     setLoadingPlayers(true);
//     const r = await api.request<ArenaPlayer[]>(`/arena/games/${game.id}/players`);
//     setLoadingPlayers(false);

//     if (!r.ok) {
//       setError(prettyError(r.status, r.error));
//       return;
//     }

//     setPlayers(r.data ?? []);
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
//       <div className="mx-auto w-full max-w-6xl">
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold">Public Arena Dashboard</h1>
//           <p className="text-sm text-slate-300">
//             Evaluator-friendly viewer for <code className="text-slate-200">/api/public/arena</code> (HTTPS + API key + rate limit).
//           </p>
//         </div>

//         {/* Controls */}
//         <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-3">
//           <div className="md:col-span-2">
//             <label className="text-xs text-slate-300">X-API-Key</label>
//             <input
//               value={apiKey}
//               onChange={(e) => setApiKey(e.target.value)}
//               placeholder="Paste API key (stored in localStorage)"
//               className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-slate-500"
//             />
//             <div className="mt-2 text-xs text-slate-400">
//               Tip: Browser can’t bypass self-signed TLS like <code>curl -k</code>. If requests fail, open{" "}
//               <code className="text-slate-200">https://localhost:8080</code> once and accept the warning.
//             </div>
//           </div>

//           <div>
//             <label className="text-xs text-slate-300">Status</label>
//             <select
//               value={status}
//               onChange={(e) => setStatus(e.target.value)}
//               className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-slate-500"
//             >
//               <option value="finished">finished</option>
//               <option value="playing">playing</option>
//               <option value="waiting">waiting</option>
//               <option value="cancelled">cancelled</option>
//             </select>

//             <button
//               onClick={loadGames}
//               disabled={loadingGames}
//               className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-white disabled:opacity-60"
//             >
//               {loadingGames ? "Loading…" : "Load games"}
//             </button>

//             <button
//               onClick={() => {
//                 setGames([]);
//                 setSelectedGame(null);
//                 setPlayers(null);
//                 setError(null);
//                 setHint(null);
//               }}
//               className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200 hover:bg-slate-950/70"
//             >
//               Clear
//             </button>
//           </div>
//         </div>

//         {/* Error / Hint */}
//         {error && (
//           <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
//             {error}
//           </div>
//         )}
//         {hint && (
//           <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-200">
//             {hint}
//           </div>
//         )}

//         {/* Main */}
//         <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
//           {/* Games list */}
//           <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
//             <div className="flex items-center justify-between border-b border-slate-800 p-4">
//               <div>
//                 <div className="text-sm font-semibold">Games</div>
//                 <div className="text-xs text-slate-400">Click a game to view players</div>
//               </div>
//               <div className="text-xs text-slate-400">{games.length} items</div>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="text-left text-xs text-slate-400">
//                   <tr className="border-b border-slate-800">
//                     <th className="p-3">ID</th>
//                     <th className="p-3">Status</th>
//                     <th className="p-3">Winner</th>
//                     <th className="p-3">Target</th>
//                     <th className="p-3">Ended</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {games.map((g) => (
//                     <tr
//                       key={g.id}
//                       className="cursor-pointer border-b border-slate-900 hover:bg-slate-950/40"
//                       onClick={() => loadPlayers(g)}
//                     >
//                       <td className="p-3 font-semibold">#{g.id}</td>
//                       <td className="p-3">
//                         <span className={statusBadge(g.status)}>{g.status}</span>
//                       </td>
//                       <td className="p-3">{winnerLabel(g.winner_user_id)}</td>
//                       <td className="p-3">{g.target_round_wins}</td>
//                       <td className="p-3">{formatTs(g.ended_at)}</td>
//                     </tr>
//                   ))}
//                   {games.length === 0 && (
//                     <tr>
//                       <td className="p-4 text-slate-400" colSpan={5}>
//                         No games loaded.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Details */}
//           <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
//             <div className="border-b border-slate-800 p-4">
//               <div className="text-sm font-semibold">Game details</div>
//               <div className="text-xs text-slate-400">
//                 {selectedGame ? `Selected: #${selectedGame.id}` : "Select a game from the left"}
//               </div>
//             </div>

//             <div className="p-4">
//               {!selectedGame && <div className="text-sm text-slate-300">No game selected.</div>}

//               {selectedGame && (
//                 <>
//                   <div className="grid grid-cols-2 gap-3 text-sm">
//                     <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
//                       <div className="text-xs text-slate-400">Status</div>
//                       <div className="mt-1">
//                         <span className={statusBadge(selectedGame.status)}>{selectedGame.status}</span>
//                       </div>
//                     </div>

//                     <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
//                       <div className="text-xs text-slate-400">Winner</div>
//                       <div className="mt-1 font-semibold">{winnerLabel(selectedGame.winner_user_id)}</div>
//                     </div>

//                     <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
//                       <div className="text-xs text-slate-400">Created</div>
//                       <div className="mt-1">{formatTs(selectedGame.created_at)}</div>
//                     </div>

//                     <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
//                       <div className="text-xs text-slate-400">Target round wins</div>
//                       <div className="mt-1 font-semibold">{selectedGame.target_round_wins}</div>
//                     </div>
//                   </div>

//                   <div className="mt-4">
//                     <div className="mb-2 text-xs text-slate-400">Players</div>

//                     {loadingPlayers && (
//                       <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-300">
//                         Loading players…
//                       </div>
//                     )}

//                     {!loadingPlayers && players && (
//                       <div className="space-y-2">
//                         {players.map((p) => (
//                           <div
//                             key={p.position}
//                             className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3"
//                           >
//                             <div>
//                               <div className="text-sm font-semibold">
//                                 P{p.position}{" "}
//                                 <span className="text-xs text-slate-400">
//                                   {p.is_ai ? "(AI)" : ""}
//                                 </span>
//                               </div>
//                               <div className="text-xs text-slate-400">
//                                 {p.username ?? p.display_name ?? (p.user_id ? `User #${p.user_id}` : "—")}
//                               </div>
//                             </div>
//                             <div className="text-sm">
//                               <span className="text-xs text-slate-400">round_wins</span>{" "}
//                               <span className="font-semibold">{p.round_wins}</span>
//                             </div>
//                           </div>
//                         ))}
//                         {players.length === 0 && (
//                           <div className="text-sm text-slate-400">No players found.</div>
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/30 p-3 text-xs text-slate-400">
//                     To show rate limit in correction: spam “Load games” or run your curl loop and show a 429.
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Footer note */}
//         <div className="mt-6 text-xs text-slate-500">
//           Note for correction: browser cannot do <code>curl -k</code>. Self-signed TLS requires accepting the warning once.
//           API key is entered manually to avoid hardcoding secrets in frontend.
//         </div>
//       </div>
//     </div>
//   );
// }
