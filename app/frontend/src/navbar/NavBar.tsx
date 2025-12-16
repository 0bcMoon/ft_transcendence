import { useState } from 'react';
import SideBar from './SideBar';
import TopBar from './TopBar';

export default function NavBar({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="h-screen overflow-hidden">
            {/* Sidebar - Floating, centered vertically */}
            <SideBar
                isSidebarOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main content area - Full width */}
            <div className="h-full flex flex-col">
                {/* TopBar - Full width with logo */}
                <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

                {/* Main content */}
                <main className="flex-1 mt-16 bg-gray-50 overflow-auto dark:bg-slate-900">
                    {children}
                </main>
            </div>
        </div>
    );
}
