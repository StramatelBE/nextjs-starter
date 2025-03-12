import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

// GET /api/settings - Get all settings
export async function GET(request: NextRequest) {
    return authMiddleware(request, async (user) => {
        try {
            const settings = await prisma.settings.findMany();
            return NextResponse.json({ success: true, data: settings }, { status: 200 });
        } catch (error) {
            console.error('Error fetching settings:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch settings' },
                { status: 500 }
            );
        }
    });
}

// POST /api/settings - Create new settings
export async function POST(request: NextRequest) {
    return authMiddleware(request, async (user) => {
        try {
            const body = await request.json();

            const newSettings = await prisma.settings.create({
                data: {
                    standby: body.standby || false,
                    standby_start_time: body.standby_start_time || '22:00',
                    standby_end_time: body.standby_end_time || '06:00',
                    restart_at: body.restart_at || '03:00',
                    language: body.language || 'fr',
                    theme: body.theme || 'dark',
                    date: new Date(),
                },
            });

            return NextResponse.json(
                { success: true, data: newSettings },
                { status: 201 }
            );
        } catch (error) {
            console.error('Error creating settings:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to create settings' },
                { status: 500 }
            );
        }
    });
}