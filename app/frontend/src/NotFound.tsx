export default function NotFound() {

    return (
        <div className="col-span-12 bg-white flex items-center justify-center dark:bg-gray-900">
            <div className="text-center space-y-8 max-w-md mx-auto px-6">
                <div className="space-y-4">
                    <h1 className="text-9xl font-black text-black tracking-tight dark:text-white"> 404 </h1>
                    <div className="w-24 h-1 bg-gray-900 mx-auto dark:bg-gray-100"></div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Page Not Found
                    </h2>
                    <p className="text-gray-600 leading-relaxed dark:text-gray-400">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>
            </div>
        </div>
    );
};
