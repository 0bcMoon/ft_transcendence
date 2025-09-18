import { createRoot } from 'react-dom/client'
import Chat from '@/chat/Chat.tsx'
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import Login from '@/auth/Login';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import GameMode from '@/game/pages/GameMode.tsx';
import LocalGame from '@/game/LocalGame.tsx';
import LocalGamePlay from '@/game/pages/LocalGame';
import { AuthProvider } from '@/context/AuthContext';

import RootLayout from '@/RootLayout'
import NotFound from '@/NotFound.tsx';
import UsersPage from '@/users/UsersPage';
import UserProfile from '@/users/UserProfile';
import Settings from '@/settings/Settings';
import HomePage from './home/Home';
import Register from './auth/Register';
import Quick from './game/pages/Quick';
import Multiplayer from './game/pages/Multiplayer';
import AIGame from './game/pages/AIGame';
import DashboardPage from './dashboard/DashboardPage'
import { StrictMode } from 'react';

import TournamentLobby from './game/pages/TournamentLobby';
import TournamentCreate from './game/pages/CreateTournament';
import TournamentJoin from './game/pages/JoinTournament';
import TournamentBrackets from './game/pages/TournamentBracket';

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "game", element: <GameMode /> },
            { path: "users/:user_id", element: <UserProfile /> },
            { path: "users", element: <UsersPage /> },
            { path: "chat", element: <Chat /> },
            { path: "stats", element: <DashboardPage /> },
            { path: "chat/:user_id", element: <Chat /> },
            { path: "settings", element: <Settings /> },
            { path: "game/local", element: <LocalGame /> },
            { path: "game/tournament", element: <TournamentLobby /> },
            { path: "game/tournament/create", element: <TournamentCreate /> },
            { path: "game/tournament/join", element: <TournamentJoin /> },
            { path: "game/tournament/bracket", element: <TournamentBrackets /> },
            { path: "*", element: <NotFound /> },
        ],
    },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/game/local/play", element: <LocalGamePlay /> },
    { path: "game/quick", element: <Quick /> },
    { path: "game/multiplayer", element: <Multiplayer /> },
    { path: "game/ai", element: <AIGame /> },
    { path: "game/tournament", element: <TournamentLobby /> },

    { path: "*", element: <NotFound /> },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </StrictMode>,
);
