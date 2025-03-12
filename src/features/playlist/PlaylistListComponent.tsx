'use client';

import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ListIcon from '@mui/icons-material/List';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import {
    CircularProgress,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from '@mui/material';
import Container from '@/components/Container';
import usePlaylistStore from '@/stores/playlistStore';
import useModeStore from '@/stores/modeStore';
import { createPlaylist, deletePlaylist, fetchPlaylistById, updateMode } from '@/lib/api';
import AddPlaylistDialog from './AddPlaylistDialog';

export default function PlaylistListComponent() {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { playlists, setSelectedPlaylist } = usePlaylistStore();
    const { mode } = useModeStore();

    const handleDeletePlaylist = async (id: number) => {
        try {
            await deletePlaylist(id);
        } catch (error) {
            console.error('Failed to delete playlist:', error);
        }
    };

    const handleSelectPlaylist = async (id: number) => {
        try {
            const response = await fetchPlaylistById(id);
            if (response?.data) {
                setSelectedPlaylist(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch playlist details:', error);
        }
    };

    const handleTogglePlaylist = async (id: number) => {
        setLoading(true);
        try {
            if (mode?.name === 'playlist' && mode.playlist_id === id) {
                await updateMode('null', null);
            } else {
                await updateMode('playlist', id);
            }
        } catch (error) {
            console.error('Failed to update mode:', error);
        }
        setLoading(false);
    };

    const handleAddPlaylist = async (name: string) => {
        try {
            await createPlaylist(name);
            setAddDialogOpen(false);
        } catch (error) {
            console.error('Failed to create playlist:', error);
        }
    };

    return (
        <>
            <Container
                icon={<ListIcon sx={{ color: 'primary.light' }} />}
                title="Playlists"
                content={
                    playlists && playlists.length > 0 ? (
                        <div style={{ width: '100%' }}>
                            <Table size="small">
                                <TableBody>
                                    {playlists.map((playlist) => (
                                        <TableRow
                                            key={playlist.id}
                                            sx={{ cursor: 'pointer' }}
                                            hover
                                            style={{ position: 'relative' }}
                                        >
                                            <TableCell
                                                onClick={() => handleSelectPlaylist(playlist.id)}
                                                style={{ padding: '0 16px' }}
                                            >
                                                {playlist.name}
                                            </TableCell>
                                            <TableCell style={{ width: 'auto', padding: "16px 0px" }} align="right">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleTogglePlaylist(playlist.id)}
                                                    disabled={loading}
                                                >
                                                    {mode?.name === 'playlist' && mode.playlist_id === playlist.id ? (
                                                        <>
                                                            <StopIcon sx={{ fontSize: 15, color: 'secondary.main' }} />
                                                            <CircularProgress
                                                                size={15}
                                                                sx={{
                                                                    top: 5,
                                                                    left: 5,
                                                                    position: 'absolute',
                                                                    color: 'secondary.main',
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        <PlayArrowIcon sx={{ fontSize: 15, color: 'secondary.main' }} />
                                                    )}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell style={{ width: 'auto', padding: "16px 0px" }} align="right">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeletePlaylist(playlist.id)}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 15, color: 'secondary.main' }} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <Typography>No playlists found. Create one to get started.</Typography>
                    )
                }
                headerRight={
                    <IconButton className="headerButton" onClick={() => setAddDialogOpen(true)}>
                        <AddIcon sx={{ color: 'secondary.main' }} />
                    </IconButton>
                }
            />
            <AddPlaylistDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                onAdd={handleAddPlaylist}
            />
        </>
    );
}