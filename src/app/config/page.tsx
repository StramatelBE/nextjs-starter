'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    FormHelperText,
    Grid,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import WifiIcon from '@mui/icons-material/Wifi';
import Container from '@/components/Container';
import { fetchConfig, updateConfig } from '@/lib/api';

export default function ConfigPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        previewWidth: '',
        previewHeight: '',
        websocketUrl: '',
        apiUrl: '',
        uploadDirectory: '',
    });
    const [errors, setErrors] = useState({
        previewWidth: '',
        previewHeight: '',
        websocketUrl: '',
        apiUrl: '',
        uploadDirectory: '',
    });

    useEffect(() => {
        const loadConfig = async () => {
            try {
                setLoading(true);
                const configData = await fetchConfig();
                setConfig({
                    previewWidth: configData.previewWidth || '800',
                    previewHeight: configData.previewHeight || '600',
                    websocketUrl: configData.websocketUrl || 'ws://localhost:8080',
                    apiUrl: configData.apiUrl || 'http://localhost:3000/api',
                    uploadDirectory: configData.uploadDirectory || './public/uploads/',
                });
            } catch (error) {
                console.error('Error loading config:', error);
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, []);

    const validateInputs = () => {
        const newErrors = {
            previewWidth: '',
            previewHeight: '',
            websocketUrl: '',
            apiUrl: '',
            uploadDirectory: '',
        };
        let isValid = true;

        // Validate previewWidth
        if (!config.previewWidth || isNaN(Number(config.previewWidth))) {
            newErrors.previewWidth = 'Width must be a number';
            isValid = false;
        }

        // Validate previewHeight
        if (!config.previewHeight || isNaN(Number(config.previewHeight))) {
            newErrors.previewHeight = 'Height must be a number';
            isValid = false;
        }

        // Validate websocketUrl
        if (!config.websocketUrl) {
            newErrors.websocketUrl = 'WebSocket URL is required';
            isValid = false;
        } else if (!config.websocketUrl.startsWith('ws://') && !config.websocketUrl.startsWith('wss://')) {
            newErrors.websocketUrl = 'WebSocket URL must start with ws:// or wss://';
            isValid = false;
        }

        // Validate apiUrl
        if (!config.apiUrl) {
            newErrors.apiUrl = 'API URL is required';
            isValid = false;
        } else if (!config.apiUrl.startsWith('http://') && !config.apiUrl.startsWith('https://')) {
            newErrors.apiUrl = 'API URL must start with http:// or https://';
            isValid = false;
        }

        // Validate uploadDirectory
        if (!config.uploadDirectory) {
            newErrors.uploadDirectory = 'Upload directory is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSave = async () => {
        if (!validateInputs()) return;

        setSaving(true);
        try {
            await updateConfig(config);
            alert('Configuration saved successfully. The application will restart to apply changes.');
            // In a real deployment, you might need to trigger an app restart here
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof typeof config) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setConfig({
            ...config,
            [field]: event.target.value,
        });
    };

    return (
        <div className="mainContainer">
            <Header />
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} md={8}>
                    <Container
                        icon={<DesktopWindowsIcon sx={{ color: 'primary.light' }} />}
                        title="Application Configuration"
                        content={
                            loading ? (
                                <Typography>Loading configuration...</Typography>
                            ) : (
                                <Box sx={{ width: '100%', p: 2 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 3 }}>
                                        Configure your application settings below. These changes will apply after saving and restarting the application.
                                    </Typography>

                                    <Stack spacing={4}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Display Settings
                                                </Typography>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Preview Width"
                                                            value={config.previewWidth}
                                                            onChange={handleChange('previewWidth')}
                                                            InputProps={{
                                                                endAdornment: <InputAdornment position="end">px</InputAdornment>,
                                                            }}
                                                            error={!!errors.previewWidth}
                                                            helperText={errors.previewWidth}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Preview Height"
                                                            value={config.previewHeight}
                                                            onChange={handleChange('previewHeight')}
                                                            InputProps={{
                                                                endAdornment: <InputAdornment position="end">px</InputAdornment>,
                                                            }}
                                                            error={!!errors.previewHeight}
                                                            helperText={errors.previewHeight}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>

                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Network Settings
                                                </Typography>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="WebSocket URL"
                                                            value={config.websocketUrl}
                                                            onChange={handleChange('websocketUrl')}
                                                            placeholder="ws://localhost:8080"
                                                            error={!!errors.websocketUrl}
                                                            helperText={errors.websocketUrl || "Connection URL for real-time updates"}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="API URL"
                                                            value={config.apiUrl}
                                                            onChange={handleChange('apiUrl')}
                                                            placeholder="http://localhost:3000/api"
                                                            error={!!errors.apiUrl}
                                                            helperText={errors.apiUrl || "Base URL for API requests"}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>

                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Storage Settings
                                                </Typography>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Upload Directory"
                                                            value={config.uploadDirectory}
                                                            onChange={handleChange('uploadDirectory')}
                                                            placeholder="./public/uploads/"
                                                            error={!!errors.uploadDirectory}
                                                            helperText={errors.uploadDirectory || "Directory for storing uploaded files"}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<SaveIcon />}
                                                onClick={handleSave}
                                                disabled={saving}
                                                sx={{ mt: 2 }}
                                            >
                                                {saving ? 'Saving...' : 'Save Configuration'}
                                            </Button>
                                        </Box>
                                    </Stack>
                                </Box>
                            )
                        }
                    />
                </Grid>
            </Grid>
            <Footer />
        </div>
    );
}