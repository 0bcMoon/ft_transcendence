export const mockTournamentClient = {
    getAll: async () => {
        // Simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        return [
            {
                id: "1",
                name: "Pong Masters",
                maxPlayers: 8,
                isPrivate: false,
            },
            {
                id: "2",
                name: "Elite Challengers",
                maxPlayers: 4,
                isPrivate: true,
            },
            {
                id: "3",
                name: "Weekend Warriors",
                maxPlayers: 8,
                isPrivate: false,
            },
        ];
    },
};
