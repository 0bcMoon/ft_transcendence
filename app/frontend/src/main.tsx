import { createRoot } from 'react-dom/client'
import './index.css'
import Chat from '@/chat/Chat.tsx'
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import Login from '@/auth/Login';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import RootLayout from '@/RootLayout'
import NotFound from '@/NotFound.tsx';
import UserProfile from '@/users/UserProfile';
import Settings from '@/settings/Settings';
import HomePage from './home/HomePage';
import LeaderboardPage from './home/LeaderboardPage';
import Register from './auth/Register';

import GameModes from './game/pages/GameModes';

import RemoteGame from './game/pages/RemoteGamePage';
import LocalGame from './game/pages/LocalGamePage';
import AIGame from './game/pages/AIGamePage';
import Tournaments from './game/pages/TournamentPage';
import TournamentMatch from './game/pages/TournamentMatch';
import TournamentDetailPage from './game/pages/TournamentDetailPage';
import HistoryPage from './game/pages/HistoryPage';

import FriendsPage from './users/FriendsPage';
import { WebSocketProvider } from './context/WebSocketContext';
import MatchDetailsPage from './game/pages/MatchDetailsPage';



const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "game", element: <GameModes /> },
            { path: "users/:user_id", element: <UserProfile /> },
            { path: "users", element: <FriendsPage /> },
            { path: "chat", element: <Chat /> },
            // { path: "dashboard", element: <DashboardPage /> },
            { path: "leaderboard", element: <LeaderboardPage /> },
            { path: "history", element: <HistoryPage /> },
            { path: "settings", element: <Settings /> },
            { path: "history/:matchId", element: <MatchDetailsPage /> },
            { path: "game/tournaments", element: <Tournaments /> },
            { path: "game/tournament/:id", element: <TournamentDetailPage /> },
            { path: "game/tournament/:tournamentId/match/:matchId", element: <TournamentMatch /> },
            { path: "*", element: <NotFound /> },
        ],
    },

    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "game/quick/play", element: <RemoteGame /> },
    { path: "game/local/play", element: <LocalGame /> },
    { path: "game/ai/play", element: <AIGame /> },
    { path: "*", element: <NotFound /> },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <WebSocketProvider>
                <RouterProvider router={router} />
            </WebSocketProvider>
        </AuthProvider>

        <ReactQueryDevtools
            initialIsOpen={false}
        />
    </QueryClientProvider>
);
