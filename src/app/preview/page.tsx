'use client';

import { useEffect, useState } from 'react';
import useSocketDataStore from '@/stores/socketDataStore';
import useData from '@/hooks/useData';
import AccidentComponent from '@/features/preview/AccidentComponent';
import InformationComponent from '@/features/preview/InformationComponent';
import PlaylistComponent from '@/features/preview/PlaylistComponent';
import TestComponent from '@/features/preview/TestComponent';
import useStandbyStore from '@/stores/standbyStore';

// Global styles for preview page
const globalStyle = `
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }
`;

export default function PreviewPage() {
    const { isConnected } = useData(); // Initialize the WebSocket connection
    const { socketData } = useSocketDataStore();
    const { isStandby } = useStandbyStore();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [connectionError, setConnectionError] = useState(false);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Check connection status
    useEffect(() => {
        // If no data after 5 seconds, show error
        const timeout = setTimeout(() => {
            if (!socketData) {
                setConnectionError(true);
            }
        }, 5000);

        // Clear connection error if data arrives
        if (socketData) {
            setConnectionError(false);
        }

        return () => clearTimeout(timeout);
    }, [socketData]);

    // Auto-reload on prolonged connection failure
    useEffect(() => {
        let reloadTimer: NodeJS.Timeout | null = null;

        if (connectionError) {
            // Reload page after 30 seconds of connection error
            reloadTimer = setTimeout(() => {
                window.location.reload();
            }, 30000);
        }

        return () => {
            if (reloadTimer) clearTimeout(reloadTimer);
        };
    }, [connectionError]);

    // Standby mode - show blank screen
    if (isStandby) {
        return (
            <>
                <style>{globalStyle}</style>
                <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}></div>
            </>
        );
    }

    // Connection error or loading
    if (!socketData) {
        return (
            <>
                <style>{globalStyle}</style>
                <div style={{
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: '#172228',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    fontFamily: 'sans-serif',
                    fontSize: '24px'
                }}>
                    {connectionError ? 'Connection error. Retrying...' : 'Loading data...'}
                </div>
            </>
        );
    }

    // Render content based on mode
    return (
        <>
            <style>{globalStyle}</style>
            {socketData.mode?.name === 'test' && <TestComponent />}
            {socketData.mode?.name === 'accident' && <AccidentComponent />}
            {socketData.mode?.name === 'information' && <InformationComponent data={socketData.data} time={currentTime} />}
            {socketData.mode?.name === 'playlist' && socketData.playlist && (
                <PlaylistComponent playlist={socketData.playlist} />
            )}
        </>
    );
}