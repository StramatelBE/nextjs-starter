import { create } from 'zustand';
import { Playlist } from '@prisma/client';

interface PlaylistsState {
    playlists: Playlist[];
    selectedPlaylist: (Playlist & { medias: any[] }) | null;
    setPlaylists: (playlists: Playlist[]) => void;
    addPlaylist: (playlist: Playlist) => void;
    removePlaylist: (id: number) => void;
    updatePlaylistName: (id: number, name: string) => void;
    setSelectedPlaylist: (playlist: (Playlist & { medias: any[] }) | null) => void;
    clearSelectedPlaylist: () => void;
}

const usePlaylistStore = create<PlaylistsState>((set) => ({
    playlists: [],
    selectedPlaylist: null,
    setPlaylists: (playlists) => set({ playlists }),
    addPlaylist: (playlist) =>
        set((state) => ({ playlists: [...state.playlists, playlist] })),
    removePlaylist: (id) =>
        set((state) => ({ playlists: state.playlists.filter((p) => p.id !== id) })),
    updatePlaylistName: (id, name) => {
        set((state) => ({
            playlists: state.playlists.map((playlist) =>
                playlist.id === id ? { ...playlist, name } : playlist
            ),
            selectedPlaylist: state.selectedPlaylist?.id === id
                ? { ...state.selectedPlaylist, name }
                : state.selectedPlaylist
        }));
    },
    setSelectedPlaylist: (playlist) => set({ selectedPlaylist: playlist }),
    clearSelectedPlaylist: () => set({ selectedPlaylist: null }),
}));

export default usePlaylistStore;