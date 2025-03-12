'use client';

import { useState, useEffect } from "react";
import { Box, CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import WarningIcon from "@mui/icons-material/Warning";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import Container from '@/components/Container';
import useAccidentStore from '@/stores/accidentStore';
import useModeStore from '@/stores/modeStore';
import useSocketDataStore from '@/stores/socketDataStore';
import { updateAccident, updateMode } from '@/lib/api';
import ResetAccidentsDialog from "./ResetAccidentsDialog";

export default function AccidentComponent() {
    const { accident, setAccident } = useAccidentStore();
    const { mode, setMode } = useModeStore();
    const { socketData } = useSocketDataStore();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [localValues, setLocalValues] = useState({
        days_without_accident: 0,
        record_days_without_accident: 0,
        accidents_this_year: 0
    });

    // Sync accident data from WebSocket when it changes
    useEffect(() => {
        if (socketData?.accident) {
            setAccident(socketData.accident);
            setLocalValues({
                days_without_accident: socketData.accident.days_without_accident,
                record_days_without_accident: socketData.accident.record_days_without_accident,
                accidents_this_year: socketData.accident.accidents_this_year
            });
        }
    }, [socketData?.accident, setAccident]);

    // Check if reset is needed when accident data changes
    useEffect(() => {
        if (accident?.reset_on_new_year) {
            setOpen(true);
        }
    }, [accident]);

    const handleClose = async (reset: boolean) => {
        setOpen(false);

        if (accident) {
            const updatedAccident = {
                ...accident,
                reset_on_new_year: false,
                accidents_this_year: reset ? 0 : accident.accidents_this_year,
                days_without_accident: reset ? 0 : accident.days_without_accident
            };

            const response = await updateAccident(accident.id, updatedAccident);
            if (response.success) {
                setAccident(response.accident);
                setLocalValues({
                    days_without_accident: response.accident.days_without_accident,
                    record_days_without_accident: response.accident.record_days_without_accident,
                    accidents_this_year: response.accident.accidents_this_year
                });
            }
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (!accident) return;

        let value = parseInt(e.target.value, 10);
        if (isNaN(value)) {
            value = 0;
        }

        // Update local values immediately for responsive UI
        setLocalValues(prev => ({
            ...prev,
            [field]: value
        }));

        let updatedAccident = {
            ...accident,
            [field]: value,
        };

        // Update record days if current days are higher
        if (
            field === 'days_without_accident' &&
            value > accident.record_days_without_accident
        ) {
            updatedAccident.record_days_without_accident = value;
            setLocalValues(prev => ({
                ...prev,
                record_days_without_accident: value
            }));
        }

        // Reset days without accident when adding new accidents
        if (
            field === 'accidents_this_year' &&
            value > accident.accidents_this_year
        ) {
            updatedAccident.days_without_accident = 0;
            setLocalValues(prev => ({
                ...prev,
                days_without_accident: 0
            }));
        }

        const response = await updateAccident(accident.id, updatedAccident);
        if (response.success) {
            setAccident(response.accident);
        }
    };

    const toggleAccidentMode = async () => {
        setLoading(true);
        try {
            if (mode && mode.name === 'accident') {
                const response = await updateMode('null', null);
                if (response.success) {
                    setMode(response.data);
                }
            } else {
                const response = await updateMode('accident', null);
                if (response.success) {
                    setMode(response.data);
                }
            }
        } catch (error) {
            console.error('Error toggling accident mode:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!accident) {
        return (
            <Container
                icon={<WarningIcon sx={{ color: "primary.light" }} />}
                title="Accident"
                content={<Typography>Loading accident data...</Typography>}
            />
        );
    }

    return (
        <>
            <Container
                icon={<WarningIcon sx={{ color: "primary.light" }} />}
                title="Accident"
                content={
                    <form style={{ width: '80%' }}>
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            marginBottom={2}
                        >
                            <Typography variant="body1">Jour sans accident</Typography>

                            <TextField
                                style={{ width: '10vh' }}
                                margin="normal"
                                type="number"
                                value={localValues.days_without_accident}
                                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>, 'days_without_accident')}
                            />
                        </Box>
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            marginBottom={2}
                        >
                            <Typography variant="body1">Record de jours sans accident</Typography>

                            <TextField
                                style={{ width: '10vh' }}
                                margin="normal"
                                type="number"
                                value={localValues.record_days_without_accident}
                                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>, 'record_days_without_accident')}
                            />
                        </Box>
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            marginBottom={2}
                        >
                            <Typography variant="body1">Accidents cette année</Typography>

                            <TextField
                                style={{ width: '10vh' }}
                                margin="normal"
                                type="number"
                                value={localValues.accidents_this_year}
                                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>, 'accidents_this_year')}
                            />
                        </Box>
                    </form>
                }
                headerRight={
                    <IconButton onClick={toggleAccidentMode} className="headerButton" disabled={loading}>
                        {mode?.name === 'accident' ? (
                            <>
                                <StopIcon sx={{ color: 'secondary.main' }} />
                                {loading && (
                                    <CircularProgress
                                        size={24}
                                        sx={{
                                            top: 8,
                                            left: 8,
                                            position: 'absolute',
                                            color: 'secondary.main',
                                        }}
                                    />
                                )}
                            </>
                        ) : (
                            <>
                                <PlayArrowIcon sx={{ color: 'secondary.main' }} />
                                {loading && (
                                    <CircularProgress
                                        size={24}
                                        sx={{
                                            top: 8,
                                            left: 8,
                                            position: 'absolute',
                                            color: 'secondary.main',
                                        }}
                                    />
                                )}
                            </>
                        )}
                    </IconButton>
                }
            />
            <ResetAccidentsDialog open={open} onClose={handleClose} />
        </>
    );
}