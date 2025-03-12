const { WebSocketServer } = require('ws');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const port = parseInt(process.env.NEXT_PUBLIC_WEBSOCKET_PORT) || 8080;

// WebSocket server setup
const wss = new WebSocketServer({ port });
console.log(`WebSocket Server is running on port ${port}`);

// Client and broadcast management
const clients = new Set();
let broadcastInterval = null;

// Enhanced data fetching with error handling and logging
async function fetchSocketData() {
    try {
        const [modes, data, accidents, settings] = await Promise.all([
            prisma.mode.findMany(),
            prisma.data.findMany(),
            prisma.accident.findMany(),
            prisma.settings.findMany()
        ]);

        const socketData = {
            mode: modes[0] || await prisma.mode.create({
                data: { name: 'null', playlist_id: null }
            }),
            data,
            accident: accidents[0] || await prisma.accident.create({
                data: {
                    days_without_accident: 0,
                    record_days_without_accident: 0,
                    accidents_this_year: 0,
                    reset_on_new_year: false,
                    last_updated: new Date()
                }
            }),
            settings: settings[0] || await prisma.settings.create({
                data: {
                    standby: false,
                    standby_start_time: '22:00',
                    standby_end_time: '06:00',
                    restart_at: '03:00',
                    language: 'fr',
                    theme: 'dark',
                    date: new Date()
                }
            })
        };

        // Fetch playlist details for playlist mode
        if (socketData.mode.name === 'playlist' && socketData.mode.playlist_id) {
            const playlist = await prisma.playlist.findUnique({
                where: { id: socketData.mode.playlist_id },
                include: {
                    medias: {
                        orderBy: { position: 'asc' }
                    }
                }
            });

            if (playlist) {
                socketData.playlist = playlist;
            }
        }

        return socketData;
    } catch (error) {
        console.error('Comprehensive data fetch error:', error);
        return null;
    }
}

// Broadcast data to all connected clients
async function broadcastData() {
    if (clients.size === 0) return;

    try {
        const socketData = await fetchSocketData();
        if (!socketData) return;

        const dataString = JSON.stringify(socketData);

        clients.forEach(client => {
            if (client.readyState === WebSocketServer.OPEN) {
                try {
                    client.send(dataString);
                } catch (err) {
                    console.error('Client send error:', err);
                    clients.delete(client);
                }
            }
        });
    } catch (error) {
        console.error('Broadcast error:', error);
    }
}

// Manage broadcasting based on client connections
function startBroadcasting() {
    if (!broadcastInterval && clients.size > 0) {
        broadcastInterval = setInterval(broadcastData, 1000);
    }
}

function stopBroadcasting() {
    if (broadcastInterval && clients.size === 0) {
        clearInterval(broadcastInterval);
        broadcastInterval = null;
    }
}

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('Client connected');

    clients.add(ws);
    startBroadcasting();
    broadcastData();

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
        stopBroadcasting();
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
        clients.delete(ws);
        stopBroadcasting();
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down WebSocket server...');

    if (broadcastInterval) {
        clearInterval(broadcastInterval);
    }

    wss.close(() => {
        prisma.$disconnect()
            .then(() => {
                console.log('Server and database shutdown complete');
                process.exit(0);
            })
            .catch(err => {
                console.error('Shutdown error:', err);
                process.exit(1);
            });
    });
});