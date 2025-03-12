'use client';

import React, { useState, useEffect } from 'react';
import { Media, Playlist } from '@prisma/client';

// Define types more specifically
type MediaType = 'image' | 'video' | 'accident' | 'information';

interface EnhancedMedia extends Media {
    type: MediaType;
}

interface EnhancedPlaylist extends Playlist {
    isPlaying: boolean;
}

export default function PlaylistManagementSystem() {
    // Mock data with more type safety
    const [playlists, setPlaylists] = useState<EnhancedPlaylist[]>([
        { id: 1, name: 'Welcome Screen', isPlaying: true, user_id: 1 },
        { id: 2, name: 'Safety Information', isPlaying: false, user_id: 1 },
        { id: 3, name: 'Factory Tour', isPlaying: false, user_id: 1 }
    ]);

    const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);
    const [mediaItems, setMediaItems] = useState<EnhancedMedia[]>([
        {
            id: 1,
            playlistId: 1,
            type: 'image',
            original_file_name: 'Company Logo',
            duration: 10,
            position: 0,
            file_name: '',
            path: '',
            format: '',
            size: 0,
            uploaded_at: new Date(),
            user_id: 1
        },
        // ... rest of your media items with complete Media interface
    ]);

    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [previewMode, setPreviewMode] = useState(true);

    // Get media items for the selected playlist
    const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
    const selectedMediaItems = mediaItems
        .filter(m => m.playlistId === selectedPlaylistId)
        .sort((a, b) => a.position - b.position);

    // Get the playing playlist and its media
    const playingPlaylist = playlists.find(p => p.isPlaying);
    const playingMediaItems = playingPlaylist
        ? mediaItems
            .filter(m => m.playlistId === playingPlaylist.id)
            .sort((a, b) => a.position - b.position)
        : [];

    // Media playback control effect
    useEffect(() => {
        if (!playingPlaylist || playingMediaItems.length === 0) return;

        const interval = setInterval(() => {
            setCurrentMediaIndex(prev => (prev + 1) % playingMediaItems.length);
        }, 5000); // 5-second interval for media rotation

        return () => clearInterval(interval);
    }, [playingPlaylist, playingMediaItems.length]);

    // Handle selecting a playlist
    const handleSelectPlaylist = (id: number) => {
        setSelectedPlaylistId(id);
    };

    // Handle toggling play/stop for a playlist
    const handleTogglePlay = (id: number) => {
        setPlaylists(playlists.map(p => ({
            ...p,
            isPlaying: p.id === id ? !p.isPlaying : false
        })));
        setCurrentMediaIndex(0);
    };

    // Handle reordering media items
    const handleMoveMedia = (id: number, direction: 'up' | 'down') => {
        const mediaIndex = selectedMediaItems.findIndex(m => m.id === id);
        if (
            (direction === 'up' && mediaIndex === 0) ||
            (direction === 'down' && mediaIndex === selectedMediaItems.length - 1)
        ) {
            return; // Cannot move further
        }

        const newItems = [...mediaItems];
        const swapIndex = direction === 'up' ? mediaIndex - 1 : mediaIndex + 1;

        // Exchange positions
        const currentPosition = newItems.find(m => m.id === selectedMediaItems[mediaIndex].id)!.position;
        newItems.find(m => m.id === selectedMediaItems[mediaIndex].id)!.position =
            newItems.find(m => m.id === selectedMediaItems[swapIndex].id)!.position;
        newItems.find(m => m.id === selectedMediaItems[swapIndex].id)!.position = currentPosition;

        setMediaItems(newItems);
    };

    // Render current media (simplified for brevity)
    const renderCurrentMedia = () => {
        if (!playingPlaylist || playingMediaItems.length === 0) {
            return <div className="text-center p-4">No playlist is currently playing</div>;
        }

        const currentMedia = playingMediaItems[currentMediaIndex];

        // Implement renderCurrentMedia logic here
        return <div>{currentMedia.original_file_name}</div>;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Your existing UI components */}
            <div className="flex flex-1 gap-4">
                {/* Playlist, Media List, and Preview columns */}
                <div className="w-1/4 bg-white rounded-lg shadow p-4">
                    {/* Playlist list */}
                </div>

                <div className="w-1/3 bg-white rounded-lg shadow p-4">
                    {/* Media list */}
                </div>

                <div className="w-5/12 bg-white rounded-lg shadow p-4">
                    {/* Preview */}
                    {renderCurrentMedia()}
                </div>
            </div>
        </div>
    );
}