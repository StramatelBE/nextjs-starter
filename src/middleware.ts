import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/auth';

// Protected routes that require authentication
const protectedRoutes = [
    '/dashboard',
    '/settings',
    '/config',
];

// Routes that are only accessible when NOT authenticated
const authRoutes = [
    '/login',
    '/register',
];

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // Check if route should only be accessible when not authenticated
    const isAuthRoute = authRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // Allow API routes to be handled by their own auth checks
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    try {
        // Verify token if exists
        const isAuthenticated = token ? await verifyJWT(token).then(() => true).catch(() => false) : false;

        // Redirect to login if accessing protected route without authentication
        if (isProtectedRoute && !isAuthenticated) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Redirect to dashboard if accessing auth route while authenticated
        if (isAuthRoute && isAuthenticated) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Redirect root to dashboard or login based on auth status
        if (pathname === '/' && isAuthenticated) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else if (pathname === '/' && !isAuthenticated) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        return NextResponse.next();
    } catch (error) {
        // On error, clear token and redirect to login for protected routes
        if (isProtectedRoute) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('token');
            return response;
        }

        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|fonts|images).*)',
    ],
};