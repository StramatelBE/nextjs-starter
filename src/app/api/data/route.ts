import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

// GET /api/data - Get all data
export async function GET(request: NextRequest) {
    return authMiddleware(request, async (user) => {
        try {
            const data = await prisma.data.findMany();
            return NextResponse.json({ success: true, data }, { status: 200 });
        } catch (error) {
            console.error('Error fetching data:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch data' },
                { status: 500 }
            );
        }
    });
}

// POST /api/data - Create new data
export async function POST(request: NextRequest) {
    return authMiddleware(request, async (user) => {
        try {
            const body = await request.json();
            const { name, value, type } = body;

            // Basic validation
            if (!name || !type || value === undefined) {
                return NextResponse.json(
                    { success: false, error: 'Name, value, and type are required' },
                    { status: 400 }
                );
            }

            // Validate type
            if (!['INT', 'BOOLEAN', 'STRING'].includes(type)) {
                return NextResponse.json(
                    { success: false, error: 'Type must be INT, BOOLEAN, or STRING' },
                    { status: 400 }
                );
            }

            const newData = await prisma.data.create({
                data: {
                    name,
                    value: String(value),
                    type,
                },
            });

            return NextResponse.json(
                { success: true, data: newData },
                { status: 201 }
            );
        } catch (error) {
            console.error('Error creating data:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to create data' },
                { status: 500 }
            );
        }
    });
}