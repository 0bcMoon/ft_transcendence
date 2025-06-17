import { Toaster } from "react-hot-toast";
import NavigationBar from "./home/NavigationBar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";

export default function RootLayout() {

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);
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
