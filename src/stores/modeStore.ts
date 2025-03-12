import { create } from 'zustand';
import { Mode } from '@prisma/client';

interface ModeState {
    mode: Mode | null;
    setMode: (mode: Mode) => void;
}

const useModeStore = create<ModeState>((set) => ({
    mode: null,
    setMode: (mode) => set({ mode }),
}));

export default useModeStore;