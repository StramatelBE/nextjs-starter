import { useRef, useEffect, useState } from "react";

type WebSocketMessageHandler = (event: MessageEvent) => void;

interface UseWebSocketOptions {
    url: string;
    onMessage?: WebSocketMessageHandler;
    onOpen?: (event: Event) => void;
    onClose?: (event: CloseEvent) => void;
    onError?: (event: Event) => void;
    reconnectInterval?: number;
    reconnectAttempts?: number;
    autoConnect?: boolean;
}

interface UseWebSocketReturn {
    connect: () => void;
    disconnect: () => void;
    isConnected: boolean;
    isConnecting: boolean;
}

const useWebSocket = (options: UseWebSocketOptions): UseWebSocketReturn => {
    const {
        url,
        onMessage,
        onOpen,
        onClose,
        onError,
        reconnectInterval = 5000,
        reconnectAttempts = Infinity,
        autoConnect = true,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef<number>(0);

    const clearReconnectInterval = () => {
        if (reconnectIntervalRef.current) {
            clearInterval(reconnectIntervalRef.current);
            reconnectIntervalRef.current = null;
        }
    };

    const connect = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        try {
            setIsConnecting(true);
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = (event) => {
                setIsConnected(true);
                setIsConnecting(false);
                reconnectAttemptsRef.current = 0;
                clearReconnectInterval();
                if (onOpen) onOpen(event);
            };

            wsRef.current.onmessage = (event) => {
                if (onMessage) onMessage(event);
            };

            wsRef.current.onerror = (event) => {
                if (onError) onError(event);
            };

            wsRef.current.onclose = (event) => {
                setIsConnected(false);
                setIsConnecting(false);
                if (onClose) onClose(event);

                if (reconnectAttemptsRef.current < reconnectAttempts) {
                    clearReconnectInterval();
                    reconnectIntervalRef.current = setInterval(() => {
                        if (
                            !wsRef.current ||
                            wsRef.current.readyState === WebSocket.CLOSED
                        ) {
                            reconnectAttemptsRef.current += 1;
                            connect();
                        } else {
                            clearReconnectInterval();
                        }
                    }, reconnectInterval);
                }
            };
        } catch (error) {
            console.error("WebSocket connection error:", error);
            setIsConnecting(false);
        }
    };

    const disconnect = () => {
        clearReconnectInterval();

        if (wsRef.current) {
            wsRef.current.onclose = null; // Prevent the reconnection logic
            wsRef.current.close();
            wsRef.current = null;
        }

        setIsConnected(false);
        setIsConnecting(false);
    };

    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        connect,
        disconnect,
        isConnected,
        isConnecting,
    };
};

export default useWebSocket;