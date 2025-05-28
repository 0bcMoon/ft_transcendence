import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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




const router = createBrowserRouter([
    { path: '/', element: <App /> },
    {
        path: '/chat',
        element: (
                <ChatProvider>
                    <Chat />
                </ChatProvider>
        ),
    },
    { path: '/login', element: <Login /> },
    { path: '/home', element: <Home /> },
]);
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
