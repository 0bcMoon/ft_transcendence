import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import Chat from "@/chat/Chat.tsx";
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import Login from "@/login/Login.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Game from "@/game/Game.tsx";
import LocalGame from "@/game/LocalGame.tsx";
import LocalGamePlay from "@/game/local/LocalGame";
import { AuthProvider } from "@/context/AuthContext";

import RootLayout from "@/RootLayout";
import NotFound from "@/NotFound.tsx";
import UsersPage from "@/users/UsersPage";
import UserProfile from "@/users/UserProfile";
import Settings from "@/settings/Settings";
import QuickGame from "./game/Quick/Game";
import HomePage from "./home/Home";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "game", element: <Game /> },
            { path: "users/:user_id", element: <UserProfile /> },
            { path: "users", element: <UsersPage /> },
            { path: "chat", element: <Chat /> },
            { path: "chat/:user_id", element: <Chat /> },
            { path: "settings", element: <Settings /> },
            { path: "game/local", element: <LocalGame /> },
            { path: "*", element: <NotFound /> }, // Relative path to parent '/'
        ],
    },
    { path: "/login", element: <Login /> },
    { path: "/game/local/play", element: <LocalGamePlay /> }, // Moved outside RootLayout
    { path: "game/quick", element: <QuickGame /> },

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
