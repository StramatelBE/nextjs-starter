'use client';

import { AppBar, Box, Toolbar } from '@mui/material';
import Image from 'next/image';
import useThemeStore from '@/stores/themeStore';

export default function Header() {
    const { mode } = useThemeStore();

    return (
        <AppBar
            sx={{
                backgroundColor: 'background.paper',
                justifyContent: 'center',
                position: 'sticky',
                top: '0',
                marginBottom: '2vh',
                boxShadow: `0 0 4px 0 var(--divider)`,
            }}
        >
            <Toolbar
                style={{
                    justifyContent: 'center',
                    padding: '0',
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: '200px',
                        height: '40px'
                    }}
                >
                    <Image
                        src={mode === 'dark' ? '/images/Logo_Stramatel_White.png' : '/images/Logo_Stramatel_Dark.png'}
                        alt="Logo"
                        fill
                        style={{ objectFit: 'contain' }}
                        priority
                    />
                </Box>
            </Toolbar>
        </AppBar>
    );
}