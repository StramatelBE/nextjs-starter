'use client';

import { useState, useEffect } from 'react';

export default function TestComponent() {
    const colors = ["#FF0000", "#00FF00", "#0000FF"];
    const [colorIndex, setColorIndex] = useState(0);

    useEffect(() => {
        const colorInterval = setInterval(() => {
            setColorIndex((prevColorIndex) => (prevColorIndex + 1) % colors.length);
        }, 2000);

        return () => {
            clearInterval(colorInterval);
        };
    }, []);

    return (
        <div
            style={{
                width: '100%',
                height: '100vh',
                backgroundColor: colors[colorIndex],
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <h1 style={{ color: 'white', fontWeight: 'bold' }}>TEST MODE</h1>
        </div>
    );
}