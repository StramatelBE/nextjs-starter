import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

export async function POST(request: NextRequest) {
    return authMiddleware(request, async (user) => {
        try {
            const body = await request.json();
            const { type, playlistId } = body;

            // Validate playlist ownership
            const playlist = await prisma.playlist.findUnique({
                where: { id: playlistId, user_id: user.id }
            });

            if (!playlist) {
                return NextResponse.json(
                    { success: false, error: 'Playlist not found' },
                    { status: 404 }
                );
            }

            // Get last position in playlist
            const lastMedia = await prisma.media.findFirst({
                where: { playlistId },
                orderBy: { position: 'desc' }
            });

            const newMedia = await prisma.media.create({
                data: {
                    type,
                    original_file_name: `${type.charAt(0).toUpperCase() + type.slice(1)} Template`,
                    duration: 10, // Default duration
                    position: lastMedia ? lastMedia.position + 1 : 0,
                    file_name: '',
                    path: '',
                    format: '',
                    size: 0,
                    user_id: user.id,
                    playlistId
                }
            });

            return NextResponse.json(
                { success: true, data: newMedia },
                { status: 201 }
            );
        } catch (error) {
            console.error('Error adding data to playlist:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to add data' },
                { status: 500 }
            );
        }
    });
}