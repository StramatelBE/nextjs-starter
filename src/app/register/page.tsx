'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
    Box,
    Button,
    FormControl,
    IconButton,
    Paper,
    TextField,
    Typography,
} from '@mui/material';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 9) {
            setError('Password must be at least 9 characters long');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to login page after successful registration
                router.push('/login');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setError('An error occurred during registration');
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
                            <PersonAddIcon
                                sx={{ color: 'primary.light' }}
                                className="headerButton"
                            />
                        </IconButton>
                        <Typography
                            className="headerTitle"
                            variant="h6"
                            sx={{ color: 'primary.light' }}
                        >
                            Create Account
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
                            <TextField
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                margin="normal"
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: error ? 'error.main' : 'transparent',
                                    textAlign: 'center',
                                    height: '1.5em',
                                    marginTop: '10px',
                                }}
                            >
                                {error || ' '}
                            </Typography>
                            <Button type="submit" sx={{ color: 'secondary.main', marginTop: '10px' }}>
                                Register
                            </Button>
                            <Typography variant="body2" sx={{ textAlign: 'center', marginTop: '20px' }}>
                                Already have an account?{' '}
                                <Link href="/login" style={{ color: 'var(--secondary-main)' }}>
                                    Login
                                </Link>
                            </Typography>
                        </FormControl>
                    </form>
                </Box>
            </Paper>
        </div>
    );
}