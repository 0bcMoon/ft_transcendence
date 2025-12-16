export interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'outline';
    children: React.ReactNode;
    to?: string;
    className?: string;
}

export interface FeatureBoxProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
}

export interface GameModeCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
    color: string;
}
