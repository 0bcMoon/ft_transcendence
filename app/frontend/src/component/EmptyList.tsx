const EmptyList = ({ message }: { message: string }) => {
    return (
        <div className="col-span-12 bg-white flex items-center justify-center py-20">
            <div className="text-center space-y-8 max-w-md mx-auto px-6">
                {/* Sad Face Icon */}
                <div className="space-y-4">
                    <svg
                        className="w-48 h-48 mx-auto text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 14l-2-2m0 0l2-2m-2 2h6m2 0l2-2m0 0l-2-2m2 2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2z"
                        />
                    </svg>
                    <div className="w-48 h-1 bg-gray-900 mx-auto"></div>
                </div>

                {/* Error Message */}
                <div className="space-y-4">
                    <p className="text-gray-600 leading-relaxed text-xl">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default EmptyList;
