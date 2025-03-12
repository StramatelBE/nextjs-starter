'use client';

import { useState, useEffect } from 'react';
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
import useSocketDataStore from '@/stores/socketDataStore';
import { createPlaylist, deletePlaylist, fetchPlaylistById, updateMode } from '@/lib/api';
import AddPlaylistDialog from './AddPlaylistDialog';

export default function PlaylistListComponent() {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activePlaylistId, setActivePlaylistId] = useState<number | null>(null);
    const { playlists, setSelectedPlaylist, setPlaylists } = usePlaylistStore();
    const { mode, setMode } = useModeStore();
    const { socketData } = useSocketDataStore();

    // Update activePlaylistId when socketData changes
    useEffect(() => {
        if (socketData?.mode?.name === 'playlist' && socketData.mode.playlist_id) {
            setActivePlaylistId(socketData.mode.playlist_id);
        } else {
            setActivePlaylistId(null);
        }
    }, [socketData]);

    // Update playlists when socketData changes
    useEffect(() => {
        if (socketData?.playlist) {
            // Update the local playlists with the data from socketData
            const updatedPlaylists = playlists?.map(p =>
                p.id === socketData.playlist.id ? {...p, ...socketData.playlist} : p
            );
            if (updatedPlaylists && JSON.stringify(updatedPlaylists) !== JSON.stringify(playlists)) {
                setPlaylists(updatedPlaylists);
            }
        }
    }, [socketData, playlists, setPlaylists]);

    const handleDeletePlaylist = async (id: number) => {
        try {
            const response = await deletePlaylist(id);
            if (response.success) {
                // Remove the playlist from the local state
                const updatedPlaylists = playlists?.filter(p => p.id !== id) || [];
                setPlaylists(updatedPlaylists);
            }
        } catch (error) {
            console.error('Failed to delete playlist:', error);
        }
    };

    const handleSelectPlaylist = async (id: number) => {
        try {
            const response = await fetchPlaylistById(id);
            if (response?.success && response?.data) {
                setSelectedPlaylist(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch playlist details:', error);
        }
    };

    const handleTogglePlaylist = async (id: number) => {
        setLoading(true);
        try {
            if (activePlaylistId === id) {
                const response = await updateMode('null', null);
                if (response.success) {
                    setMode(response.data);
                    setActivePlaylistId(null);
                }
            } else {
                const response = await updateMode('playlist', id);
                if (response.success) {
                    setMode(response.data);
                    setActivePlaylistId(id);
                }
            }
        } catch (error) {
            console.error('Failed to update mode:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPlaylist = async (name: string) => {
        try {
            const response = await createPlaylist(name);
            if (response.success && response.data) {
                // Add the new playlist to the local state
                setPlaylists([...(playlists || []), response.data]);
            }
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
                                                    {activePlaylistId === playlist.id ? (
                                                        <>
                                                            <StopIcon sx={{ fontSize: 15, color: 'secondary.main' }} />
                                                            {loading && (
                                                                <CircularProgress
                                                                    size={15}
                                                                    sx={{
                                                                        top: 5,
                                                                        left: 5,
                                                                        position: 'absolute',
                                                                        color: 'secondary.main',
                                                                    }}
                                                                />
                                                            )}
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