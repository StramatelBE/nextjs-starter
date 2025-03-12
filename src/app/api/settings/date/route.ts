import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { authMiddleware } from '@/lib/auth';

const execPromise = promisify(exec);

// PUT /api/settings/date - Update system date
export async function PUT(request: NextRequest) {
    return authMiddleware(request, async (user) => {
        try {
            const body = await request.json();
            const { date } = body;

            if (!date) {
                return NextResponse.json(
                    { success: false, error: 'Date is required' },
                    { status: 400 }
                );
            }

            // Only attempt to update the system date in production
            if (process.env.NODE_ENV === 'production') {
                try {
                    // Format for Linux date command
                    const dateObj = new Date(date);
                    const formattedDate = dateObj.toISOString();

                    await execPromise(`sudo date -s "${formattedDate}"`);
                } catch (execError) {
                    console.warn('Failed to update system date:', execError);
                    // Continue without failing the request
                }
            }

            return NextResponse.json(
                { success: true, message: 'Date updated successfully' },
                { status: 200 }
            );
        } catch (error) {
            console.error('Error updating date:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to update date' },
                { status: 500 }
            );
        }
    });
}