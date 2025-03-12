import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

interface Params {
    params: {
        id: string;
    };
}

// GET /api/settings/:id - Get settings by ID
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

            const settings = await prisma.settings.findUnique({
                where: { id },
            });

            if (!settings) {
                return NextResponse.json(
                    { success: false, error: 'Settings not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, data: settings }, { status: 200 });
        } catch (error) {
            console.error(`Error fetching settings with ID ${params.id}:`, error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch settings' },
                { status: 500 }
            );
        }
    });
}

// PUT /api/settings/:id - Update settings by ID
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

            // Check if settings exists
            const existingSettings = await prisma.settings.findUnique({
                where: { id },
            });

            if (!existingSettings) {
                return NextResponse.json(
                    { success: false, error: 'Settings not found' },
                    { status: 404 }
                );
            }

            // Update the settings
            const updatedSettings = await prisma.settings.update({
                where: { id },
                data: {
                    standby: body.standby !== undefined ? body.standby : existingSettings.standby,
                    standby_start_time: body.standby_start_time || existingSettings.standby_start_time,
                    standby_end_time: body.standby_end_time || existingSettings.standby_end_time,
                    restart_at: body.restart_at || existingSettings.restart_at,
                    language: body.language || existingSettings.language,
                    theme: body.theme || existingSettings.theme,
                },
            });

            return NextResponse.json(
                { success: true, data: updatedSettings },
                { status: 200 }
            );
        } catch (error) {
            console.error(`Error updating settings with ID ${params.id}:`, error);
            return NextResponse.json(
                { success: false, error: 'Failed to update settings' },
                { status: 500 }
            );
        }
    });
}