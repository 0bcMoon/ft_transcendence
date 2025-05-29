import { Toaster } from "react-hot-toast";
import NavigationBar from "./home/NavigationBar";
import { Outlet } from "react-router-dom";

export default function RootLayout() {
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
            /></div>
            <main className="border pt-2 pr-2 pl-2 grid grid-flow-col gap-4 w-screen h-screen  grid-cols-14">
                <NavigationBar />
                <Outlet />
            </main>

        </>
    );
}
