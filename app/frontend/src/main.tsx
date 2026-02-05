import './index.css'

import { createRoot } from 'react-dom/client'
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
import Tournaments from './game/pages/TournamentPage';
import TournamentMatch from './game/pages/TournamentMatch';
import TournamentDetailPage from './game/pages/TournamentDetailPage';
import HistoryPage from './game/pages/HistoryPage';
import UserMatchHistoryPage from './game/pages/UserMatchHistoryPage';


import FriendsPage from './users/FriendsPage';
import { WebSocketProvider } from './context/WebSocketContext';
import MatchDetailsPage from './game/pages/MatchDetailsPage';
import PasswordReset from './auth/components/PasswordReset';

import ArenaPlayPage from "./arena/pages/ArenaPlayPage";
import ArenaLobbyPage from "./arena/pages/ArenaLobbyPage";
import ArenaHistoryPage from "./arena/pages/ArenaHistoryPage";
import ArenaSpectatePage from "./arena/pages/ArenaSpectatePage";
import ArenaMatchesPage from "./arena/pages/ArenaMatchesPage";
import AllNotificationsPage$1 from './notifications/AllNotificationsPage';

import PrivacyPolicy from './landingpage/pages/PrivacyPolicy';
import TermsOfService from './landingpage/pages/TermsOfService';
import PublicArenaDashboard from './arena/pages/PublicArenaDashboard';


const router = createBrowserRouter([
    { path: "/privacy-policy", element: <PrivacyPolicy /> },
    { path: "/terms-of-service", element: <TermsOfService /> },
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "game", element: <GameModes /> },
            { path: "users", element: <FriendsPage /> },
            { path: "users/:user_id", element: <UserProfile /> },
            { path: "chat", element: <Chat /> },
            { path: "leaderboard", element: <LeaderboardPage /> },
            { path: "history", element: <HistoryPage /> },
            { path: "settings", element: <Settings /> },
            { path: "history/:matchId", element: <MatchDetailsPage /> },
            { path: "users/:userId/history", element: <UserMatchHistoryPage /> },
            { path: "game/tournaments", element: <Tournaments /> },
            { path: "game/tournament/:id", element: <TournamentDetailPage /> },
            { path: "notifications", element: <AllNotificationsPage$1 /> },


            { path: "arena/public/api", element: <PublicArenaDashboard /> },
            { path: "arena", element: <ArenaLobbyPage /> },
            { path: "arena/history", element: <ArenaHistoryPage /> },
            { path: "/game/arena/:gameId/play", element: <ArenaPlayPage /> },
            { path: "/game/arena/:gameId/watch", element: <ArenaSpectatePage /> },
            { path: "arena/matches", element: <ArenaMatchesPage /> },


            { path: "*", element: <NotFound /> },
        ],
    },

    { path: "game/tournament/:tournamentId/match/:matchId", element: <TournamentMatch /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/reset-password", element: <PasswordReset /> },
    { path: "game/quick/play", element: <RemoteGame /> },
    { path: "game/local/play", element: <LocalGame /> },
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
