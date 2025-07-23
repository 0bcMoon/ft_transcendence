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

