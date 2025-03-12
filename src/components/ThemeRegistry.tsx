'use client';

import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Simple store with just the mode, not the theme object itself
interface ThemeState {
    mode: 'light' | 'dark';
    toggleTheme: () => void;
}

const useThemeMode = create<ThemeState>()(
    persist(
        (set) => ({
            mode: 'light',
            toggleTheme: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
        }),
        { name: 'theme-mode-storage' }
    )
);

export function ThemeRegistry({ children }: { children: React.ReactNode }) {
    const { mode, toggleTheme } = useThemeMode();
    const [mounted, setMounted] = useState(false);

    // Create the theme based on the mode
    const theme = createTheme({
        palette: {
            mode: mode,
            primary: {
                main: mode === 'light' ? '#202020' : '#203038',
                light: mode === 'light' ? '#fe9b19' : '#ffffff',
            },
            secondary: {
                main: mode === 'light' ? '#fb6a22' : '#2b646f',
                light: mode === 'light' ? '#c93028' : '#ffffff',
            },
            background: {
                default: mode === 'light' ? '#E9E9E9' : '#172228',
                paper: mode === 'light' ? '#F5F5F5' : '#203038',
            },
            text: {
                primary: mode === 'light' ? 'rgba(0,0,0,0.87)' : 'rgba(255,255,255,0.87)',
                secondary: mode === 'light' ? 'rgba(0,0,0,0.54)' : 'rgba(173,171,171,0.5)',
            },
            divider: mode === 'light' ? '#E9E9E9' : '#172228',
            error: {
                main: '#EC1C0C',
            },
        },
    });

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Update CSS variables when theme changes
    useEffect(() => {
        if (mounted) {
            document.documentElement.dataset.theme = mode;

            const vars = {
                '--primary-main': theme.palette.primary.main,
                '--secondary-main': theme.palette.secondary.main,
                '--background-default': theme.palette.background.default,
                '--text-primary': theme.palette.text.primary,
            };

            Object.entries(vars).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });
        }
    }, [mode, mounted, theme]);

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

// Export the hook to use in components
export { useThemeMode };