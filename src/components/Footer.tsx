'use client';

import { BottomNavigation, BottomNavigationAction, Box } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from '@/stores/authStore';
import LogoutIcon from "@mui/icons-material/Logout";
import PermMediaIcon from "@mui/icons-material/PermMedia";
import SettingsIcon from "@mui/icons-material/Settings";
import TuneIcon from "@mui/icons-material/Tune";

export default function Footer() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const getIconColor = (path: string) => {
        return pathname === path ? "secondary.light" : "secondary.main";
    };

    return (
        <Box sx={{ position: "fixed", bottom: "0", width: "100%" }}>
            <BottomNavigation>
                <BottomNavigationAction
                    onClick={() => router.push('/dashboard')}
                    label="Dashboard"
                    icon={<PermMediaIcon sx={{ color: getIconColor("/dashboard") }} />}
                />
                <BottomNavigationAction
                    onClick={() => router.push('/settings')}
                    label="Paramètres"
                    icon={<SettingsIcon sx={{ color: getIconColor("/settings") }} />}
                />
                <BottomNavigationAction
                    onClick={() => router.push('/config')}
                    label="Configuration"
                    icon={<TuneIcon sx={{ color: getIconColor("/config") }} />}
                />
                <BottomNavigationAction
                    label="Déconnexion"
                    onClick={handleLogout}
                    icon={<LogoutIcon sx={{ color: "secondary.main" }} />}
                />
            </BottomNavigation>
        </Box>
    );
}