import { Link } from "react-router-dom";

export default function Home() {

    return (

        <div className="col-span-13 break-all flex flex-col items-center justify-center h-screen">
            <h1>Welcome to the Home Page</h1>
            <p>TODO: create home page </p>
            <Link to="/chat"> Chat </Link>
        </div>
    );
}
