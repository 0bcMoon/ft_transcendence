import { createRoot } from 'react-dom/client'
import Chat from '@/chat/Chat.tsx'
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import Login from '@/auth/Login';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LocalGame from '@/game/LocalGame.tsx';
import LocalGamePlay from '@/game/pages/LocalGame';
import { AuthProvider } from '@/context/AuthContext';

import RootLayout from '@/RootLayout'
import NotFound from '@/NotFound.tsx';
import UserProfile from '@/users/UserProfile';
import Settings from '@/settings/Settings';
import HomePage from './home/Home';
import Register from './auth/Register';
import Quick from './game/pages/Quick';
import Multiplayer from './game/pages/Multiplayer';
import AIGame from './game/pages/AIGame';
import DashboardPage from './dashboard/DashboardPage'

import Tournament from './game/pages/Tournament';
import TournamentPlay from './game/pages/TournamentPlay';
import TournamentCreate from './game/pages/CreateTournament';
import TournamentList from './game/pages/ListTournament';
import TournamentBrackets from './game/pages/TournamentBracket';
import FriendsPage from './users/FriendsPage';
import GameMode from './game/pages/GameMode';
import { WebSocketProvider } from './context/WebSocketContext';

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "game", element: <GameMode /> },
            { path: "users/:user_id", element: <UserProfile /> },
            { path: "users", element: <FriendsPage /> },
            { path: "chat", element: <Chat /> },
            { path: "stats", element: <DashboardPage /> },
            { path: "settings", element: <Settings /> },
            { path: "game/local", element: <LocalGame /> },
            { path: "game/tournament", element: <Tournament /> },
            { path: "game/tournament/create", element: <TournamentCreate /> },
            { path: "game/tournament/list", element: <TournamentList /> },
            { path: "game/tournament/:id", element: <TournamentBrackets /> },

            { path: "*", element: <NotFound /> },
        ],
    },

    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/game/local/play", element: <LocalGamePlay /> },
    { path: "game/quick/play", element: <Quick /> },
    { path: "game/tournament/play", element: <TournamentPlay /> },
    { path: "game/tournament/play/:gameId", element: <TournamentPlay /> }, // ✅ Added :gameId
    { path: "game/ai", element: <AIGame /> },
    { path: "*", element: <NotFound /> },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    //    <StrictMode>
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <WebSocketProvider>
                <RouterProvider router={router} />
            </WebSocketProvider>
        </AuthProvider>
    </QueryClientProvider>
    //   </StrictMode>,
);
