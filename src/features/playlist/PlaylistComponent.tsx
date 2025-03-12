'use client';

import usePlaylistStore from "@/stores/playlistStore";
import PlaylistListComponent from "./PlaylistListComponent";
import PlaylistDetailsComponent from "./PlaylistDetailsComponent";

export default function PlaylistComponent() {
    const { selectedPlaylist } = usePlaylistStore();

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