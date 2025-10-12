import { useState } from 'react';
import { Search, Users, UserPlus, UserX } from 'lucide-react';
import FriendsList from './components/FriendsList';
import SearchUsers from './components/SearchUsers';
import FriendRequests from './components/FriendRequests';
import BlockedUsers from './components/BlockedUsers';
import { useWebSocket } from '@/context/WebSocketContext';

type TabType = 'friends' | 'search' | 'requests' | 'blocked';

const FriendsPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('friends');

    const tabs = [
        { id: 'friends' as TabType, label: 'Friends', icon: Users },
        { id: 'search' as TabType, label: 'Search Users', icon: Search },
        { id: 'requests' as TabType, label: 'Requests', icon: UserPlus },
        { id: 'blocked' as TabType, label: 'Blocked', icon: UserX },
    ];

    const RenderContent = () => {

        switch (activeTab) {
            case 'friends':
                return <FriendsList />;
            case 'search':
                return <SearchUsers />;
            case 'requests':
                return <FriendRequests />;
            case 'blocked':
                return <BlockedUsers />;
            default:
                return <FriendsList />;
        }
    };


    return (

        <div className="col-span-14 h-[97svh] bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Friends</h1>
                    <p className="text-lg text-gray-600">Manage your connections and discover new people</p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-8 py-5 font-medium whitespace-nowrap transition-all duration-200 border-b-2 text-base ${isActive
                                        ? 'text-blue-600 border-blue-600 bg-blue-50'
                                        : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="w-6 h-6" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <RenderContent />
                </div>
            </div>
        </div>
    );
};

export default FriendsPage;
