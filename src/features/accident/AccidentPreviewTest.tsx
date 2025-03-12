'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import useAccidentStore from '@/stores/accidentStore';
import useSocketDataStore from '@/stores/socketDataStore';
import { updateAccident } from '@/lib/api';

export default function AccidentPreviewTest() {
    const { socketData } = useSocketDataStore();
    const { accident, setAccident } = useAccidentStore();
    const [testAccident, setTestAccident] = useState({
        days_without_accident: 0,
        record_days_without_accident: 0,
        accidents_this_year: 0
    });
    const [showControls, setShowControls] = useState(true);
    const [showPreview, setShowPreview] = useState(true);

    // Sync with actual accident data when it changes
    useEffect(() => {
        if (socketData?.accident) {
            setTestAccident({
                days_without_accident: socketData.accident.days_without_accident,
                record_days_without_accident: socketData.accident.record_days_without_accident,
                accidents_this_year: socketData.accident.accidents_this_year
            });
        }
    }, [socketData?.accident]);

    const toggleControls = () => {
        setShowControls(!showControls);
    };

    const togglePreview = () => {
        setShowPreview(!showPreview);
    };

    const handleIncrement = (field: keyof typeof testAccident) => {
        setTestAccident(prev => ({
            ...prev,
            [field]: prev[field] + 1
        }));
    };

    const handleDecrement = (field: keyof typeof testAccident) => {
        setTestAccident(prev => ({
            ...prev,
            [field]: Math.max(0, prev[field] - 1)
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof testAccident) => {
        const value = parseInt(e.target.value);
        setTestAccident(prev => ({
            ...prev,
            [field]: isNaN(value) ? 0 : value
        }));
    };

    const applyChanges = async () => {
        if (!accident) return;

        try {
            const updatedAccident = {
                ...accident,
                days_without_accident: testAccident.days_without_accident,
                record_days_without_accident: testAccident.record_days_without_accident,
                accidents_this_year: testAccident.accidents_this_year
            };

            const response = await updateAccident(accident.id, updatedAccident);
            if (response.success) {
                setAccident(response.accident);
            }
        } catch (error) {
            console.error('Error updating accident data:', error);
        }
    };

    return (
        <Box sx={{ p: 2, maxWidth: '100%' }}>
            <Grid container spacing={3}>
                {/* Controls Section */}
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Button variant="outlined" onClick={toggleControls}>
                            {showControls ? 'Hide Controls' : 'Show Controls'}
                        </Button>
                        <Button variant="outlined" onClick={togglePreview}>
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </Button>
                    </Box>
                </Grid>

                {/* Test Controls */}
                {showControls && (
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Accident Data Controls</Typography>

                            <Box sx={{ mb: 3 }}>
                                <Typography gutterBottom>Days Without Accident</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleDecrement('days_without_accident')}
                                        sx={{ minWidth: '40px' }}
                                    >
                                        <ArrowDownwardIcon />
                                    </Button>
                                    <TextField
                                        type="number"
                                        value={testAccident.days_without_accident}
                                        onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>, 'days_without_accident')}
                                        sx={{ mx: 2, width: '100px' }}
                                    />
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleIncrement('days_without_accident')}
                                        sx={{ minWidth: '40px' }}
                                    >
                                        <ArrowUpwardIcon />
                                    </Button>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography gutterBottom>Record Days Without Accident</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleDecrement('record_days_without_accident')}
                                        sx={{ minWidth: '40px' }}
                                    >
                                        <ArrowDownwardIcon />
                                    </Button>
                                    <TextField
                                        type="number"
                                        value={testAccident.record_days_without_accident}
                                        onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>, 'record_days_without_accident')}
                                        sx={{ mx: 2, width: '100px' }}
                                    />
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleIncrement('record_days_without_accident')}
                                        sx={{ minWidth: '40px' }}
                                    >
                                        <ArrowUpwardIcon />
                                    </Button>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography gutterBottom>Accidents This Year</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleDecrement('accidents_this_year')}
                                        sx={{ minWidth: '40px' }}
                                    >
                                        <ArrowDownwardIcon />
                                    </Button>
                                    <TextField
                                        type="number"
                                        value={testAccident.accidents_this_year}
                                        onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>, 'accidents_this_year')}
                                        sx={{ mx: 2, width: '100px' }}
                                    />
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleIncrement('accidents_this_year')}
                                        sx={{ minWidth: '40px' }}
                                    >
                                        <ArrowUpwardIcon />
                                    </Button>
                                </Box>
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={applyChanges}
                                sx={{ mt: 2 }}
                            >
                                Apply Changes
                            </Button>
                        </Paper>
                    </Grid>
                )}

                {/* Preview Section */}
                {showPreview && (
                    <Grid item xs={12} md={showControls ? 6 : 12}>
                        <Paper sx={{ p: 0, overflow: 'hidden', height: '60vh' }}>
                            <div className="accident-container" style={{ height: '100%' }}>
                                <div className="header" style={{backgroundColor: 'rgb(219, 218, 218)'}}>
                                    <img
                                        className="logo"
                                        src="/LOGO_PELLENC_2.png"
                                        alt="logo"
                                        style={{ width: '100px', height: '100px' }}
                                    />
                                    <div className="header-text" style={{fontSize: '17px', fontWeight: 'bold', marginTop: "6px"}}>
                                        <strong>CULTIVONS LA PRÉVENTION</strong>
                                    </div>
                                </div>
                                <div className="info-section">
                                    <div className="info-text">
                                        <div><strong>Nombre de jours</strong></div>
                                        <div className="info-text-light"><strong>sans accident</strong></div>
                                    </div>
                                    <div className="info-value" style={{ color: "orange"}}>
                                        <div className="info-value-texte">{testAccident.days_without_accident}</div>
                                    </div>
                                </div>
                                <div className="info-section">
                                    <div className="info-text">
                                        <div><strong>Record de jours</strong></div>
                                        <div className="info-text-light"><strong>sans accident</strong></div>
                                    </div>
                                    <div className="info-value" style={{ color: "#4CFF00", }}>
                                        <div className="info-value-texte">{testAccident.record_days_without_accident}</div>
                                    </div>
                                </div>
                                <div className="info-section">
                                    <div className="info-text">
                                        <div><strong>Nombre d'accident{testAccident.accidents_this_year > 1 ? "s" : " "}</strong></div>
                                        <div className="info-text-light"><strong>depuis le 1er janvier</strong></div>
                                    </div>
                                    <div className="info-value" style={{ color: "#FF0000" , width: "52px" }}>
                                        <div className="info-value-texte">{testAccident.accidents_this_year}</div>
                                    </div>
                                </div>
                            </div>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );