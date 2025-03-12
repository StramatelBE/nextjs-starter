import { useRef, useEffect, useState, useCallback } from "react";

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
        reconnectAttempts = 5, // Limit reconnect attempts to prevent excessive connections
        autoConnect = true,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef<number>(0);
    const hasBeenConnectedRef = useRef<boolean>(false);

    const clearReconnectInterval = useCallback(() => {
        if (reconnectIntervalRef.current) {
            clearInterval(reconnectIntervalRef.current);
            reconnectIntervalRef.current = null;
        }
    }, []);

    const disconnect = useCallback(() => {
        clearReconnectInterval();

        if (wsRef.current) {
            // Remove all event listeners to prevent memory leaks
            wsRef.current.onopen = null;
            wsRef.current.onmessage = null;
            wsRef.current.onerror = null;
            wsRef.current.onclose = null;

            if (wsRef.current.readyState === WebSocket.OPEN ||
                wsRef.current.readyState === WebSocket.CONNECTING) {
                wsRef.current.close();
            }
            wsRef.current = null;
        }

        setIsConnected(false);
        setIsConnecting(false);
    }, [clearReconnectInterval]);

    const connect = useCallback(() => {
        // Ensure cleanup of previous connection before creating a new one
        disconnect();

        try {
            setIsConnecting(true);
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = (event) => {
                setIsConnected(true);
                setIsConnecting(false);
                reconnectAttemptsRef.current = 0;
                hasBeenConnectedRef.current = true;
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

                // Only attempt reconnection if:
                // 1. We haven't exceeded max attempts
                // 2. We're not manually disconnecting
                // 3. We've been connected before (to avoid immediate connect/disconnect cycles)
                if (reconnectAttemptsRef.current < reconnectAttempts &&
                    wsRef.current && // If wsRef.current is null, we're manually disconnecting
                    hasBeenConnectedRef.current) {

                    clearReconnectInterval();
                    reconnectIntervalRef.current = setInterval(() => {
                        reconnectAttemptsRef.current += 1;
                        connect();
                        clearReconnectInterval(); // Clear after attempting to reconnect
                    }, reconnectInterval);
                }
            };
        } catch (error) {
            console.error("WebSocket connection error:", error);
            setIsConnecting(false);
        }
    }, [url, onMessage, onOpen, onClose, onError, reconnectInterval, reconnectAttempts, clearReconnectInterval, disconnect]);

    // Connect when the component mounts
    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        // Clean up on unmount
        return () => {
            disconnect();
        };
    }, [url, autoConnect, connect, disconnect]);

    return {
        connect,
        disconnect,
        isConnected,
        isConnecting,
    };
};

export default useWebSocket;