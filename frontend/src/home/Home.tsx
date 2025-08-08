import { useAuthStore } from "@/state/authStore";
import { Link } from "react-router-dom";

export default function Home() {
    const user = useAuthStore((state) => state.user);

    return (

        <div className="col-span-13 break-all flex flex-col items-center justify-center h-screen">
            <h1>Welcome to the Home Page</h1>
            <p className="border p-2 w-120 rounded-2xl font-bold">{user?.username} </p>
            <p className="border p-2 w-120 rounded-2xl font-bold">{user?.display_name} </p>
            <p className="border p-2 w-120 rounded-2xl font-bold">{user?.email} </p>
            <p className="border p-2 w-120 rounded-2xl font-bold">{user?.profile_picture} </p>
        </div>
    );
}
