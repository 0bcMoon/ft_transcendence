import { create } from 'zustand';



interface StoreState {
    swap: boolean;
    setSwap: (state: boolean) => void;
}


export const useSwapStore = create<StoreState>((set) => ({
    swap: false,
    setSwap: (state: boolean) => set({ swap: state }),
}));

