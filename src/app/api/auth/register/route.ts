import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { success: false, error: 'Username and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 9) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 9 characters long' },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'Username already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'USER', // Default role
            },
            select: {
                id: true,
                username: true,
                role: true,
            },
        });

        return NextResponse.json(
            { success: true, data: newUser },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, error: 'Registration failed' },
            { status: 500 }
        );
    }
}