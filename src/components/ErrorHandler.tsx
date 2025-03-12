'use client';

import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorHandlerProps {
    children: React.ReactNode;
}

interface ErrorState {
    hasError: boolean;
    message: string;
    retry?: () => void;
}

export default function ErrorHandler({ children }: ErrorHandlerProps) {
    const [error, setError] = useState<ErrorState>({
        hasError: false,
        message: '',
    });
    const [openSnackbar, setOpenSnackbar] = useState(false);

    // Create a global error handler
    useEffect(() => {
        // Handle WebSocket errors
        const handleWebSocketError = (event: Event) => {
            setError({
                hasError: true,
                message: 'Connection to the server lost. Please check your network.',
                retry: () => window.location.reload(),
            });
            setOpenSnackbar(true);
        };

        // Handle fetch errors
        const handleFetchError = (event: ErrorEvent) => {
            if (event.message.includes('fetch') || event.message.includes('network')) {
                setError({
                    hasError: true,
                    message: 'Failed to fetch data from server. Please check your connection.',
                    retry: () => window.location.reload(),
                });
                setOpenSnackbar(true);
            }
        };

        // Add event listeners
        window.addEventListener('error', handleFetchError);
        window.addEventListener('websocketerror', handleWebSocketError as EventListener);

        // Clean up
        return () => {
            window.removeEventListener('error', handleFetchError);
            window.removeEventListener('websocketerror', handleWebSocketError as EventListener);
        };
    }, []);

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const handleRetry = () => {
        if (error.retry) {
            error.retry();
        }
        setOpenSnackbar(false);
    };

    return (
        <>
            {children}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="error"
                    sx={{ width: '100%' }}
                    action={
                        <Button color="inherit" size="small" onClick={handleRetry} startIcon={<RefreshIcon />}>
                            Retry
                        </Button>
                    }
                >
                    {error.message}
                </Alert>
            </Snackbar>
        </>
    );
}