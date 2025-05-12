import './App.css'
import RecentChat from './components/RecentChat';
import ChatContainer from './components/Chat';

function App() {

    return (
        <div className="pt-2 pr-2 pl-2 grid grid-flow-col gap-4 h-screen  grid-cols-4 "> 
            <RecentChat />
            <ChatContainer />
        </div>
    );
}

export default App
