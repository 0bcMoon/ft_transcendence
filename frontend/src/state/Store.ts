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
    display_name: string;
    profile_image: string,
    setChat?: ({ display_name, profile_image}: ChatStoreState) => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
    display_name: '',
    profile_image: '',
    setChat: ({ display_name, profile_image}: ChatStoreState) =>
        set({ display_name, profile_image}),
}));




interface WebSocketStoreState {
    ws: WebSocket | null;
    setWebSocket: (ws: WebSocket | null) => void;

}


export const useWebSocketStore = create<WebSocketStoreState>((set) => ({
    ws: null,
    setWebSocket: (ws: WebSocket | null) => set({ ws }),
}));
