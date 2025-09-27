import { Toaster } from "react-hot-toast";
import NavigationBar from "./home/NavigationBar";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { Loader } from "lucide-react";

export default function RootLayout() {

    const { isAuthenticated, isLoading } = useAuth();

    const navigate = useNavigate();
    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate, isLoading]);

    // TODO: add a loding page like discord maybe
    if (isLoading ) {
        return <Loader className="animate-spin" />
    }

    return (
        <>
            <div>
                <Toaster
                    toastOptions={{
                        duration: 5000,
                        position: "top-right",
                        style: {
                            width: "300px",
                        },
                    }}
                />
            </div>

            <main className="pt-2 no-scrollbar grid-flow-col pr-2 pl-2 grid gap-4 w-screen h-screen grid-cols-14 ">
                <NavigationBar />
                <Outlet />
            </main>

        </>
    );
}
