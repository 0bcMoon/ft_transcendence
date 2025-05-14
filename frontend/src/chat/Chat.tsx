import  RecentChat  from './RecentChat.tsx';
import  ChatContainer  from './ChatContainer.tsx';

export default function  Chat (){

    return (
        <div className="pt-2 pr-2 pl-2 grid grid-flow-col gap-4 h-screen  grid-cols-4 "> 
            <RecentChat />
            <ChatContainer />
        </div>
    )
}
