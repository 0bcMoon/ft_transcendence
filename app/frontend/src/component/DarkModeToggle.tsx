import { useState } from 'react';
import { BsSunFill, BsMoonFill } from 'react-icons/bs';

export default function DarkModeToggle() {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(
        () => document.documentElement.classList.contains('dark')
    );

    const toggleTheme = () => {
        const nextTheme = !isDarkMode ? "dark" : "light";
        document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", nextTheme);
        setIsDarkMode(!isDarkMode);
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-200"
            aria-label={isDarkMode ? "Activate light mode" : "Activate dark mode"}>
            {isDarkMode ? (
                <BsSunFill className="w-5 h-5" />
            ) : (
                <BsMoonFill className="w-5 h-5" />
            )}
        </button>
    );
}
