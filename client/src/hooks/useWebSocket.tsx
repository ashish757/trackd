import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';
import { API_CONFIG } from '../config/api.config';
import { tokenManager } from '../utils/tokenManager';

interface Notification {
    id: string;
    userId: string;
    senderId?: string;
    type: 'FRIEND_REQUEST' | 'FRIEND_REQUEST_ACCEPTED' | 'FRIEND_REQUEST_REJECTED';
    message: string;
    isRead: boolean;
    createdAt: string;
    sender?: {
        id: string;
        name: string;
        username: string;
        avatar?: string;
    };
}

interface WebSocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    notifications: Notification[];
    unreadCount: number;
}

const WebSocketContext = createContext<WebSocketContextType>({
    socket: null,
    isConnected: false,
    notifications: [],
    unreadCount: 0,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        // Only connect if user is authenticated
        if (!isAuthenticated) {
            // Disconnect if already connected
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const accessToken = tokenManager.getAccessToken();
        if (!accessToken) {
            return;
        }

        // Create WebSocket connection
        const baseUrl = API_CONFIG.BASE_URL;
        const wsUrl = baseUrl.replace(/^http/, 'ws'); // Convert http to ws

        const newSocket = io(`${wsUrl}/notifications`, {
            auth: {
                token: accessToken,
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        });

        newSocket.on('notification', (notification: Notification) => {
            console.log('New notification received:', notification);

            // Add notification to the list
            setNotifications((prev) => [notification, ...prev]);

            // Increment unread count
            if (!notification.isRead) {
                setUnreadCount((prev) => prev + 1);
            }

            // Optional: Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Trackd', {
                    body: notification.message,
                    icon: '/logo.svg',
                });
            }
        });

        newSocket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });

        setSocket(newSocket);

        // Cleanup on unmount or when dependencies change
        return () => {
            newSocket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    // Request browser notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <WebSocketContext.Provider
            value={{
                socket,
                isConnected,
                notifications,
                unreadCount,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

