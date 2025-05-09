import './App.css'
import RecentChat from './components/RecentChat';
import Chat from './components/Chat';

function App() {

    return (
        <div className="p-2 grid grid-flow-col gap-4 h-screen  grid-cols-4 "> 
            <RecentChat />
            <Chat />
        </div>
    );
}

export default App
