import { useEffect, useRef } from "react";
import useWebSocket from "./useWebSocket";
import useSocketDataStore from "@/stores/socketDataStore";
import useStandbyStore from "@/stores/standbyStore";
import useModeStore from '@/stores/modeStore';

const useData = () => {
    const { setSocketData } = useSocketDataStore();
    const { setStandby, setStandbyTimes, clearStandby, setIsStandby } = useStandbyStore();
    const initializedRef = useRef(false);
    const { setMode } = useModeStore();

    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080';

    const { connect, disconnect, isConnected } = useWebSocket({
        url: websocketUrl,
        onMessage: (event) => {
            try {
                const parsedData = JSON.parse(event.data);
                setSocketData(parsedData);
                // Persist mode from socket data
                if (parsedData?.mode) {
                    setMode(parsedData.mode);
                }
                // Handle standby mode based on settings
                if (parsedData?.settings) {
                    const { standby, standby_start_time, standby_end_time } = parsedData.settings;
                    setStandbyTimes(standby_start_time, standby_end_time);

                    if (standby) {
                        const now = new Date();
                        const [startHour, startMinute] = standby_start_time.split(":");
                        const [endHour, endMinute] = standby_end_time.split(":");
                        const start = new Date(now);
                        start.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
                        const end = new Date(now);
                        end.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

                        // Adjusted logic for standby mode
                        if (end < start) {
                            // Handles cases like 22:00 to 06:00 (overnight)
                            const isInStandbyRange = now >= start || now <= end;
                            setIsStandby(isInStandbyRange);
                        } else {
                            // Normal time range like 01:00 to 05:00
                            const isInStandbyRange = now >= start && now <= end;
                            setIsStandby(isInStandbyRange);
                        }
                    } else {
                        setIsStandby(false);
                    }
                } else {
                    clearStandby();
                }
            } catch (error) {
                console.error("Failed to parse JSON data:", error);
            }
        },
        autoConnect: false,
    });

    useEffect(() => {
        // Only connect once when the component mounts
        if (!initializedRef.current) {
            initializedRef.current = true;
            connect();
        }

        // Clean up when unmounting
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return { isConnected };
};

export default useData;