import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

// GET /api/playlists - Get all playlists
export async function GET(request: NextRequest) {
    return authMiddleware(request, async (user) => {
        try {
            const playlists = await prisma.playlist.findMany({
                where: { user_id: user.id },
                include: {
                    medias: true,
                },
            });
            return NextResponse.json({ success: true, data: playlists }, { status: 200 });
        } catch (error) {
            console.error('Error fetching playlists:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch playlists' },
                { status: 500 }
            );
        }
    });
}

// POST /api/playlists - Create new playlist
export async function POST(request: NextRequest) {
    return authMiddleware(request, async (user) => {
        try {
            const body = await request.json();
            const { name } = body;

            if (!name) {
                return NextResponse.json(
                    { success: false, error: 'Name is required' },
                    { status: 400 }
                );
            }

            const newPlaylist = await prisma.playlist.create({
                data: {
                    name,
                    user_id: user.id,
                },
            });

            return NextResponse.json(
                { success: true, data: newPlaylist },
                { status: 201 }
            );
        } catch (error) {
            console.error('Error creating playlist:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to create playlist' },
                { status: 500 }
            );
        }
    });
}