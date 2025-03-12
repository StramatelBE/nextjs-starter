// src/app/api/accidents/[id]/route.ts - Fix to ensure all properties are saved correctly
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

interface Params {
    params: {
        id: string;
    };
}

// PUT /api/accidents/:id - Update accident by ID with better validation
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

            // Validate the required fields with defaults if missing
            const dataToUpdate = {
                days_without_accident: body.days_without_accident ?? 0,
                record_days_without_accident: body.record_days_without_accident ?? 0,
                accidents_this_year: body.accidents_this_year ?? 0,
                reset_on_new_year: body.reset_on_new_year ?? false,
                last_updated: new Date(),
            };

            // Check if record days should be updated
            if (dataToUpdate.days_without_accident > dataToUpdate.record_days_without_accident) {
                dataToUpdate.record_days_without_accident = dataToUpdate.days_without_accident;
            }

            // Check if the accident exists
            const existingAccident = await prisma.accident.findUnique({
                where: { id },
            });

            if (!existingAccident) {
                return NextResponse.json(
                    { success: false, error: 'Accident record not found' },
                    { status: 404 }
                );
            }

            // Update the accident
            const updatedAccident = await prisma.accident.update({
                where: { id },
                data: dataToUpdate,
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