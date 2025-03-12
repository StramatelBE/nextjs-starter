import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

// GET /api/modes - Get all modes
export async function GET(request: NextRequest) {
    return authMiddleware(request, async (user) => {
        try {
            const modes = await prisma.mode.findMany();

            // Create a default mode if none exists
            if (modes.length === 0) {
                const newMode = await prisma.mode.create({
                    data: {
                        name: 'null',
                        playlist_id: null,
                    },
                });
                modes.push(newMode);
            }

            return NextResponse.json({ success: true, data: modes }, { status: 200 });
        } catch (error) {
            console.error('Error fetching modes:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch modes' },
                { status: 500 }
            );
        }
    });
}