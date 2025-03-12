import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

interface Params {
    params: {
        id: string;
    };
}

// GET /api/playlists/:id - Get playlist by ID
export async function GET(request: NextRequest, { params }: Params) {
    return authMiddleware(request, async (user) => {
        try {
            const id = parseInt(params.id);

            if (isNaN(id)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid playlist ID' },
                    { status: 400 }
                );
            }

            const playlist = await prisma.playlist.findUnique({
                where: {
                    id,
                    user_id: user.id
                },
                include: {
                    medias: {
                        orderBy: { position: 'asc' }
                    }
                }
            });

            if (!playlist) {
                return NextResponse.json(
                    { success: false, error: 'Playlist not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: playlist },
                { status: 200 }
            );
        } catch (error) {
            console.error(`Error fetching playlist ${params.id}:`, error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch playlist' },
                { status: 500 }
            );
        }
    });
}

// Optional: Add PUT method for updating playlist
export async function PUT(request: NextRequest, { params }: Params) {
    return authMiddleware(request, async (user) => {
        try {
            const id = parseInt(params.id);
            const body = await request.json();

            if (isNaN(id)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid playlist ID' },
                    { status: 400 }
                );
            }

            const updatedPlaylist = await prisma.playlist.update({
                where: {
                    id,
                    user_id: user.id
                },
                data: {
                    name: body.name
                }
            });

            return NextResponse.json(
                { success: true, data: updatedPlaylist },
                { status: 200 }
            );
        } catch (error) {
            console.error(`Error updating playlist ${params.id}:`, error);
            return NextResponse.json(
                { success: false, error: 'Failed to update playlist' },
                { status: 500 }
            );
        }
    });
}