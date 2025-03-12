'use client';

import { useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    FormControl,
} from "@mui/material";

interface AddPlaylistDialogProps {
    open: boolean;
    onClose: () => void;
    onAdd: (name: string) => Promise<void>;
}

export default function AddPlaylistDialog({ open, onClose, onAdd }: AddPlaylistDialogProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            await onAdd(name);
            setName("");
        } catch (error) {
            console.error('Failed to add playlist:', error);
        }
        setLoading(false);
    };

    const handleCancel = () => {
        setName("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Ajouter une playlist</DialogTitle>
            <form onSubmit={handleSubmit}>
                <FormControl sx={{ width: "35vh" }}>
                    <DialogContent sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            id="playlist-name"
                            label="Nom du playlist"
                            autoComplete="off"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={handleCancel}
                            sx={{ color: "secondary.main" }}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            sx={{ color: "secondary.main" }}
                            disabled={!name.trim() || loading}
                        >
                            Ajouter
                        </Button>
                    </DialogActions>
                </FormControl>
            </form>
        </Dialog>
    );
}