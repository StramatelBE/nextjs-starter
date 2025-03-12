import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

// GET /api/accidents - Get all accidents
export async function GET(request: NextRequest) {
    return authMiddleware(request, async (user) => {
        try {
            const accidents = await prisma.accident.findMany();

            // Create default accident record if none exists
            if (accidents.length === 0) {
                const newAccident = await prisma.accident.create({
                    data: {
                        days_without_accident: 0,
                        record_days_without_accident: 0,
                        accidents_this_year: 0,
                        reset_on_new_year: false,
                        last_updated: new Date(),
                    },
                });
                accidents.push(newAccident);
            }

            return NextResponse.json({ success: true, accidents }, { status: 200 });
        } catch (error) {
            console.error('Error fetching accidents:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch accidents' },
                { status: 500 }
            );
        }
    });
}