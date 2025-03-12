// import { Server } from 'http';
// import prisma from './db';
//
// let wsServer: Server | null = null;
//
// export function setupWebSocketServer(port: number) {
//     if (wsServer) {
//         wsServer.close();
//     }
//
//     wsServer = new Server({ port });
//
//     wsServer.on('connection', (ws) => {
//         console.log('Client connected');
//
//         const intervalId = setInterval(async () => {
//             try {
//                 let socketData;
//                 const modes = await prisma.mode.findMany();
//                 const data = await prisma.data.findMany();
//                 const accident = await prisma.accident.findMany();
//                 const settings = await prisma.settings.findMany();
//
//                 socketData = {
//                     accident: accident[0],
//                     settings: settings[0],
//                     mode: modes[0],
//                     data: data,
//                 };
//
//                 if (modes[0].name === 'playlist' && modes[0].playlist_id) {
//                     const playlist = await prisma.playlist.findUnique({
//                         where: { id: modes[0].playlist_id },
//                         include: { medias: true },
//                     });
//
//                     if (playlist) {
//                         socketData = { ...socketData, playlist: playlist };
//                     }
//                 }
//
//                 ws.send(JSON.stringify(socketData));
//             } catch (error) {
//                 console.error('Error fetching data for WebSocket:', error);
//             }
//         }, 1000);
//
//         ws.on('close', () => {
//             console.log('Client disconnected');
//             clearInterval(intervalId);
//         });
//
//         ws.on('error', (err) => {
//             console.error('WebSocket error:', err);
//             clearInterval(intervalId);
//         });
//     });
//
//     console.log(`WebSocket Server is running on port ${port}`);
//     return wsServer;
// }
//
// export function getWebSocketServer() {
//     return wsServer;
// }
//
// export function closeWebSocketServer() {
//     if (wsServer) {
//         wsServer.close();
//         wsServer = null;
//     }
// }