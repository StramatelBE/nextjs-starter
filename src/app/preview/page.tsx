'use client';

import { useEffect, useState } from 'react';
import useSocketDataStore from '@/stores/socketDataStore';
import useData from '@/hooks/useData';
import AccidentComponent from '@/features/preview/AccidentComponent';
import InformationComponent from '@/features/preview/InformationComponent';
import PlaylistComponent from '@/features/preview/PlaylistComponent';
import TestComponent from '@/features/preview/TestComponent';
import useStandbyStore from '@/stores/standbyStore';

export default function PreviewPage() {
    useData(); // Initialize the WebSocket connection
    const { socketData } = useSocketDataStore();
    const { isStandby } = useStandbyStore();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (isStandby) {
        return null;
    }

    if (!socketData) {
        return <div>Loading data...</div>;
    }

    return (
        <>
            {socketData.mode?.name === 'test' && <TestComponent />}
            {socketData.mode?.name === 'accident' && <AccidentComponent />}
            {socketData.mode?.name === 'information' && <InformationComponent data={socketData.data} time={currentTime} />}
            {socketData.mode?.name === 'playlist' && socketData.playlist && (
                <PlaylistComponent playlist={socketData.playlist} />
            )}
        </>
    );
}