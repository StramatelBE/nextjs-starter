import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import prisma from './db';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'default-secret-change-in-production'
);

export interface UserJwtPayload {
    id: number;
    username: string;
}

export async function signJWT(payload: UserJwtPayload) {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60; // 1 hour

    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setExpirationTime(exp)
        .setIssuedAt(iat)
        .setNotBefore(iat)
        .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<UserJwtPayload> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as UserJwtPayload;
    } catch (error) {
        throw new Error('Invalid token');
    }
}

export async function getAuthUser(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
        return null;
    }

    try {
        const payload = await verifyJWT(token);
        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, username: true, role: true }
        });

        return user;
    } catch (error) {
        return null;
    }
}

export function setAuthCookie(token: string) {
    cookies().set({
        name: 'token',
        value: token,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 hour
    });
}

export function clearAuthCookie() {
    cookies().delete('token');
}

export function createErrorResponse(
    status: number = 401,
    message: string = 'Unauthorized'
) {
    return NextResponse.json(
        { success: false, error: message },
        { status }
    );
}

export async function authMiddleware(
    request: NextRequest,
    handler: (user: UserJwtPayload, request: NextRequest) => Promise<NextResponse>
) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
        return createErrorResponse(401, 'Authentication required');
    }

    try {
        const user = await verifyJWT(token);
        return await handler(user, request);
    } catch (error) {
        clearAuthCookie();
        return createErrorResponse(401, 'Invalid or expired token');
    }
}