'use client';

import { useEffect, useRef, useState } from 'react';
import AccidentComponent from './AccidentComponent';
import InformationComponent from './InformationComponent';
import useSocketDataStore from '@/stores/socketDataStore';

interface PlaylistComponentProps {
    playlist: any; // Replace with proper type
}

export default function PlaylistComponent({ playlist }: PlaylistComponentProps) {
    const { socketData } = useSocketDataStore();
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second for information component
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Sort medias by position
    const sortedMedias = playlist.medias?.sort((a: any, b: any) => a.position - b.position) || [];

    useEffect(() => {
        if (sortedMedias.length === 0) return;

        const currentMedia = sortedMedias[currentMediaIndex];
        if (!currentMedia) return;

        const duration = currentMedia.duration * 1000;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % sortedMedias.length);
        }, duration);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [currentMediaIndex, sortedMedias]);

    if (sortedMedias.length === 0) {
        return <div>No media in playlist</div>;
    }

    const currentMedia = sortedMedias[currentMediaIndex];
    if (!currentMedia) return null;

    // Preview URL from environment or config
    const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL || '';
    const mediaPath = `${previewUrl}${currentMedia?.path}`;

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            {currentMedia?.type === "video" ? (
                <video
                    className="medias"
                    src={mediaPath}
                    onError={() =>
                        setCurrentMediaIndex(
                            (prevIndex) => (prevIndex + 1) % sortedMedias.length
                        )
                    }
                    autoPlay
                    muted
                    loop
                    preload="auto"
                />
            ) : currentMedia?.type === "image" ? (
                <img
                    className="medias"
                    src={mediaPath}
                    onError={() =>
                        setCurrentMediaIndex(
                            (prevIndex) => (prevIndex + 1) % sortedMedias.length
                        )
                    }
                    alt={currentMedia?.original_file_name}
                />
            ) : currentMedia?.type === "accident" ? (
                <AccidentComponent />
            ) : currentMedia?.type === "information" ? (
                <InformationComponent data={socketData?.data || []} time={currentTime} />
            ) : null}
        </div>
    );
}