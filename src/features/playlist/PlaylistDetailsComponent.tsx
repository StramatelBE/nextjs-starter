'use client';

import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import {
    Box,
    CircularProgress,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import Container from '@/components/Container';
import usePlaylistStore from '@/stores/playlistStore';
import useSocketDataStore from '@/stores/socketDataStore';
import { deleteMedia, updateMedia, uploadMedia, addData, updateMediasInPlaylist, fetchPlaylistById, updatePlaylist } from '@/lib/api';
import UpdatePlaylistDialog from './UpdatePlaylistDialog';

export default function PlaylistDetailsComponent() {
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [mediaMenu, setMediaMenu] = useState<null | HTMLElement>(null);
    const [loading, setLoading] = useState(false);
    const { selectedPlaylist, clearSelectedPlaylist, setSelectedPlaylist } = usePlaylistStore();
    const { socketData } = useSocketDataStore();

    // Update selected playlist when socket data changes
    useEffect(() => {
        if (socketData?.playlist && selectedPlaylist && socketData.playlist.id === selectedPlaylist.id) {
            setSelectedPlaylist(socketData.playlist);
        }
    }, [socketData?.playlist, selectedPlaylist, setSelectedPlaylist]);

    const handleUpdatePlaylist = async (name: string) => {
        if (!selectedPlaylist) return;

        setLoading(true);
        try {
            const response = await updatePlaylist(selectedPlaylist.id, name);
            if (response.success) {
                // Refresh playlist data
                const refreshResponse = await fetchPlaylistById(selectedPlaylist.id);
                if (refreshResponse?.success && refreshResponse?.data) {
                    setSelectedPlaylist(refreshResponse.data);
                }
            }
            setUpdateDialogOpen(false);
        } catch (error) {
            console.error('Failed to update playlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMedia = async (mediaId: number) => {
        if (!selectedPlaylist) return;

        setLoading(true);
        try {
            const response = await deleteMedia(mediaId);
            if (response.success) {
                // Refresh playlist data
                const refreshResponse = await fetchPlaylistById(selectedPlaylist.id);
                if (refreshResponse?.success && refreshResponse?.data) {
                    setSelectedPlaylist(refreshResponse.data);
                }
            }
        } catch (error) {
            console.error('Failed to delete media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMediaDurationChange = async (e: React.ChangeEvent<HTMLInputElement>, mediaId: number) => {
        if (!selectedPlaylist) return;

        const duration = parseInt(e.target.value, 10) || 0;
        const media = selectedPlaylist.medias.find(m => m.id === mediaId);

        if (!media) return;

        setLoading(true);
        try {
            const response = await updateMedia(mediaId, { ...media, duration });
            if (response.success) {
                // Refresh playlist data
                const refreshResponse = await fetchPlaylistById(selectedPlaylist.id);
                if (refreshResponse?.success && refreshResponse?.data) {
                    setSelectedPlaylist(refreshResponse.data);
                }
            }
        } catch (error) {
            console.error('Failed to update media duration:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (result: any) => {
        if (!selectedPlaylist || !result.destination) return;

        const items = Array.from(selectedPlaylist.medias);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update positions
        const updatedItems = items.map((item, index) => ({
            ...item,
            position: index,
        }));

        setLoading(true);
        try {
            const response = await updateMediasInPlaylist(selectedPlaylist.id, updatedItems);
            if (response.success) {
                // Refresh playlist data
                const refreshResponse = await fetchPlaylistById(selectedPlaylist.id);
                if (refreshResponse?.success && refreshResponse?.data) {
                    setSelectedPlaylist(refreshResponse.data);
                }
            }
        } catch (error) {
            console.error('Failed to update media positions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedPlaylist || !e.target.files || e.target.files.length === 0) return;

        setLoading(true);
        try {
            const response = await uploadMedia(e.target.files[0], selectedPlaylist.id);
            if (response.success) {
                // Refresh playlist data
                const refreshResponse = await fetchPlaylistById(selectedPlaylist.id);
                if (refreshResponse?.success && refreshResponse?.data) {
                    setSelectedPlaylist(refreshResponse.data);
                }
            }
        } catch (error) {
            console.error('Failed to upload media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddData = async (type: string) => {
        if (!selectedPlaylist) return;

        setLoading(true);
        try {
            const response = await addData(type, selectedPlaylist.id);
            if (response.success) {
                // Refresh playlist data
                const refreshResponse = await fetchPlaylistById(selectedPlaylist.id);
                if (refreshResponse?.success && refreshResponse?.data) {
                    setSelectedPlaylist(refreshResponse.data);
                }
            }
        } catch (error) {
            console.error('Failed to add data media:', error);
        } finally {
            setLoading(false);
            setMediaMenu(null);
        }
    };

    if (!selectedPlaylist) {
        return null;
    }

    const sortedMedias = selectedPlaylist.medias?.sort(
        (a, b) => a.position - b.position
    ) || [];

    return (
        <>
            <Container
                icon={<EditCalendarIcon sx={{ color: 'primary.light' }} />}
                title={
                    <Stack direction="row" alignItems="center" spacing={0}>
                        <Typography variant="h6">{selectedPlaylist.name}</Typography>
                        <IconButton onClick={() => setUpdateDialogOpen(true)}>
                            <EditIcon sx={{ color: 'secondary.main' }} />
                        </IconButton>
                    </Stack>
                }
                content={
                    loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="droppable-medias">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        style={{
                                            maxHeight: 'calc(94vh - 200px)',
                                            overflowY: 'scroll',
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                            width: '100%'
                                        }}
                                    >
                                        {sortedMedias.length > 0 ? (
                                            <Table size="small">
                                                <TableBody>
                                                    {sortedMedias.map((media, index) => (
                                                        <Draggable
                                                            key={media.id}
                                                            draggableId={String(media.id)}
                                                            index={index}
                                                        >
                                                            {(provided) => (
                                                                <TableRow
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                >
                                                                    <TableCell sx={{padding: '0px'}} align="left">
                                                                        <IconButton>
                                                                            <DragHandleIcon sx={{ color: 'secondary.main' }} />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                    <TableCell sx={{
                                                                        maxWidth: '14vh',
                                                                        maxHeight: '7vh',
                                                                    }}>
                                                                        {media.type === 'video' || (media.type && media.type.split('/')[0] === 'video') ? (
                                                                            <Box
                                                                                sx={{
                                                                                    maxWidth: '14vh',
                                                                                    maxHeight: '7vh',
                                                                                }}
                                                                                component="video"
                                                                                alt={media.original_file_name}
                                                                                src={`${media.path}#t=10`}
                                                                            />
                                                                        ) : media.type === 'image' || (media.type && media.type.split('/')[0] === 'image') ? (
                                                                            <Box
                                                                                sx={{
                                                                                    height: '100%',
                                                                                    width: '100%',
                                                                                    maxWidth: '14vh',
                                                                                    maxHeight: '7vh',
                                                                                }}
                                                                                component="img"
                                                                                alt={media.original_file_name}
                                                                                src={`${media.path}`}
                                                                            />
                                                                        ) : (
                                                                            <Typography>{media.type || 'Unknown type'}</Typography>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        <TextField
                                                                            value={media.duration}
                                                                            onChange={(e) => handleMediaDurationChange(e as React.ChangeEvent<HTMLInputElement>, media.id)}
                                                                            size="small"
                                                                            type="number"
                                                                            disabled={media.type === 'video' || (media.type && media.type.split('/')[0] === 'video')}
                                                                            inputProps={{ min: 0, max: 999 }}
                                                                            style={{ width: '100%', maxWidth: '90px' }}
                                                                        />
                                                                        <Typography variant="caption" display="block" gutterBottom>
                                                                            secondes
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell sx={{padding: '0px'}} align="right">
                                                                        <IconButton
                                                                            onClick={() => handleDeleteMedia(media.id)}
                                                                        >
                                                                            <ClearIcon sx={{ color: 'secondary.main' }} />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <Typography>This playlist has no media. Add some to get started.</Typography>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )
                }
                headerLeft={
                    <IconButton
                        className="headerButton"
                        onClick={() => clearSelectedPlaylist()}
                    >
                        <ArrowBackIcon sx={{ color: 'secondary.main' }} />
                    </IconButton>
                }
                headerRight={
                    <>
                        <IconButton
                            className="headerButton"
                            onClick={(e) => setMediaMenu(e.currentTarget)}
                        >
                            <AddIcon sx={{ color: 'secondary.main' }} />
                        </IconButton>
                        <Menu
                            anchorEl={mediaMenu}
                            open={Boolean(mediaMenu)}
                            onClose={() => setMediaMenu(null)}
                        >
                            <MenuItem
                                onClick={() => {
                                    document.getElementById('media-upload')?.click();
                                    setMediaMenu(null);
                                }}
                            >
                                Upload
                            </MenuItem>
                            <MenuItem onClick={() => handleAddData('accident')}>
                                Accident
                            </MenuItem>
                            <MenuItem onClick={() => handleAddData('information')}>
                                Information
                            </MenuItem>
                        </Menu>
                        <input
                            type="file"
                            id="media-upload"
                            style={{ display: 'none' }}
                            onChange={handleUploadMedia}
                            accept="image/*,video/*"
                        />
                    </>
                }
            />
            <UpdatePlaylistDialog
                open={updateDialogOpen}
                onClose={() => setUpdateDialogOpen(false)}
                onUpdate={handleUpdatePlaylist}
                playlist={selectedPlaylist}
            />
        </>
    );
}