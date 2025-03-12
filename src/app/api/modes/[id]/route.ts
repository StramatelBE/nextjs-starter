import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

interface Params {
    params: {
        id: string;
    };
}

// GET /api/modes/:id - Get mode by ID
export async function GET(request: NextRequest, { params }: Params) {
    return authMiddleware(request, async (user) => {
        try {
            const id = parseInt(params.id);

            if (isNaN(id)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid ID format' },
                    { status: 400 }
                );
            }

            const mode = await prisma.mode.findUnique({
                where: { id },
            });

            if (!mode) {
                return NextResponse.json(
                    { success: false, error: 'Mode not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, data: mode }, { status: 200 });
        } catch (error) {
            console.error(`Error fetching mode with ID ${params.id}:`, error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch mode' },
                { status: 500 }
            );
        }
    });
}

// PUT /api/modes/:id - Update mode by ID
export async function PUT(request: NextRequest, { params }: Params) {
    return authMiddleware(request, async (user) => {
        try {
            const id = parseInt(params.id);

            if (isNaN(id)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid ID format' },
                    { status: 400 }
                );
            }

            const body = await request.json();
            const { name, playlist_id } = body;

            // Check if mode exists
            const existingMode = await prisma.mode.findUnique({
                where: { id },
            });

            if (!existingMode) {
                return NextResponse.json(
                    { success: false, error: 'Mode not found' },
                    { status: 404 }
                );
            }

            // If playlist_id is provided, check if playlist exists
            if (playlist_id !== null && playlist_id !== undefined) {
                const playlist = await prisma.playlist.findUnique({
                    where: { id: playlist_id },
                });

                if (!playlist) {
                    return NextResponse.json(
                        { success: false, error: 'Playlist not found' },
                        { status: 404 }
                    );
                }
            }

            // Update the mode
            const updatedMode = await prisma.mode.update({
                where: { id },
                data: {
                    name: name || existingMode.name,
                    playlist_id: playlist_id === undefined ? existingMode.playlist_id : playlist_id,
                },
            });

            return NextResponse.json(
                { success: true, data: updatedMode },
                { status: 200 }
            );
        } catch (error) {
            console.error(`Error updating mode with ID ${params.id}:`, error);
            return NextResponse.json(
                { success: false, error: 'Failed to update mode' },
                { status: 500 }
            );
        }
    });
}