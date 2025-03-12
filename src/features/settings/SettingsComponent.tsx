'use client';

import { useState } from 'react';
import BugReportIcon from '@mui/icons-material/BugReport';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LockIcon from '@mui/icons-material/Lock';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import StopIcon from '@mui/icons-material/Stop';
import {
    Button,
    CircularProgress,
    Grid,
    IconButton,
    Skeleton,
    Slider,
    Stack,
    Switch,
    Typography,
} from '@mui/material';
import { debounce } from 'lodash';
import Container from '@/components/Container';
import { useThemeMode } from '@/components/ThemeRegistry';
import useSocketDataStore from '@/stores/socketDataStore';
import useModeStore from '@/stores/modeStore';
import { updateDate, updateMode, updateSettings } from '@/lib/api';
import ChangePasswordDialog from './ChangePasswordDialog';

interface SettingsComponentProps {
    loading: boolean;
}

export default function SettingsComponent({ loading }: SettingsComponentProps) {
    const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
    const [updatingMode, setUpdatingMode] = useState(false);
    const { mode: currentMode } = useModeStore();
    const { socketData } = useSocketDataStore();
    const { mode: themeMode, toggleTheme } = useThemeMode();

    const settings = socketData?.settings;

    // Safe parsing of standby time ranges
    const getStandbyStart = () => {
        if (!settings || !settings.standby_start_time) return 22;
        try {
            return parseInt(settings.standby_start_time.split(':')[0]) || 22;
        } catch (e) {
            return 22;
        }
    };

    const getStandbyEnd = () => {
        if (!settings || !settings.standby_end_time) return 6;
        try {
            return parseInt(settings.standby_end_time.split(':')[0]) || 6;
        } catch (e) {
            return 6;
        }
    };

    const standbyStart = getStandbyStart();
    const standbyEnd = getStandbyEnd();

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        if (!settings || !Array.isArray(newValue)) return;

        const updatedSettings = {
            ...settings,
            standby_start_time: `${newValue[0]}:00`,
            standby_end_time: `${newValue[1]}:00`,
        };

        updateSettings(settings.id, updatedSettings);
    };

    const debouncedSliderChange = debounce(handleSliderChange, 300);

    const handleStandbyToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!settings) return;

        const updatedSettings = {
            ...settings,
            standby: event.target.checked,
        };

        updateSettings(settings.id, updatedSettings);
    };

    const handleDateSync = async () => {
        try {
            await updateDate(new Date().toISOString());
        } catch (error) {
            console.error('Failed to sync date:', error);
        }
    };

    const handleTestModeToggle = async () => {
        try {
            setUpdatingMode(true);
            if (currentMode?.name === 'test') {
                await updateMode('null', null);
            } else {
                await updateMode('test', null);
            }
        } catch (error) {
            console.error('Failed to toggle test mode:', error);
        } finally {
            setUpdatingMode(false);
        }
    };

    return (
        <>
            <Grid container spacing={0}>
                <Grid item xs={12} sm={12}>
                    <Container
                        icon={<SettingsIcon sx={{ color: 'primary.light' }} />}
                        title="Settings"
                        content={
                            loading ? (
                                <>
                                    {[...Array(3)].map((_, index) => (
                                        <Skeleton
                                            key={index}
                                            variant="rectangular"
                                            style={{
                                                height: '50px',
                                                width: '95%',
                                                marginLeft: '2.5%',
                                                marginRight: '2.5%',
                                                marginBottom: index === 2 ? '0' : '10px',
                                                borderRadius: '10px',
                                            }}
                                        />
                                    ))}
                                </>
                            ) : (
                                <Grid container>
                                    <Grid item xs={12} sm={12}>
                                        <Stack pl={8} pr={8} spacing={3}>
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                            >
                                                <Stack spacing={3} direction="row" alignItems="center">
                                                    <IconButton disabled>
                                                        <DarkModeIcon sx={{ color: 'text.secondary' }} />
                                                    </IconButton>
                                                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                                                        Dark mode
                                                    </Typography>
                                                </Stack>
                                                <Switch
                                                    checked={themeMode === 'dark'}
                                                    onChange={toggleTheme}
                                                    color="secondary"
                                                />
                                            </Stack>

                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                            >
                                                <Stack direction="row" alignItems="center" spacing={3}>
                                                    <IconButton disabled>
                                                        <BugReportIcon sx={{ color: 'text.secondary' }} />
                                                    </IconButton>
                                                    <Typography variant="body1" sx={{ color: 'text.primary' }}>
                                                        Test panneau
                                                    </Typography>
                                                </Stack>
                                                {currentMode?.name === 'test' ? (
                                                    <IconButton size="small" onClick={handleTestModeToggle} disabled={updatingMode}>
                                                        <StopIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
                                                        {updatingMode && (
                                                            <CircularProgress
                                                                size={32}
                                                                sx={{
                                                                    top: 5,
                                                                    left: 5,
                                                                    position: 'absolute',
                                                                    color: 'secondary.main',
                                                                }}
                                                            />
                                                        )}
                                                    </IconButton>
                                                ) : (
                                                    <IconButton size="small" onClick={handleTestModeToggle} disabled={updatingMode}>
                                                        <PlayArrowIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
                                                        {updatingMode && (
                                                            <CircularProgress
                                                                size={32}
                                                                sx={{
                                                                    top: 5,
                                                                    left: 5,
                                                                    position: 'absolute',
                                                                    color: 'secondary.main',
                                                                }}
                                                            />
                                                        )}
                                                    </IconButton>
                                                )}
                                            </Stack>

                                            <Stack
                                                onClick={handleDateSync}
                                                direction="row"
                                                alignItems="center"
                                                spacing={3}
                                            >
                                                <IconButton>
                                                    <DateRangeIcon sx={{ color: 'text.secondary' }} />
                                                </IconButton>
                                                <Typography variant="body1" sx={{ color: 'text.primary' }}>
                                                    Synchroniser la Date
                                                </Typography>
                                            </Stack>

                                            <Stack
                                                onClick={() => setChangePasswordDialogOpen(true)}
                                                direction="row"
                                                alignItems="center"
                                                spacing={3}
                                            >
                                                <IconButton>
                                                    <LockIcon sx={{ color: 'text.secondary' }} />
                                                </IconButton>
                                                <Button
                                                    variant="text"
                                                    size="large"
                                                    sx={{
                                                        margin: '24px',
                                                        color: 'text.primary',
                                                        textTransform: 'none',
                                                        padding: '0',
                                                    }}
                                                >
                                                    Changer le mot de passe
                                                </Button>
                                            </Stack>

                                            {settings && (
                                                <>
                                                    <Stack
                                                        direction="row"
                                                        justifyContent="space-between"
                                                        alignItems="center"
                                                        spacing={3}
                                                    >
                                                        <Stack spacing={3} direction="row" alignItems="center">
                                                            <IconButton disabled>
                                                                <ModeNightIcon sx={{ color: 'text.secondary' }} />
                                                            </IconButton>
                                                            <Typography variant="body1">Veille</Typography>
                                                        </Stack>
                                                        <Switch
                                                            color="secondary"
                                                            checked={settings.standby}
                                                            onChange={handleStandbyToggle}
                                                        />
                                                    </Stack>

                                                    <Stack style={{ marginLeft: '5%', marginRight: '5%' }}>
                                                        <Slider
                                                            color="secondary"
                                                            value={[standbyStart, standbyEnd]}
                                                            min={0}
                                                            max={24}
                                                            step={1}
                                                            marks={[
                                                                { value: 0, label: '0h' },
                                                                { value: 6, label: '6h' },
                                                                { value: 12, label: '12h' },
                                                                { value: 18, label: '18h' },
                                                                { value: 24, label: '24h' },
                                                            ]}
                                                            valueLabelDisplay="auto"
                                                            onChange={(e, val) => debouncedSliderChange(e, val)}
                                                            disabled={!settings.standby}
                                                        />
                                                    </Stack>
                                                </>
                                            )}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            )
                        }
                    />
                </Grid>
            </Grid>
            <ChangePasswordDialog
                open={changePasswordDialogOpen}
                onClose={() => setChangePasswordDialogOpen(false)}
            />
        </>
    );
}