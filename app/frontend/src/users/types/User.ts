import { RemoteUser } from "@/types/types";


export interface Request extends RemoteUser {
    req_id: number;
    created_at: string;
}


export interface BlockedUser extends RemoteUser {
    block_id: number;
    created_at: string;
}
