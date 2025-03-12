'use client';

import { useEffect, useRef, useState } from 'react';
import AccidentComponent from './AccidentComponent';
import InformationComponent from './InformationComponent';
import useSocketDataStore from '@/stores/socketDataStore';
import {Playlist} from "@prisma/client";

interface PlaylistComponentProps {
    playlist: any; // Replace with proper type
}
export default function PlaylistComponent({ playlist }: { playlist: Playlist & { medias: any[] } }) {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const { socketData } = useSocketDataStore();

    // Sort medias by position from socket data or prop
    const sortedMedias = (socketData?.playlist?.medias || playlist.medias)
        ?.sort((a, b) => a.position - b.position) || [];

    // Media rotation effect
    useEffect(() => {
        if (sortedMedias.length === 0) return;

        const currentMedia = sortedMedias[currentMediaIndex];
        const duration = currentMedia.duration * 1000;

        const intervalId = setInterval(() => {
            setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % sortedMedias.length);
        }, duration);

        return () => clearInterval(intervalId);
    }, [currentMediaIndex, sortedMedias]);

    if (sortedMedias.length === 0) {
        return <div>No media in playlist</div>;
    }

    const currentMedia = sortedMedias[currentMediaIndex];
    const previewUrl = process.env.NEXT_PUBLIC_PREVIEW_URL || '';
    const mediaPath = `${previewUrl}${currentMedia?.path}`;

    const renderMediaContent = () => {
        switch (currentMedia?.type) {
            case "video":
                return (
                    <video
                        src={mediaPath}
                        autoPlay
                        muted
                        loop
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                );
            case "image":
                return (
                    <img
                        src={mediaPath}
                        alt={currentMedia?.original_file_name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                );
            case "accident":
                return <AccidentComponent
                    accidentData={socketData?.accident || null}
                />;
            case "information":
                return (
                    <InformationComponent
                        data={socketData?.data || []}
                        time={new Date()}
                    />
                );
            default:
                return <div>{currentMedia?.original_file_name || 'Unknown Media Type'}</div>;
        }
    };

    return (
        <div style={{ height: '100%', width: '100%' }}>
            {renderMediaContent()}
        </div>
    );
}