import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/db';
import { authMiddleware } from '@/lib/auth';

export async function POST(request: NextRequest) {
    return authMiddleware(request, async (user, request) => {
        try {
            const body = await request.json();
            const { oldPassword, newPassword } = body;

            if (!oldPassword || !newPassword) {
                return NextResponse.json(
                    { success: false, error: 'Old password and new password are required' },
                    { status: 400 }
                );
            }

            if (newPassword.length < 9) {
                return NextResponse.json(
                    { success: false, error: 'New password must be at least 9 characters long' },
                    { status: 400 }
                );
            }

            const dbUser = await prisma.user.findUnique({
                where: { id: user.id },
            });

            if (!dbUser) {
                return NextResponse.json(
                    { success: false, error: 'User not found' },
                    { status: 404 }
                );
            }

            const passwordMatch = await bcrypt.compare(oldPassword, dbUser.password);

            if (!passwordMatch) {
                return NextResponse.json(
                    { success: false, error: 'Old password is incorrect' },
                    { status: 400 }
                );
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });

            return NextResponse.json(
                { success: true, message: 'Password changed successfully' },
                { status: 200 }
            );
        } catch (error) {
            console.error('Change password error:', error);
            return NextResponse.json(
                { success: false, error: 'Password change failed' },
                { status: 500 }
            );
        }
    });
}