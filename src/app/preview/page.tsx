'use client';

import { useEffect, useState } from 'react';
import useSocketDataStore from '@/stores/socketDataStore';
import useData from '@/hooks/useData';
import useModeStore from '@/stores/modeStore';
import { fetchPlaylistById, fetchMode } from '@/lib/api';
import AccidentComponent from '@/features/preview/AccidentComponent';
import InformationComponent from '@/features/preview/InformationComponent';
import PlaylistComponent from '@/features/preview/PlaylistComponent';
import TestComponent from '@/features/preview/TestComponent';
import useStandbyStore from '@/stores/standbyStore';

export default function PreviewPage() {
    const { isConnected } = useData();
    const { socketData } = useSocketDataStore();
    const { mode } = useModeStore();
    const { isStandby } = useStandbyStore();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [playlist, setPlaylist] = useState<any>(null);

    // Comprehensive mode and playlist fetching
    useEffect(() => {
        const fetchCurrentMode = async () => {
            try {
                // Fetch current mode explicitly
                const modeResponse = await fetchMode();
                console.log('Fetched Mode:', modeResponse);

                // If mode is playlist, fetch the playlist
                if (modeResponse.data?.name === 'playlist' && modeResponse.data?.playlist_id) {
                    const playlistResponse = await fetchPlaylistById(modeResponse.data.playlist_id);
                    console.log('Fetched Playlist:', playlistResponse);

                    if (playlistResponse.success) {
                        setPlaylist(playlistResponse.data);
                    }
                }
            } catch (error) {
                console.error('Error fetching mode or playlist:', error);
            }
        };

        // Attempt to fetch mode if WebSocket is not connected
        if (!isConnected) {
            fetchCurrentMode();
        }
    }, [isConnected]);

    // Time update effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Debugging logs
    useEffect(() => {
        console.log('Socket Data:', socketData);
        console.log('Current Mode:', mode);
        console.log('Is Connected:', isConnected);
        console.log('Fetched Playlist:', playlist);
    }, [socketData, mode, isConnected, playlist]);

    // Standby mode
    if (isStandby) {
        return <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }} />;
    }

    // Render based on mode
    const renderContent = () => {
        switch (mode?.name) {
            case 'test':
                return <TestComponent />;
            case 'accident':
                return <AccidentComponent />;
            case 'information':
                return <InformationComponent
                    data={socketData?.data || []}
                    time={currentTime}
                />;
            case 'playlist':
                return playlist ? (
                    <PlaylistComponent playlist={playlist} />
                ) : (
                    <div>Loading playlist...</div>
                );
            default:
                return <div>No active content</div>;
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {renderContent()}
        </div>
    );
}