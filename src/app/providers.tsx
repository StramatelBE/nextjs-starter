'use client';

import { ThemeRegistry } from '@/components/ThemeRegistry';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeRegistry>
            {children}
        </ThemeRegistry>
    );
}