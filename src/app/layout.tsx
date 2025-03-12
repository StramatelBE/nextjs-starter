import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import ErrorHandler from '@/components/ErrorHandler';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Stramatel',
    description: 'Digital signage application for Stramatel',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="icon" href="/favicon.ico" />
        </head>
        <body className={inter.className}>
        <Providers>
            <ErrorHandler>
                {children}
            </ErrorHandler>
        </Providers>
        </body>
        </html>
    );
}