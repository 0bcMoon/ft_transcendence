import { Link } from "react-router-dom";
import { Trophy, ArrowLeft } from "lucide-react";

export default function Tournament() {
    return (
        <div className="col-span-13 flex items-center justify-center w-full h-full bg-linear-to-br from-gray-50 to-blue-50 px-4 py-8">
            <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-100 p-6">

                <div className="flex justify-end mb-6">
                    <Link
                        to="/"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded-lg transition-all flex items-center" >
                        <ArrowLeft size={18} className="mr-2" />
                        Home
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Trophy size={32} className="text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Tournaments</h1>
                </div>

                <div className="space-y-3">
                    {/* <Link */}
                    {/*     to="/game/tournament/create" */}
                    {/*     className="block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white" > */}
                    {/*     Create Tournament */}
                    {/* </Link> */}

                    <Link
                        to="/game/tournament/list"
                        className="block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700" >
                        Join Tournament
                    </Link>
                </div>
            </div>
        </div>
    );
}
