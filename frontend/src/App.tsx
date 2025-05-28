import { useNavigate } from 'react-router-dom';
import './App.css'
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';

function App() {

    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);


    // TODO: here should be dashboard and check if user is logged in
    return (
        <div className="App">
            Hello World!
        </div>
    );
}

export default App
