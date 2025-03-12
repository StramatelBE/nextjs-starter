'use client';

import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
} from '@mui/material';

interface ResetAccidentsDialogProps {
    open: boolean;
    onClose: (reset: boolean) => void;
}

export default function ResetAccidentsDialog({ open, onClose }: ResetAccidentsDialogProps) {
    return (
        <Dialog open={open} onClose={() => onClose(false)}>
            <DialogTitle>Réinitialiser les accidents cette année</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Voulez-vous réinitialiser les accidents de cette année ?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(false)} color="primary">
                    Non
                </Button>
                <Button onClick={() => onClose(true)} color="primary">
                    Oui
                </Button>
            </DialogActions>
        </Dialog>
    );
}