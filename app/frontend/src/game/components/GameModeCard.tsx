import React from "react";
import { Link } from "react-router-dom";

export interface GameModeCardProps {
    to: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}

export const GameModeCard = ({ to, icon, title, description }: GameModeCardProps) => {
    return (
        <Link
            to={to}
            className="block w-full p-4 bg-white dark:bg-gray-800 rounded-2xl 
                hover:shadow-md transition-shadow duration-200
                border-2 border-transparent hover:border-gray-900 dark:hover:border-white"
        >
            <div className="flex flex-col items-center text-center gap-4">
                <div className="text-gray-900 dark:text-white">{icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
        </Link>
    );
};
