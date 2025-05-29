
const NotFound = () => {

    return (
        <div className="col-span-12  bg-white flex items-center justify-center">
            <div className="text-center space-y-8 max-w-md mx-auto px-6">
                {/* Large 404 Number */}
                <div className="space-y-4">
                    <h1 className="text-9xl font-black text-black tracking-tight">
                        404
                    </h1>
                    <div className="w-24 h-1 bg-gray-900 mx-auto"></div>
                </div>

                {/* Error Message */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Page Not Found
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
