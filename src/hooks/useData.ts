import { useEffect } from "react";
import useWebSocket from "./useWebSocket";
import useSocketDataStore from "@/stores/socketDataStore";
import useStandbyStore from "@/stores/standbyStore";

const useData = () => {
    const { setSocketData } = useSocketDataStore();
    const { setStandby, setStandbyTimes, clearStandby, setIsStandby } = useStandbyStore();

    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080';

    const { connect } = useWebSocket({
        url: websocketUrl,
        onMessage: (event) => {
            try {
                const parsedData = JSON.parse(event.data);
                setSocketData(parsedData);

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

                        if (now >= start && now <= end) {
                            setIsStandby(false);
                            return;
                        }
                        setIsStandby(true);
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
        autoConnect: true,
    });

    useEffect(() => {
        // Reconnect when the component mounts
        connect();
    }, [connect]);

    return null;
};

export default useData;