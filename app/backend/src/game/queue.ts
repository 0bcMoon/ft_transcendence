import { queues } from "./state";
import { shuffleQueue } from "./utils/shuffleQueue";
import gameRepository from '../repository/gameRepository';
import { isOpen, send } from "./utils";
import { initState } from "./utils/initState";
import { Player, Match, Side, GameMode } from "./types/types";
import { matches } from "./state";

function getQueue(mode: GameMode): Player[] {
    const q = queues.get(mode);
    if (q) return q;
    const fresh: Player[] = [];
    queues.set(mode, fresh);
    return fresh;
}

function pruneClosed(mode: GameMode): void {
    const q = getQueue(mode);
    const filtered = q.filter((p) => isOpen(p.socket));
    if (filtered.length !== q.length) queues.set(mode, filtered);
}

export function processQueue(mode: GameMode): void {
    pruneClosed(mode);

    switch (mode) {
        case "remote":
            process1v1Queue();
            break;
        case "multiplayer":
            process4pQueue();
            break;
        case "tournament":
            processTournamentQueue();
            break;
        case "ai":
            processAIQueue();
            break;
    }
}

export async function process1v1Queue(): Promise<void> {
    const queue = getQueue("remote");
    shuffleQueue(queue);

    while (queue.length >= 2) {
        const leftPlayer = queue.shift()!;
        const rightPlayer = queue.shift()!;

        const gameId = await gameRepository.createGame("remote");

        await gameRepository.addPlayerToGame(gameId, leftPlayer.id, 1);
        await gameRepository.addPlayerToGame(gameId, rightPlayer.id, 2);
        await gameRepository.startGame(gameId);

        const playerNames = {
            left: leftPlayer.username,
            right: rightPlayer.username,
        };

        const playerAvatars = {
            left: leftPlayer.avatar,
            right: rightPlayer.avatar,
        };

        const match: Match = {
            gameId,
            players: { left: leftPlayer, right: rightPlayer },
            ready: { left: false, right: false },
            state: initState("remote"),
            startTime: Date.now(),
            mode: "remote",
        };

        matches.set(gameId, match);
        send(leftPlayer.socket, { id: String(gameId), type: "matchFound", mode: "remote", side: "left", playerNames, playerAvatars });
        send(rightPlayer.socket, { id: String(gameId), type: "matchFound", mode: "remote", side: "right", playerNames, playerAvatars });
    }
}

export async function process4pQueue(): Promise<void> {
    const queue = getQueue("multiplayer");
    shuffleQueue(queue);

    while (queue.length >= 4) {
        const leftPlayer = queue.shift()!;
        const rightPlayer = queue.shift()!;
        const topPlayer = queue.shift()!;
        const bottomPlayer = queue.shift()!;

        const gameId = await gameRepository.createGame("multiplayer");

        await gameRepository.addPlayerToGame(gameId, leftPlayer.id, 1);
        await gameRepository.addPlayerToGame(gameId, rightPlayer.id, 2);
        await gameRepository.addPlayerToGame(gameId, topPlayer.id, 3);
        await gameRepository.addPlayerToGame(gameId, bottomPlayer.id, 4);

        const playerNames = {
            left: leftPlayer.username,
            right: rightPlayer.username,
            top: topPlayer.username,
            bottom: bottomPlayer.username,
        };

        const playerAvatars = {
            left: leftPlayer.avatar,
            right: rightPlayer.avatar,
            top: topPlayer.avatar,
            bottom: bottomPlayer.avatar,
        };

        const match: Match = {
            gameId,
            players: { left: leftPlayer, right: rightPlayer, top: topPlayer, bottom: bottomPlayer },
            ready: { left: false, right: false, top: false, bottom: false },
            state: initState("multiplayer"),
            startTime: Date.now(),
            mode: "multiplayer",
        };

        matches.set(gameId, match);
        send(leftPlayer.socket, { id: String(gameId), type: "matchFound", mode: "multiplayer", side: "left", playerNames, playerAvatars });
        send(rightPlayer.socket, { id: String(gameId), type: "matchFound", mode: "multiplayer", side: "right", playerNames, playerAvatars });
        send(topPlayer.socket, { id: String(gameId), type: "matchFound", mode: "multiplayer", side: "top", playerNames, playerAvatars });
        send(bottomPlayer.socket, { id: String(gameId), type: "matchFound", mode: "multiplayer", side: "bottom", playerNames, playerAvatars });
    }
}

export function processAIQueue(): void {
    // TODO: implement AI queue
}

export async function processTournamentQueue(): Promise<void> {
    const queue = getQueue("tournament");

    // Group players by their gameId
    const gameGroups: Map<number, Player[]> = new Map();

    for (const player of queue) {
        if (!player.gameId)
            continue;

        if (!gameGroups.has(player.gameId))
            gameGroups.set(player.gameId, []);

        gameGroups.get(player.gameId)!.push(player);
    }

    // Match players for each game
    for (const [gameId, players] of gameGroups.entries()) {
        if (players.length < 2) continue;

        try {
            // Get game data to verify it exists and get player positions
            const gameData = await gameRepository.getGameWithPlayers(gameId);

            if (!gameData || gameData.mode !== "tournament") {
                console.error(`Invalid tournament game: ${gameId}`);
                continue;
            }

            if (gameData.status !== "waiting") {
                console.log(`Game ${gameId} already started or finished`);
                continue;
            }

            // Match exactly 2 players for this game
            const player1 = players[0];
            const player2 = players[1];

            // Remove from queue
            const tournamentQueue = getQueue("tournament");
            queues.set("tournament", tournamentQueue.filter(p =>
                p.id !== player1.id && p.id !== player2.id
            ));

            // Determine sides based on player positions in database
            const gamePlayer1 = gameData.players.find((gp: any) => gp.user_id === player1.id);
            const gamePlayer2 = gameData.players.find((gp: any) => gp.user_id === player2.id);

            if (!gamePlayer1 || !gamePlayer2) {
                console.error(`Players not found in game ${gameId}`);
                continue;
            }

            const leftPlayer = gamePlayer1.position === 1 ? player1 : player2;
            const rightPlayer = gamePlayer1.position === 1 ? player2 : player1;

            // Start the game in database
            await gameRepository.startGame(gameId);

            const playerNames = {
                left: leftPlayer.username,
                right: rightPlayer.username,
            };

            const playerAvatars = {
                left: leftPlayer.avatar,
                right: rightPlayer.avatar,
            };

            // Create match (same as remote)
            const match: Match = {
                gameId,
                players: { left: leftPlayer, right: rightPlayer },
                ready: { left: false, right: false },
                state: initState("tournament"),
                startTime: Date.now(),
                mode: "tournament",
            };

            matches.set(gameId, match);

            // Send matchFound to both players
            send(leftPlayer.socket, {
                id: String(gameId),
                type: "matchFound",
                mode: "tournament",
                side: "left",
                playerNames,
                playerAvatars
            });

            send(rightPlayer.socket, {
                id: String(gameId),
                type: "matchFound",
                mode: "tournament",
                side: "right",
                playerNames,
                playerAvatars
            });

        } catch (error) {
            console.error(`Error processing tournament game ${gameId}:`, error);
        }
    }
}
