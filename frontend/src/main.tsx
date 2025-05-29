import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import Chat from './chat/Chat.tsx'
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom";
import Login from './login/Login.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Home from './home/Home.tsx';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

import RootLayout from './RootLayout'
import NotFound from './NotFound.tsx';




const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />, // Use the layout component here
        children: [ // Nested routes
            { index: true, element: <App /> }, // `index: true` makes this the default child route for '/'
            { path: 'home', element: <Home /> },   // Relative path to parent '/'
            {
                path: 'chat', // Relative path to parent '/'
                element: (
                    <ChatProvider>
                        <Chat />
                    </ChatProvider>
                ),
            },

            { path: '*', element: <NotFound /> },   // Relative path to parent '/'
        ],
    },

    { path: '/login', element: <Login /> }, // Relative path to parent '/'

    { path: '*', element: <NotFound /> },   // Relative path to parent '/'

    // You could also have other top-level routes outside of the layout if needed
    // For example, a '/admin' route with a different layout, or a '/404' route
])

const queryClient = new QueryClient()

// WARNING: : alot of providers are used in this app 

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
