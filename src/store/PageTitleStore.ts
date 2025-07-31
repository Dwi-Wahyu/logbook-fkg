import { create } from "zustand";

interface CounterState {
  count: number;
  increment: () => void;
}

const usePageTitleStore = create<CounterState>((set, get) => ({
  count: 0,
  increment: () => set({ count: get().count + 1 }),
}));

export default usePageTitleStore;
