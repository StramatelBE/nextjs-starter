const { WebSocketServer } = require('ws');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const port = parseInt(process.env.NEXT_PUBLIC_WEBSOCKET_PORT) || 8080;

// Create WebSocket server
const wss = new WebSocketServer({ port });

console.log(`WebSocket Server is running on port ${port}`);

// Handle connections
wss.on('connection', (ws) => {
    console.log('Client connected');

    // Send data to client every second
    const intervalId = setInterval(async () => {
        try {
            // Fetch all necessary data
            let socketData = {};

            // Get mode
            const modes = await prisma.mode.findMany();
            if (modes.length === 0) {
                // Create default mode if none exists
                const defaultMode = await prisma.mode.create({
                    data: {
                        name: 'null',
                        playlist_id: null,
                    },
                });
                socketData.mode = defaultMode;
            } else {
                socketData.mode = modes[0];
            }

            // Get data (like temperature)
            const data = await prisma.data.findMany();
            socketData.data = data;

            // Get accidents
            const accident = await prisma.accident.findMany();
            if (accident.length === 0) {
                // Create default accident if none exists
                const defaultAccident = await prisma.accident.create({
                    data: {
                        days_without_accident: 0,
                        record_days_without_accident: 0,
                        accidents_this_year: 0,
                        reset_on_new_year: false,
                        last_updated: new Date(),
                    },
                });
                socketData.accident = defaultAccident;
            } else {
                socketData.accident = accident[0];
            }

            // Get settings
            const settings = await prisma.settings.findMany();
            if (settings.length === 0) {
                // Create default settings if none exists
                const defaultSettings = await prisma.settings.create({
                    data: {
                        standby: false,
                        standby_start_time: '22:00',
                        standby_end_time: '06:00',
                        restart_at: '03:00',
                        language: 'fr',
                        theme: 'dark',
                        date: new Date(),
                    },
                });
                socketData.settings = defaultSettings;
            } else {
                socketData.settings = settings[0];
            }

            // If current mode is 'playlist', fetch the playlist details
            if (socketData.mode.name === 'playlist' && socketData.mode.playlist_id) {
                const playlist = await prisma.playlist.findUnique({
                    where: { id: socketData.mode.playlist_id },
                    include: { medias: true },
                });

                if (playlist) {
                    socketData.playlist = playlist;
                }
            }

            // Send data to client
            ws.send(JSON.stringify(socketData));
        } catch (error) {
            console.error('Error fetching data:', error);
            try {
                ws.send(JSON.stringify({ error: 'Failed to fetch data' }));
            } catch (sendError) {
                console.error('Error sending error message:', sendError);
            }
        }
    }, 1000);

    // Clean up on disconnect
    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(intervalId);
    });

    // Handle errors
    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
        clearInterval(intervalId);
    });
});

// Handle server shutdown
process.on('SIGINT', () => {
    wss.close(() => {
        console.log('WebSocket server shut down');
        prisma.$disconnect();
        process.exit(0);
    });
});