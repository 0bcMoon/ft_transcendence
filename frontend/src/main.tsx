import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from '@/App.tsx'
import Chat from '@/chat/Chat.tsx'
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import Login from '@/login/Login.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Home from '@/home/Home.tsx';
import { AuthProvider } from '@/context/AuthContext';

import RootLayout from '@/RootLayout'
import NotFound from '@/NotFound.tsx';
import UsersPage from '@/users/UsersPage';
import UserProfile from '@/users/UserProfile';



const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { index: true, element: <App /> },
            { path: 'home', element: <Home /> },
            { path: 'users/:user_id', element: <UserProfile /> },
            { path: 'friends', element: <UsersPage /> },
            { path: 'chat', element: <Chat /> },
            { path: 'chat/:user_id', element: <Chat /> },

            { path: '*', element: <NotFound /> },   // Relative path to parent '/'
        ],
    },
    { path: '/login', element: <Login /> },
    { path: '*', element: <NotFound /> },

])

const queryClient = new QueryClient()


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </StrictMode>
)
