'use client';

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Button,
    FormControl,
} from "@mui/material";
import { Playlist } from "@prisma/client";

interface UpdatePlaylistDialogProps {
    open: boolean;
    onClose: () => void;
    onUpdate: (name: string) => Promise<void>;
    playlist: Playlist & { medias: any[] };
}

export default function UpdatePlaylistDialog({
                                                 open,
                                                 onClose,
                                                 onUpdate,
                                                 playlist
                                             }: UpdatePlaylistDialogProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && playlist) {
            setName(playlist.name);
        }
    }, [open, playlist]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            await onUpdate(name);
        } catch (error) {
            console.error('Failed to update playlist:', error);
        }
        setLoading(false);
    };

    const handleCancel = () => {
        setName(playlist.name);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Mettre à jour la playlist</DialogTitle>
            <form onSubmit={handleSubmit}>
                <FormControl sx={{ width: "35vh" }}>
                    <DialogContent sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            id="playlist-name-update"
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
                            Mettre à jour
                        </Button>
                    </DialogActions>
                </FormControl>
            </form>
        </Dialog>
    );
}