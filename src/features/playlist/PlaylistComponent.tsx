import { useEffect } from 'react';
import usePlaylistStore from "@/stores/playlistStore";
import PlaylistListComponent from "./PlaylistListComponent";
import PlaylistDetailsComponent from "./PlaylistDetailsComponent";
import { fetchPlaylists } from '@/lib/api';

export default function PlaylistComponent() {
    const { selectedPlaylist, setPlaylists } = usePlaylistStore();

    // Load playlists on component mount
    useEffect(() => {
        const loadPlaylists = async () => {
            try {
                const response = await fetchPlaylists();
                if (response.success && response.data) {
                    setPlaylists(response.data);
                }
            } catch (error) {
                console.error('Failed to load playlists:', error);
            }
        };

        loadPlaylists();
    }, [setPlaylists]);

    return (
        <div>
            {selectedPlaylist ? (
                <PlaylistDetailsComponent />
            ) : (
                <PlaylistListComponent />
            )}
        </div>
    );
}