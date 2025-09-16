import { User, Request, PendingRequest, BlockedUser } from '../types/User';

// Mock API functions - replace with actual API calls
export const api = {
    // Friends
    getFriends: async (): Promise<User[]> => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return [
            {
                id: 1,
                display_name: 'Sarah Johnson',
                profile_picture: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
                username: 'hihihi',
            },
            {
                id: 2,
                display_name: 'Michael Chen',
                profile_picture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
                username: 'hihihi',
            },
            {
                id: 3,
                display_name: 'Emma Davis',
                profile_picture: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
                username: 'hihihi',
            },
            {
                id: 4,
                display_name: 'David Wilson',
                profile_picture: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=400',
                username: 'hihihi',
            },
            {
                id: 5,
                display_name: 'Lisa Anderson',
                profile_picture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
                username: 'hihihi',
            },
        ];
    },

    // Search Users
    searchUsers: async (_: string): Promise<User[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));

        return [];
    },

    // Friend Requests
    getFriendRequests: async (): Promise<Request[]> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return [
            {
                id: 11,
                display_name: 'Oliver Smith',
                profile_picture: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
                username: 'hihh',
                requestDate: '2024-01-15',
            },
            {
                id: 12,
                display_name: 'Sophia Brown',
                profile_picture: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400',
                username: 'hihh',
                requestDate: '2024-01-14',
            },
            {
                id: 13,
                display_name: 'Ryan Miller',
                profile_picture: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
                username: 'hihh',
                requestDate: '2024-01-13',
            },
        ];
    },

    // Pending Requests
    getPendingRequests: async (): Promise<PendingRequest[]> => {
        await new Promise(resolve => setTimeout(resolve, 350));
        return [
            {
                id: 14,
                display_name: 'Isabella Garcia',
                profile_picture: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400',
                username: 'hihh',
                requestDate: '2024-01-12',
            },
            {
                id: 15,
                display_name: 'Lucas Taylor',
                profile_picture: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
                username: 'hihh',
                requestDate: '2024-01-11',
            },
        ];
    },

    // Blocked Users
    getBlockedUsers: async (): Promise<BlockedUser[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            {
                id: 16,
                username: 'hi',
                display_name: 'John Doe',
                profile_picture: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=400',
                blockedDate: '2024-01-10',
                reason: 'Inappropriate behavior',
            },
            {
                id: 17,
                display_name: 'Jane Smith',
                username: 'hi',
                profile_picture: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=400',
                blockedDate: '2024-01-08',
                reason: 'Spam messages',
            },
        ];
    },

    // Actions
    unfriendUser: async (userId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('Unfriended user:', userId);
    },

    blockUser: async (userId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('Blocked user:', userId);
    },

    unblockUser: async (userId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('Unblocked user:', userId);
    },

    sendFriendRequest: async (userId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('Sent friend request to:', userId);
    },

    acceptFriendRequest: async (userId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('Accepted friend request from:', userId);
    },

    declineFriendRequest: async (userId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('Declined friend request from:', userId);
    },

    cancelFriendRequest: async (userId: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('Cancelled friend request to:', userId);
    },
};
