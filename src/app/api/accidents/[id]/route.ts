import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

interface Params {
    params: {
        id: string;
    };
}

// GET /api/accidents/:id - Get accident by ID
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

            const accident = await prisma.accident.findUnique({
                where: { id },
            });

            if (!accident) {
                return NextResponse.json(
                    { success: false, error: 'Accident record not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, accident }, { status: 200 });
        } catch (error) {
            console.error('Error fetching accident:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch accident' },
                { status: 500 }
            );
        }
    });
}

// PUT /api/accidents/:id - Update accident by ID
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

            // Validate the required fields
            if (body.days_without_accident === undefined ||
                body.record_days_without_accident === undefined ||
                body.accidents_this_year === undefined) {
                return NextResponse.json(
                    { success: false, error: 'Missing required fields' },
                    { status: 400 }
                );
            }

            // Check if record days should be updated
            if (body.days_without_accident > body.record_days_without_accident) {
                body.record_days_without_accident = body.days_without_accident;
            }

            const updatedAccident = await prisma.accident.update({
                where: { id },
                data: {
                    days_without_accident: body.days_without_accident,
                    record_days_without_accident: body.record_days_without_accident,
                    accidents_this_year: body.accidents_this_year,
                    reset_on_new_year: body.reset_on_new_year || false,
                    last_updated: new Date(),
                },
            });

            return NextResponse.json(
                { success: true, accident: updatedAccident },
                { status: 200 }
            );
        } catch (error) {
            console.error('Error updating accident:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to update accident' },
                { status: 500 }
            );
        }
    });
}