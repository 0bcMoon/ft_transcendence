export interface User {
    id: number,
    username: string,
    display_name: string,
    email: string,
    profile_picture: string | null,
    oauth_type: 'local' | 'google' | 'intra42';
    two_factor_enabled: boolean;
}

