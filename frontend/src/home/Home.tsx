export default function HomePage() {
    return (
        <div className="col-span-13 flex flex-col overflow-y-auto no-scrollbar bg-gray-50">
            <div className="p-6 space-y-8">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                    <div className="relative z-10 text-center">
                        <h1 className="text-4xl font-bold mb-2">Ping Pong Game</h1>
                    </div>
                    <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                </div>

            </div>
        </div>
    );
}
