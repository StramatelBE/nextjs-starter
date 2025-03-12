'use client';

import { Grid, CircularProgress, Box } from "@mui/material";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useData from "@/hooks/useData";
import PreviewComponent from "@/features/preview/PreviewComponent";
import PlaylistComponent from "@/features/playlist/PlaylistComponent";
import AccidentComponent from "@/features/accident/AccidentComponent";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import useAccidentStore from "@/stores/accidentStore";
import usePlaylistStore from "@/stores/playlistStore";
import useModeStore from "@/stores/modeStore";
import useSocketDataStore from "@/stores/socketDataStore";
import { fetchSettings, fetchPlaylists, fetchData, fetchAccident, fetchMode } from "@/lib/api";

export default function DashboardPage() {
    const { isConnected } = useData(); // Initialize the WebSocket connection
    const [dataLoaded, setDataLoaded] = useState(false);
    const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const { setAccident } = useAccidentStore();
    const { setPlaylists } = usePlaylistStore();
    const { setMode } = useModeStore();
    const { socketData } = useSocketDataStore();

    // Check auth and fetch initial data
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const loadInitialData = async () => {
            try {
                // Fetch all necessary data in parallel
                const [playlistsData, accidentData, modeData] = await Promise.all([
                    fetchPlaylists(),
                    fetchAccident(),
                    fetchMode(),
                ]);

                // Update the stores with the fetched data
                if (playlistsData.success && playlistsData.data) {
                    setPlaylists(playlistsData.data);
                }

                if (accidentData.success && accidentData.accidents) {
                    setAccident(accidentData.accidents[0]);
                }

                if (modeData.success && modeData.data) {
                    setMode(modeData.data);
                }

                setDataLoaded(true);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                setInitialLoadError("Failed to load initial data. Please refresh the page.");
                setDataLoaded(true); // Mark as loaded even with error to remove loading state
            }
        };

        loadInitialData();
    }, [isAuthenticated, router, setAccident, setPlaylists, setMode]);

    // Early returns for authentication and loading states
    if (!isAuthenticated) {
        return null;
    }

    if (!dataLoaded) {
        return (
            <div className="mainContainer">
                <Header />
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 'calc(100vh - 150px)'
                    }}
                >
                    <CircularProgress />
                </Box>
                <Footer />
            </div>
        );
    }

    // If we have a connection error after initial load
    if (initialLoadError) {
        return (
            <div className="mainContainer">
                <Header />
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 'calc(100vh - 150px)',
                        flexDirection: 'column',
                        gap: 2
                    }}
                >
                    <div>{initialLoadError}</div>
                </Box>
                <Footer />
            </div>
        );
    }

    return (
        <div className="mainContainer">
            <Header />
            <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                    <AccidentComponent />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <PreviewComponent />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <PlaylistComponent />
                </Grid>
            </Grid>
            <Footer />
        </div>
    );
}