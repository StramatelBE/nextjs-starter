import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeOptions, createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
    palette: {
        primary: {
            main: '#202020',
            light: '#fe9b19',
        },
        secondary: {
            main: '#fb6a22',
            light: '#c93028',
        },
        background: {
            default: '#E9E9E9',
            paper: '#F5F5F5',
        },
        text: {
            primary: 'rgba(0,0,0,0.87)',
            secondary: 'rgba(0,0,0,0.54)',
        },
        divider: '#E9E9E9',
        error: {
            main: '#EC1C0C',
        },
    },
});

const darkTheme = createTheme({
    palette: {
        primary: {
            main: '#203038',
            light: '#ffffff',
        },
        secondary: {
            main: '#2b646f',
            light: '#ffffff',
        },
        background: {
            default: '#172228',
            paper: '#203038',
        },
        text: {
            primary: 'rgba(255,255,255,0.87)',
            secondary: 'rgba(173,171,171,0.5)',
        },
        divider: "#172228",
        error: {
            main: '#EC1C0C',
        },
    },
});

type ThemeMode = 'light' | 'dark';

interface ThemeState {
    mode: ThemeMode;
    theme: ThemeOptions;
    toggleTheme: () => void;
}

const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            mode: 'light',
            theme: lightTheme,
            toggleTheme: () => set((state) => {
                const newMode = state.mode === 'light' ? 'dark' : 'light';
                const newTheme = newMode === 'light' ? lightTheme : darkTheme;

                // Update CSS variables for the theme
                if (typeof document !== 'undefined') {
                    document.documentElement.dataset.theme = newMode;

                    const vars = newMode === 'light'
                        ? {
                            '--primary-main': lightTheme.palette?.primary?.main,
                            '--secondary-main': lightTheme.palette?.secondary?.main,
                            '--background-default': lightTheme.palette?.background?.default,
                            '--text-primary': lightTheme.palette?.text?.primary,
                        }
                        : {
                            '--primary-main': darkTheme.palette?.primary?.main,
                            '--secondary-main': darkTheme.palette?.secondary?.main,
                            '--background-default': darkTheme.palette?.background?.default,
                            '--text-primary': darkTheme.palette?.text?.primary,
                        };

                    for (const [key, value] of Object.entries(vars)) {
                        if (value) {
                            document.documentElement.style.setProperty(key, value.toString());
                        }
                    }
                }

                return { mode: newMode, theme: newTheme };
            }),
        }),
        {
            name: 'theme-storage',
        }
    )
);

export default useThemeStore;