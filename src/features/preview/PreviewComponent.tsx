import React, { useEffect, useState } from 'react';
import VideoLabelIcon from "@mui/icons-material/VideoLabel";
import Container from '@/components/Container';
import useSocketDataStore from '@/stores/socketDataStore';
import AccidentComponent from '@/features/preview/AccidentComponent';
import InformationComponent from '@/features/preview/InformationComponent';
import PlaylistComponent from '@/features/preview/PlaylistComponent';
import TestComponent from '@/features/preview/TestComponent';
import useStandbyStore from '@/stores/standbyStore';
import { CircularProgress, Typography } from '@mui/material';

export default function PreviewComponent() {
    const { socketData } = useSocketDataStore();
    const { isStandby } = useStandbyStore();
    const [currentTime, setCurrentTime] = useState(new Date());
    const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL || 'http://localhost:3000/preview';
    const previewWidth = process.env.NEXT_PUBLIC_PREVIEW_WIDTH || '800';
    const previewHeight = process.env.NEXT_PUBLIC_PREVIEW_HEIGHT || '600';

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Determine what to display in the preview
    const renderPreviewContent = () => {
        if (isStandby) {
            return (
                <Typography variant="h5" align="center">
                    En veille
                </Typography>
            );
        }

        if (!socketData) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ ml: 2 }}>
                        Chargement des données...
                    </Typography>
                </div>
            );
        }

        // Determine which component to show based on mode
        const { mode } = socketData;

        // Render appropriately based on the current mode
        if (mode?.name === 'accident') {
            return (
                <div style={{ border: '1px solid #ccc', height: `${previewHeight}px`, width: `${previewWidth}px` }}>
                    <AccidentComponent />
                </div>
            );
        } else if (mode?.name === 'information') {
            return (
                <div style={{ border: '1px solid #ccc', height: `${previewHeight}px`, width: `${previewWidth}px` }}>
                    <InformationComponent data={socketData.data} time={currentTime} />
                </div>
            );
        } else if (mode?.name === 'playlist' && socketData.playlist) {
            return (
                <div style={{ border: '1px solid #ccc', height: `${previewHeight}px`, width: `${previewWidth}px` }}>
                    <PlaylistComponent playlist={socketData.playlist} />
                </div>
            );
        } else if (mode?.name === 'test') {
            return (
                <div style={{ border: '1px solid #ccc', height: `${previewHeight}px`, width: `${previewWidth}px` }}>
                    <TestComponent />
                </div>
            );
        } else {
            // Default view - either use iframe or show a placeholder
            return (
                <iframe
                    src={previewUrl}
                    title="Preview"
                    style={{
                        border: "none",
                        height: `${previewHeight}px`,
                        width: `${previewWidth}px`,
                    }}
                />
            );
        }
    };

    return (
        <Container
            icon={<VideoLabelIcon sx={{ color: "primary.light" }} />}
            title="Preview"
            content={renderPreviewContent()}
        />
    );
}