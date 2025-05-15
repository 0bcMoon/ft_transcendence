import { Toaster } from "react-hot-toast";
import { useAuth } from '../context/useAuth';
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);


    return (
        <>
            <div><Toaster /></div>
            <div className="home">
                <h1>Welcome to the Home Page</h1>
                <p>{user?.id}</p>
                <p>{user?.username}</p>
                <p>{user?.display_name}</p>
                <p>{user?.email}</p>
                <Link to="/chat"> Chat </Link>
            </div>
        </>
    );
}
