export default function WaitingScreen() {
    return (
        <div className="mt-8 flex flex-col items-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 border-4 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-xl font-semibold text-pink-500 tracking-wide drop-shadow">
                Waiting for opponent...
            </p>
        </div>
    );
}

