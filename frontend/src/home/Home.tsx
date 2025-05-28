import { Toaster } from "react-hot-toast";
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
    const navigate = useNavigate();
    const { token, isAuthenticated } = useAuth();
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
                <p>Your token is: {token}</p>
                <h2>TODO: create home page </h2>
                <Link to="/chat"> Chat </Link>
            </div>
        </>
    );
}
