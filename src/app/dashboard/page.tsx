'use client';

import { Grid } from "@mui/material";
import { useEffect } from "react";
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
import { fetchSettings, fetchPlaylists, fetchData, fetchAccident, fetchMode } from "@/lib/api";

export default function DashboardPage() {
    useData(); // Initialize the WebSocket connection
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const { setAccident } = useAccidentStore();
    const { setPlaylists } = usePlaylistStore();
    const { setMode } = useModeStore();

    // Check auth and fetch initial data
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const loadInitialData = async () => {
            try {
                // Fetch all necessary data in parallel
                const [settingsData, playlistsData, dataData, accidentData, modeData] = await Promise.all([
                    fetchSettings(),
                    fetchPlaylists(),
                    fetchData(),
                    fetchAccident(),
                    fetchMode(),
                ]);

                // Update the stores with the fetched data
                setPlaylists(playlistsData);
                setAccident(accidentData);
                setMode(modeData);

                // Note: Settings and Data will be handled by the WebSocket connection
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };

        loadInitialData();
    }, [isAuthenticated, router, setAccident, setPlaylists, setMode]);

    if (!isAuthenticated) {
        return null;
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