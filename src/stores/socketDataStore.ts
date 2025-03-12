import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Accident, Data, Mode, Playlist, Settings } from '@prisma/client';

export interface SocketData {
    mode: Mode;
    data: Data[];
    accident: Accident;
    settings: Settings;
    playlist?: Playlist & { medias: any[] };  // Add proper Media type when needed
}

interface SocketDataState {
    socketData: SocketData | null;
    setSocketData: (data: SocketData) => void;
    clearSocketData: () => void;
}

export const useSocketDataStore = create<SocketDataState>()(
    persist(
        (set) => ({
            socketData: null,
            setSocketData: (data) => set({ socketData: data }),
            clearSocketData: () => set({ socketData: null }),
        }),
        {
            name: 'socket-data-storage',
        }
    )
);

export default useSocketDataStore;