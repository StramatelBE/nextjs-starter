'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import useAuthStore from '@/stores/authStore';
import useData from '@/hooks/useData';
import AccidentPreviewTest from '@/features/accident/AccidentPreviewTest';
import { Box, Typography } from '@mui/material';

export default function AccidentTestPage() {
    const { isConnected } = useData(); // Initialize WebSocket connection
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    // Initialize WebSocket connection
    useData();
    // Check auth
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="mainContainer">
            <Header />
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>Accident Display Tester</Typography>
                <Typography variant="body1">
                    Use this tool to test and visualize how the accident display will look with different values.
                </Typography>
            </Box>
            <AccidentPreviewTest />
            <Footer />
        </div>
    );
}