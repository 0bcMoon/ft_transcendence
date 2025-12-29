/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Nunito', ...defaultTheme.fontFamily.sans],
                "display": ["Space Grotesk", "sans-serif"],
            },
            colors: {
                "primary": "#2b8cee",
                "background-light": "#f6f7f8",
                "background-dark": "#101922",
            },
            animation: {
                'loader-paddle-left': 'loader-paddle-left 1s ease-in-out infinite alternate',
                'loader-paddle-right': 'loader-paddle-right 2s ease-in-out infinite alternate-reverse',
                'loader-ball': 'loader-ball 2s linear infinite',
                'loader-pulse': 'loader-pulse 1.5s ease-in-out infinite',
            },
            keyframes: {
                'shake': {
                    '10%, 90%': { translate: '-1px 0' },
                    '20%, 80%': { translate: '2px 0' },
                    '30%, 50%, 70%': { translate: '-4px 0' },
                    '40%, 60%': { translate: '4px 0' }
                },
                'bounce-x': {
                    '0%, 100%': { transform: 'translateX(-180px)' },
                    '50%': { transform: 'translateX(180px)' },
                },
                'loader-paddle-left': {
                    '0%': { top: '20px' },
                    '100%': { top: '100px' },
                },
                'loader-paddle-right': {
                    '0%': { top: '40px' },
                    '100%': { top: '80px' },
                },
                'loader-ball': {
                    '0%': { top: '40px', left: '45px' },
                    '25%': { top: '100px', left: '50%' },
                    '50%': { top: '80px', left: '245px' },
                    '75%': { top: '30px', left: '50%' },
                    '100%': { top: '40px', left: '45px' },
                },
                'loader-pulse': {
                    '0%, 100%': {
                        transform: 'scale(0.8)',
                        opacity: '0.5',
                        boxShadow: '0 0 0 rgba(148, 163, 184, 0)'
                    },
                    '50%': {
                        transform: 'scale(1.2)',
                        opacity: '1',
                        boxShadow: '0 0 10px rgba(148, 163, 184, 0.8)'
                    },
                }
            },
        },
    },
    plugins: [],
}
