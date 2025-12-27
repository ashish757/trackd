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
    recentNotifications: Notification[];
    clearNotification: (notificationId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
    socket: null,
    isConnected: false,
    recentNotifications: [],
    clearNotification: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);

    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    // Limit for recent notifications to prevent memory leak
    const MAX_RECENT_NOTIFICATIONS = 50;

    const clearNotification = (notificationId: string) => {
        setRecentNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    useEffect(() => {
        // Only connect if user is authenticated
        if (!isAuthenticated) {
            // Disconnect if already connected
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            // Clear notifications on logout
            setRecentNotifications([]);
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

            // Add to recent notifications list with limit to prevent memory leak
            setRecentNotifications(prev => {
                const updated = [notification, ...prev];
                // Keep only last 50 notifications
                return updated.slice(0, MAX_RECENT_NOTIFICATIONS);
            });

            // Show browser notification
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


    return (
        <WebSocketContext.Provider
            value={{
                socket,
                isConnected,
                recentNotifications,
                clearNotification,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

