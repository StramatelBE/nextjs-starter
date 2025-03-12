'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginIcon from '@mui/icons-material/Login';
import {
    Box,
    Button,
    FormControl,
    IconButton,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import useAuthStore from '@/stores/authStore';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { setUser } = useAuthStore();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.data);
                router.push('/dashboard');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('An error occurred during login');
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <Paper>
                <Box className="herderTitlePage">
                    <Box className="headerLeft">
                        <IconButton disabled>
                            <LoginIcon
                                sx={{ color: 'primary.light' }}
                                className="headerButton"
                            />
                        </IconButton>
                        <Typography
                            className="headerTitle"
                            variant="h6"
                            sx={{ color: 'primary.light' }}
                        >
                            Connexion
                        </Typography>
                    </Box>
                </Box>

                <Box className="centeredContainer">
                    <form onSubmit={handleSubmit}>
                        <FormControl sx={{ width: '35vh' }}>
                            <TextField
                                label="Username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                margin="normal"
                            />
                            <TextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                margin="normal"
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: error ? 'error.main' : 'transparent',
                                    textAlign: 'center',
                                    height: '1.5em',
                                }}
                            >
                                {error || ' '}
                            </Typography>
                            <Button type="submit" sx={{ color: 'secondary.main' }}>
                                Se connecter
                            </Button>
                            <Typography variant="body2" sx={{ textAlign: 'center', marginTop: '20px' }}>
                                Don't have an account?{' '}
                                <Link href="/register" style={{ color: 'var(--secondary-main)' }}>
                                    Register
                                </Link>
                            </Typography>
                        </FormControl>
                    </form>
                </Box>
            </Paper>
        </div>
    );
}