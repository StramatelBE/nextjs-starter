'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import useAuthStore from '@/stores/authStore';
import SettingsComponent from '@/features/settings/SettingsComponent';
import useData from '@/hooks/useData';
import { fetchSettings } from '@/lib/api';

export default function SettingsPage() {
    useData(); // Initialize WebSocket connection
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check auth and fetch settings
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const loadSettings = async () => {
            try {
                const settingsData = await fetchSettings();
                setSettings(settingsData.data[0]);
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="mainContainer">
            <Header />
            <SettingsComponent loading={loading} />
            <Footer />
        </div>
    );
}