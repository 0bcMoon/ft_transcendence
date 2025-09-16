import api from '@/api/api';
import { useQuery } from '@tanstack/react-query';
import { Request } from '../types/User';
import { RemoteUser } from '@/types/types';



// Query keys
export const queryKeys = {
    friends: ['friends'],
    friendRequests: ['friendRequests'],
    pendingRequests: ['pendingRequests'],
    blockedUsers: ['blockedUsers'],
    searchUsers: (query: string) => ['searchUsers', query],
};

// Friends
export const useFriends = () => {
    return useQuery<RemoteUser[]>({
        queryKey: queryKeys.friends,
        queryFn: async () => {
            const response = await api.get('/user/friends');
            return response.data;
        },
    });
};

// Search Users
export const useSearchUsers = (search : string) => {
    search = search.trim();
    return useQuery<RemoteUser[]>({
        queryKey: ['searchUsers', search],
        queryFn: async () => {
            const response = await api.get('/users', {
                params: {
                    search: search
                }
            });
            return response.data;
        },
        enabled: search.length > 0, // Only run the query if search term is not empty
    });
};

// Friend Requests
export const useFriendRequests = () => {
    return useQuery<Request[]>({
        queryKey: queryKeys.friendRequests,
        queryFn: async () => {
            const response = await api.get('/user/friend-requests', { params: { type: 'received' } });
            return response.data;
        },
    });
};

// Pending Requests
export const usePendingRequests = () => {
    return useQuery<Request[]>({
        queryKey: queryKeys.pendingRequests,
        queryFn: async () => {
            const response = await api.get('/user/friend-requests', { params: { type: 'pending' } });
            return response.data;
        },
    });
};

// Blocked Users
export const useBlockedUsers = () => {
    return useQuery<RemoteUser[]>({
        queryKey: queryKeys.blockedUsers,
        queryFn: async () => {
            const response = await api.get('/user/block');
            return response.data;
        },
    });
};

