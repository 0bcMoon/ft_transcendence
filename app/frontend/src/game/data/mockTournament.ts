export const mockTournament = {
    id: "1",
    name: "Weekly Championship",
    status: "completed",
    startTime: new Date("2025-12-10T18:00:00"),
    maxPlayers: 16,
    currentPlayers: 16,
    format: "Single Elimination",
    matchFormat: "Best of 3",
    prizePool: 1000,
    registrationDeadline: new Date("2025-12-09T23:59:59"),
    createdBy: "Admin",
    description: "Join our weekly championship and compete for amazing prizes!",
    champion: "Player1",
    rules: [
        "Players must be online 10 minutes before their match",
        "No cheating or exploitation allowed",
        "Respect your opponents",
        "Match results are final"
    ],
    participants: [
        { id: "1", username: "Player1", rank: "Gold", seed: 1, finalPosition: 1, status: 'winner' },
        { id: "2", username: "Player2", rank: "Silver", seed: 2, finalPosition: 2, status: 'runner-up' },
        { id: "6", username: "Player6", rank: "Gold", seed: 6, finalPosition: 3 },
        { id: "4", username: "Player4", rank: "Gold", seed: 4, finalPosition: 4 },
        { id: "3", username: "Player3", rank: "Bronze", seed: 3, finalPosition: 5 },
        { id: "5", username: "Player5", rank: "Silver", seed: 5, finalPosition: 6 },
        { id: "7", username: "Player7", rank: "Bronze", seed: 7, finalPosition: 7 },
        { id: "8", username: "Player8", rank: "Silver", seed: 8, finalPosition: 8 },
    ],
    bracket: {
        rounds: [
            {
                name: "Quarter Finals",
                matches: [
                    { id: "1", player1: "Player1", player2: "Player8", score1: 2, score2: 0, winner: "Player1", status: "completed" },
                    { id: "2", player1: "Player4", player2: "Player5", score1: 2, score2: 1, winner: "Player4", status: "completed" },
                    { id: "3", player1: "Player3", player2: "Player6", score1: 1, score2: 2, winner: "Player6", status: "completed" },
                    { id: "4", player1: "Player2", player2: "Player7", score1: 2, score2: 1, winner: "Player2", status: "completed" },
                ]
            },
            {
                name: "Semi Finals",
                matches: [
                    { id: "5", player1: "Player1", player2: "Player4", score1: 2, score2: 0, winner: "Player1", status: "completed" },
                    { id: "6", player1: "Player6", player2: "Player2", score1: 1, score2: 2, winner: "Player2", status: "completed" },
                ]
            },
            {
                name: "Final",
                matches: [
                    { id: "7", player1: "Player1", player2: "Player2", score1: 3, score2: 1, winner: "Player1", status: "completed" },
                ]
            }
        ]
    }
};
