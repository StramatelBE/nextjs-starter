'use client';

import { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControl,
    Typography,
    Box,
    CircularProgress,
} from '@mui/material';
import { changePassword } from '@/lib/api';

interface ChangePasswordDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function ChangePasswordDialog({ open, onClose }: ChangePasswordDialogProps) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
        setLoading(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate inputs
        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('Tous les champs sont obligatoires');
            return;
        }

        if (newPassword.length < 9) {
            setError('Le nouveau mot de passe doit contenir au moins 9 caractères');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);

        try {
            const response = await changePassword(oldPassword, newPassword);

            if (response.success) {
                setSuccess('Mot de passe modifié avec succès');
                // Reset fields on success but keep dialog open to show the success message
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');

                // Close dialog after a short delay
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } else {
                setError(response.error || 'Échec de la modification du mot de passe');
            }
        } catch (error: any) {
            setError(error.message || 'Une erreur s\'est produite');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <FormControl fullWidth>
                        <TextField
                            margin="normal"
                            label="Mot de passe actuel"
                            type="password"
                            fullWidth
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            disabled={loading}
                            autoComplete="current-password"
                        />
                        <TextField
                            margin="normal"
                            label="Nouveau mot de passe"
                            type="password"
                            fullWidth
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={loading}
                            autoComplete="new-password"
                        />
                        <TextField
                            margin="normal"
                            label="Confirmer le nouveau mot de passe"
                            type="password"
                            fullWidth
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            autoComplete="new-password"
                        />

                        {error && (
                            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                                {error}
                            </Typography>
                        )}

                        {success && (
                            <Typography color="success.main" variant="body2" sx={{ mt: 2 }}>
                                {success}
                            </Typography>
                        )}
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit" disabled={loading}>
                        Annuler
                    </Button>
                    <Box sx={{ position: 'relative' }}>
                        <Button
                            type="submit"
                            color="primary"
                            disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                        >
                            Confirmer
                        </Button>
                        {loading && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                }}
                            />
                        )}
                    </Box>
                </DialogActions>
            </form>
        </Dialog>
    );
}