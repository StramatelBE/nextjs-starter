import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Mode } from '@prisma/client';

interface ModeState {
    mode: Mode | null;
    setMode: (mode: Mode) => void;
    playlistId: number | null;
    setPlaylistId: (id: number | null) => void;
}

const useModeStore = create<ModeState>()(
    persist(
        (set) => ({
            mode: null,
            playlistId: null,
            setMode: (mode) => set({ mode }),
            setPlaylistId: (playlistId) => set({ playlistId }),
        }),
        {
            name: 'mode-storage',
        }
    )
);

export default useModeStore;