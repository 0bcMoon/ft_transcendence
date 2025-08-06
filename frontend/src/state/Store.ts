import { User } from '@/types/types';
import { create } from 'zustand';



interface SwapStoreState {
    swap: boolean;
    setSwap: (state: boolean) => void;
}


export const useSwapStore = create<SwapStoreState>((set) => ({
    swap: false,
    setSwap: (state: boolean) => set({ swap: state }),
}));


interface ChatStoreState {
    display_name: string | undefined;
    profile_image: string,
    id?: number;
    setChat?: ({ display_name, profile_image }: ChatStoreState) => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
    id: undefined,
    display_name: undefined,
    profile_image: '',
    setChat: ({ display_name, profile_image }: ChatStoreState) =>
        set({ display_name, profile_image }),
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

    setDisplayNameError: (error: string) => void
    setCurrentPasswordError: (error: string) => void
    setNewPasswordError: (error: string) => void
    setConfirmPasswordError: (error: string) => void
    setProfilePictureError: (error: string) => void
    clearErrors: () => void;
}



export const useValidationStore = create<ValidationErrors>((set) => ({
    current_password: undefined,
    new_password: undefined,
    confirm_password: undefined,
    display_name: undefined,
    profile_picture: undefined,

    setDisplayNameError: (error: string) => set({ display_name: error }),
    setCurrentPasswordError: (error: string) => set({ current_password: error }),
    setNewPasswordError: (error: string) => set({ new_password: error }),
    setConfirmPasswordError: (error: string) => set({ confirm_password: error }),
    setProfilePictureError: (error: string) => set({ profile_picture: error }),
    clearErrors: () => set({
        current_password: undefined,
        new_password: undefined,
        confirm_password: undefined,
        display_name: undefined,
        profile_picture: undefined
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
