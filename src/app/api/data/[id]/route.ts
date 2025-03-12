import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

interface Params {
    params: {
        id: string;
    };
}

// GET /api/data/:id - Get data by ID
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

            const data = await prisma.data.findUnique({
                where: { id },
            });

            if (!data) {
                return NextResponse.json(
                    { success: false, error: 'Data not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, data }, { status: 200 });
        } catch (error) {
            console.error(`Error fetching data with ID ${params.id}:`, error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch data' },
                { status: 500 }
            );
        }
    });
}

// PUT /api/data/:id - Update data by ID
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
            const { value } = body;

            // Check if data exists
            const existingData = await prisma.data.findUnique({
                where: { id },
            });

            if (!existingData) {
                return NextResponse.json(
                    { success: false, error: 'Data not found' },
                    { status: 404 }
                );
            }

            // Update the data
            const updatedData = await prisma.data.update({
                where: { id },
                data: { value: String(value) },
            });

            return NextResponse.json(
                { success: true, data: updatedData },
                { status: 200 }
            );
        } catch (error) {
            console.error(`Error updating data with ID ${params.id}:`, error);
            return NextResponse.json(
                { success: false, error: 'Failed to update data' },
                { status: 500 }
            );
        }
    });
}

// DELETE /api/data/:id - Delete data by ID
export async function DELETE(request: NextRequest, { params }: Params) {
    return authMiddleware(request, async (user) => {
        try {
            const id = parseInt(params.id);

            if (isNaN(id)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid ID format' },
                    { status: 400 }
                );
            }

            // Check if data exists
            const existingData = await prisma.data.findUnique({
                where: { id },
            });

            if (!existingData) {
                return NextResponse.json(
                    { success: false, error: 'Data not found' },
                    { status: 404 }
                );
            }

            // Delete the data
            await prisma.data.delete({
                where: { id },
            });

            return NextResponse.json(
                { success: true, message: 'Data deleted successfully' },
                { status: 200 }
            );
        } catch (error) {
            console.error(`Error deleting data with ID ${params.id}:`, error);
            return NextResponse.json(
                { success: false, error: 'Failed to delete data' },
                { status: 500 }
            );
        }
    });
}