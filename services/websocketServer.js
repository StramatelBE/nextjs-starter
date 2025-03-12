const { WebSocketServer } = require('ws');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const port = parseInt(process.env.NEXT_PUBLIC_WEBSOCKET_PORT) || 8080;

// Create WebSocket server
const wss = new WebSocketServer({ port });

console.log(`WebSocket Server is running on port ${port}`);

// Keep track of active clients and intervals
const clients = new Set();
let broadcastInterval = null;

// Function to broadcast data to all clients
async function broadcastData() {
    if (clients.size === 0) return;

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

        // Convert to JSON once instead of for each client
        const dataString = JSON.stringify(socketData);

        // Send data to all connected clients
        clients.forEach(client => {
            if (client.readyState === WebSocketServer.OPEN) {
                try {
                    client.send(dataString);
                } catch (err) {
                    console.error('Error sending to client, removing from pool:', err);
                    clients.delete(client);
                }
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Start broadcasting only when we have clients
function startBroadcasting() {
    if (!broadcastInterval && clients.size > 0) {
        broadcastInterval = setInterval(broadcastData, 1000);
    }
}

// Stop broadcasting when we have no clients
function stopBroadcasting() {
    if (broadcastInterval && clients.size === 0) {
        clearInterval(broadcastInterval);
        broadcastInterval = null;
    }
}

// Handle connections
wss.on('connection', (ws) => {
    console.log('Client connected');

    // Add client to our set
    clients.add(ws);

    // Start broadcasting if needed
    startBroadcasting();

    // Handle immediate data request
    broadcastData();

    // Clean up on disconnect
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
        stopBroadcasting();
    });

    // Handle errors
    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
        clients.delete(ws);
        stopBroadcasting();
    });
});

// Handle server shutdown
process.on('SIGINT', () => {
    console.log('Shutting down WebSocket server...');

    if (broadcastInterval) {
        clearInterval(broadcastInterval);
        broadcastInterval = null;
    }

    wss.close(() => {
        console.log('WebSocket server shut down');
        prisma.$disconnect()
            .then(() => {
                console.log('Database disconnected');
                process.exit(0);
            })
            .catch(err => {
                console.error('Error disconnecting from database:', err);
                process.exit(1);
            });
    });
});