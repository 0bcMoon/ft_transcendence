export interface CurrentUser {
    id: number,
    username: string,
    display_name: string,
    email: string,
    profile_picture: string | null,
    oauth_type: 'local' | 'google' | 'intra42';
    two_factor_enabled: boolean;
}


type RelationshipStatus = 'friend' | 'pending' | "waiting" | 'blocking' | 'blocked_by' | 'none';

export interface RemoteUser {
    id: number;
    display_name: string;
    req_id?: number ;
    relation_status: RelationshipStatus
    username?: string;
    profile_picture?: string;
    last_seen?: Date | string;
}
