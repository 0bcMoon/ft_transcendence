import { useState, useEffect } from 'react';

export const useDarkMode = () => {
    const [darkMode, setDarkMode] = useState(() => {
        // Check localStorage first
        if (localStorage.theme === 'dark') {
            return true;
        }
        if (localStorage.theme === 'light') {
            return false;
        }
        // Fall back to system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const root = document.documentElement;

        if (darkMode) {
            root.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            root.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [darkMode]);

    const toggle = () => setDarkMode(!darkMode);

    return { darkMode, toggle };
};

