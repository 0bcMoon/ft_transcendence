import { Link } from 'react-router-dom';

// Define the component's props
type ButtonProps = {
    variant?: 'primary' | 'secondary' | 'outline';
    children: React.ReactNode;
    to?: string;
    className?: string;
    onClick?: () => void;
};

// Use simple function syntax
export function Button({ variant = 'primary', children, to, className = '', onClick }: ButtonProps) {
    const baseStyle = "px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 active:scale-95";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]",
        secondary: "bg-white text-slate-950 hover:bg-slate-200",
        outline: "border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white bg-transparent"
    };

    const classes = `${baseStyle} ${variants[variant]} ${className}`;

    // If 'to' prop is provided, render a Link, otherwise a button
    return to ? (
        <Link to={to} className={classes} onClick={onClick}>
            {children}
        </Link>
    ) : (
        <button className={classes} onClick={onClick}>
            {children}
        </button>
    );
}

