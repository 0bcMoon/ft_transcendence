import { useAuth } from '@/context/AuthContext';
import HomePage from '@/home/pages/HomePage';
import LandingPage from './LandingPage';

export default function HomeOrLanding() {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? <HomePage /> : <LandingPage />;
}
