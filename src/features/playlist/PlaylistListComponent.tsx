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
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    Box,
} from '@mui/material';
import Container from '@/components/Container';
import usePlaylistStore from '@/stores/playlistStore';
import useModeStore from '@/stores/modeStore';
import useSocketDataStore from '@/stores/socketDataStore';
import { createPlaylist, deletePlaylist, fetchPlaylistById, updateMode } from '@/lib/api';
import AddPlaylistDialog from './AddPlaylistDialog';

export default function PlaylistListComponent() {
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [playlistToDelete, setPlaylistToDelete] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [playlistLoading, setPlaylistLoading] = useState<number | null>(null);
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

    const confirmDeletePlaylist = (id: number) => {
        setPlaylistToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeletePlaylist = async () => {
        if (!playlistToDelete) {
            setDeleteDialogOpen(false);
            return;
        }

        try {
            setLoading(true);
            const response = await deletePlaylist(playlistToDelete);

            if (response.success) {
                // If we're deleting the active playlist, stop playback
                if (activePlaylistId === playlistToDelete) {
                    await updateMode('null', null);
                    setActivePlaylistId(null);
                }

                // Remove the playlist from the local state
                const updatedPlaylists = playlists?.filter(p => p.id !== playlistToDelete) || [];
                setPlaylists(updatedPlaylists);
            }
        } catch (error) {
            console.error('Failed to delete playlist:', error);
        } finally {
            setLoading(false);
            setDeleteDialogOpen(false);
            setPlaylistToDelete(null);
        }
    };

    const handleSelectPlaylist = async (id: number) => {
        try {
            setPlaylistLoading(id);
            const response = await fetchPlaylistById(id);
            if (response?.success && response?.data) {
                setSelectedPlaylist(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch playlist details:', error);
        } finally {
            setPlaylistLoading(null);
        }
    };

    const handleTogglePlaylist = async (id: number) => {
        setLoading(true);
        try {
            const response = await updateMode('playlist', id);
            if (response.success) {
                setMode(response.data);
                setActivePlaylistId(id);

                // Fetch and set the playlist immediately
                const playlistResponse = await fetchPlaylistById(id);
                if (playlistResponse.success) {
                    setSelectedPlaylist(playlistResponse.data);
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
            setLoading(true);
            const response = await createPlaylist(name);
            if (response.success && response.data) {
                // Add the new playlist to the local state
                setPlaylists([...(playlists || []), response.data]);
            }
            setAddDialogOpen(false);
        } catch (error) {
            console.error('Failed to create playlist:', error);
        } finally {
            setLoading(false);
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
                                            sx={{
                                                cursor: 'pointer',
                                                backgroundColor: activePlaylistId === playlist.id ? 'rgba(251, 106, 34, 0.1)' : 'inherit'
                                            }}
                                            hover
                                            style={{ position: 'relative' }}
                                        >
                                            <TableCell
                                                onClick={() => handleSelectPlaylist(playlist.id)}
                                                style={{ padding: '8px 16px' }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {playlistLoading === playlist.id ? (
                                                        <CircularProgress size={16} sx={{ mr: 1 }} />
                                                    ) : null}
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: activePlaylistId === playlist.id ? 'bold' : 'normal',
                                                        }}
                                                    >
                                                        {playlist.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell style={{ width: 'auto', padding: "8px 4px" }} align="right">
                                                <Tooltip title={activePlaylistId === playlist.id ? "Stop Playlist" : "Play Playlist"}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleTogglePlaylist(playlist.id)}
                                                        disabled={loading}
                                                    >
                                                        {activePlaylistId === playlist.id ? (
                                                            <>
                                                                <StopIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                                                                {loading && (
                                                                    <CircularProgress
                                                                        size={18}
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
                                                            <PlayArrowIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                                                        )}
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell style={{ width: 'auto', padding: "8px 4px" }} align="right">
                                                <Tooltip title="Delete Playlist">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            confirmDeletePlaylist(playlist.id);
                                                        }}
                                                    >
                                                        <DeleteIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography>No playlists found. Create one to get started.</Typography>
                            <Button
                                variant="outlined"
                                sx={{ mt: 2, color: 'secondary.main', borderColor: 'secondary.main' }}
                                onClick={() => setAddDialogOpen(true)}
                                startIcon={<AddIcon />}
                            >
                                Create Playlist
                            </Button>
                        </Box>
                    )
                }
                headerRight={
                    <Tooltip title="Add Playlist">
                        <IconButton className="headerButton" onClick={() => setAddDialogOpen(true)}>
                            <AddIcon sx={{ color: 'secondary.main' }} />
                        </IconButton>
                    </Tooltip>
                }
            />

            {/* Add Playlist Dialog */}
            <AddPlaylistDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                onAdd={handleAddPlaylist}
            />

            {/* Confirm Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Playlist</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this playlist? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeletePlaylist} color="secondary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}