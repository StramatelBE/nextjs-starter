'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { useEffect, useState } from 'react';
import useThemeStore from '@/stores/themeStore';

export function Providers({ children }: { children: React.ReactNode }) {
    const { theme, mode } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering after initial mount
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && typeof document !== 'undefined') {
            document.documentElement.dataset.theme = mode;
        }
    }, [mode, mounted]);

    if (!mounted) {
        return null;
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}