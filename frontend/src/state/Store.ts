import { Chat } from '@/chat/types';
import { User } from '@/types/types';
import { create } from 'zustand';


interface ActiveChatState {
    activeChat?: Chat
    setActiveChat: (chat: Chat) => void;
}

export const useActiveChatStore = create<ActiveChatState>((set) => ({
    activeChat: undefined,
    setActiveChat: (chat: Chat) => set({ activeChat: chat }),
}));




interface SearchStoreState {
    searchQuery: string;
    setSearchQuery: (option: string) => void;
}


export const useSearchStore = create<SearchStoreState>((set) => ({
    searchQuery: '',
    setSearchQuery: (option: string) => set({ searchQuery: option }),
}));

enum UsersOptionEnum {
    FindNewFriends = "Search For Users",
    Friends = "Friends",
    FriendsRequest = "Friends Request",
    Blocked = "Blocked"
}



interface UsersOptionState {
    usersOption: UsersOptionEnum;
    setUsersOption: (option: UsersOptionEnum) => void;

}

export const useUsersOption = create<UsersOptionState>((set) => ({
    usersOption: UsersOptionEnum.FindNewFriends,
    setUsersOption: (option: UsersOptionEnum) => set({ usersOption: option })
}));


export interface ValidationErrors {
    current_password?: string,
    new_password?: string,
    confirm_password?: string,
    display_name?: string;
    profile_picture?: string;
    username?: string;
    setDisplayNameError: (error: string) => void
    setCurrentPasswordError: (error: string) => void
    setNewPasswordError: (error: string) => void
    setConfirmPasswordError: (error: string) => void
    setProfilePictureError: (error: string) => void
    setUsernameError: (error: string) => void
    clearErrors: () => void;
}



export const useValidationStore = create<ValidationErrors>((set) => ({
    current_password: undefined,
    new_password: undefined,
    confirm_password: undefined,
    display_name: undefined,
    profile_picture: undefined,
    username: undefined,
    setDisplayNameError: (error: string) => set({ display_name: error }),

    setCurrentPasswordError: (error: string) => set({ current_password: error }),
    setNewPasswordError: (error: string) => set({ new_password: error }),
    setConfirmPasswordError: (error: string) => set({ confirm_password: error }),
    setProfilePictureError: (error: string) => set({ profile_picture: error }),
    setUsernameError: (error: string) => set({ username: error }),
    clearErrors: () => set({
        current_password: undefined,
        new_password: undefined,
        confirm_password: undefined,
        display_name: undefined,
        profile_picture: undefined,
        username: undefined
    }),
}));




export interface UserState {
    user: User | null;
    setUser: (user: User | null) => void;
}


export const useUserStore = create<UserState>((set) => ({
    user: null,
    setUser: (user: User | null) => set({ user }),
}));

export interface EmailUpdate {
    setEmail: (email: string) => void;
    setConfirmationCode: (code: string) => void;
    setConfirmationSent: (sent: boolean) => void;

    email: string;
    confirmation_code?: string; // Optional, used when confirming the new email:
    confirmation_sent: boolean; // Indicates if the confirmation code has been sent
}

export const useChangeEmail = create<EmailUpdate>((set) => ({
    email: '',
    confirmation_sent: false,
    setEmail: (email: string) => set({ email }),
    setConfirmationCode: (code: string) => set({ confirmation_code: code }),
    setConfirmationSent: (sent: boolean) => set({ confirmation_sent: sent })

}))
