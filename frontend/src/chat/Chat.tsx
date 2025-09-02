import { useState } from 'react';
import { ContactSidebar } from './ContactSidebar';
import { ChatArea } from './ChatArea';

function Chat() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // const { chats, activeChat,  blockUser } = useChatData();


    // const handleProfileClick = (user: User) => {
    //     setSelectedUser(user);
    // };

    // const handleBlockUser = (userId: string) => {
    //     if (window.confirm(`Are you sure you want to ${chats.find(c => c.user.id === userId)?.user.isBlocked ? 'unblock' : 'block'} this user?`)) {
    //         blockUser(userId);
    //     }
    // };

    return (
        <div className="h-[97svh] bg-gray-100 flex overflow-hidden col-span-14 border-gray-100 border-2 shadow-lg shadow-gray-200 rounded-2xl">
            {/* Contact Sidebar */}
            <ContactSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Chat Area */}
            <ChatArea
                onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            />
        </div>
    );
}

export default Chat;
