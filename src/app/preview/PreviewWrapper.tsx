'use client';

import { useEffect, useState } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import useSocketDataStore from '@/stores/socketDataStore';
import useData from '@/hooks/useData';
import useStandbyStore from '@/stores/standbyStore';
import AccidentComponent from '@/features/preview/AccidentComponent';
import InformationComponent from '@/features/preview/InformationComponent';
import PlaylistComponent from '@/features/preview/PlaylistComponent';
import TestComponent from '@/features/preview/TestComponent';

export default function PreviewWrapper() {
    const { isConnected } = useData(); // Initialize WebSocket connection
    const { socketData } = useSocketDataStore();
    const { isStandby } = useStandbyStore();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [connectionError, setConnectionError] = useState(false);
    const [connectionAttempts, setConnectionAttempts] = useState(0);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Monitor connection status
    useEffect(() => {
        let connectionTimeout: NodeJS.Timeout;

        if (!isConnected && connectionAttempts < 5) {
            // Wait for connection or timeout after 5 seconds
            connectionTimeout = setTimeout(() => {
                setConnectionError(true);
                setConnectionAttempts(prev => prev + 1);
            }, 5000);
        } else if (isConnected) {
            setConnectionError(false);
            setConnectionAttempts(0);
        }

        return () => {
            if (connectionTimeout) clearTimeout(connectionTimeout);
        };
    }, [isConnected, connectionAttempts]);

    // Handle connection error with retry mechanism
    if (connectionError && connectionAttempts >= 5) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100vw',
                    backgroundColor: '#f5f5f5',
                    padding: 3,
                    textAlign: 'center'
                }}
            >
                <Typography variant="h5" color="error" gutterBottom>
                    Connection Error
                </Typography>
                <Typography variant="body1" paragraph>
                    Unable to connect to the server. The preview will automatically refresh in 30 seconds.
                </Typography>
                <CircularProgress />

                {/* Auto-refresh the page after 30 seconds */}
                <Box sx={{ display: 'none' }}>
                    s{setTimeout(() => window.location.reload(), 30000)}
                </Box>
            </Box>
        );
    }

    // Loading state
    if (!socketData) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100vw',
                    backgroundColor: '#f5f5f5'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // Standby state - black screen
    if (isStandby) {
        return (
            <Box
                sx={{
                    height: '100vh',
                    width: '100vw',
                    backgroundColor: '#000000'
                }}
            />
        );
    }

    // Determine what to display based on mode
    const { mode } = socketData;

    if (mode?.name === 'test') {
        return <TestComponent />;
    } else if (mode?.name === 'accident') {
        return <AccidentComponent />;
    } else if (mode?.name === 'information') {
        return <InformationComponent data={socketData.data} time={currentTime} />;
    } else if (mode?.name === 'playlist' && socketData.playlist) {
        return <PlaylistComponent playlist={socketData.playlist} />;
    } else {
        // Default/fallback view
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100vw',
                    backgroundColor: '#f5f5f5'
                }}
            >
                <Typography variant="h5">
                    Waiting for content...
                </Typography>
            </Box>
        );
    }
}