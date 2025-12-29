import { createContext, useContext, useEffect, useState, useRef } from 'react';
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
    const isConnecting = useRef(false);

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
                console.log('Disconnecting WebSocket due to unauthenticated state');
                socket.removeAllListeners();
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
                isConnecting.current = false;
            }
            // Clear notifications on logout
            setRecentNotifications([]);
            return;
        }

        const accessToken = tokenManager.getAccessToken();
        if (!accessToken) {
            console.warn('No access token available for WebSocket connection');
            return;
        }

        // Prevent creating multiple connections
        if (socket?.connected || isConnecting.current) {
            console.log('WebSocket already connected or connecting, skipping new connection');
            return;
        }

        console.log('Initializing WebSocket connection...');
        isConnecting.current = true;

        // Create WebSocket connection
        const baseUrl = API_CONFIG.BASE_URL;

        const newSocket = io(baseUrl, {
            auth: {
                token: accessToken,
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 2000, // Increased from 1000
            reconnectionDelayMax: 10000,
            reconnectionAttempts: 5, // Changed from Infinity to prevent endless loops
            autoConnect: true,
        });

        newSocket.on('connect', () => {
            console.log('WebSocket connected successfully');
            setIsConnected(true);
            isConnecting.current = false;
        });

        newSocket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected. Reason:', reason);
            setIsConnected(false);
            isConnecting.current = false;

            // If server disconnected us or token error, don't auto-reconnect
            if (reason === 'io server disconnect' || reason === 'io client disconnect') {
                console.log('Server-initiated disconnect, stopping reconnection');
                newSocket.disconnect();
            }
        });

        newSocket.on('error', (error) => {
            console.error('WebSocket error event:', error);

            // Handle authentication errors
            if (error.code === 'TOKEN_EXPIRED' || error.code === 'INVALID_TOKEN' || error.code === 'NO_TOKEN') {
                console.error('Authentication error, disconnecting WebSocket');
                newSocket.removeAllListeners();
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
                isConnecting.current = false;
            }
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
            if ('Notification' in window) {
                console.log('Notification permission:', Notification.permission);

                if (Notification.permission === 'granted') {
                    const notificationIcon = notification.sender?.avatar || '/logo.svg';
                    const notificationOptions = {
                        body: notification.message,
                        icon: notificationIcon,
                        badge: '/logo.svg',
                        tag: notification.id,
                        requireInteraction: false,
                        silent: false,
                        data: {
                            notificationId: notification.id,
                            type: notification.type,
                            senderId: notification.senderId,
                            createdAt: notification.createdAt,
                        },
                    };

                    // Try using Service Worker first
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.ready
                            .then((registration) => {
                                console.log('Showing notification via Service Worker');
                                return registration.showNotification('Trackd', notificationOptions);
                            })
                            .catch((error) => {
                                console.warn('Service Worker notification failed, using fallback:', error);
                                // Fallback to regular notification
                                try {
                                    new Notification('Trackd', notificationOptions);
                                    console.log('Notification shown via fallback');
                                } catch (err) {
                                    console.error('Fallback notification failed:', err);
                                }
                            });
                    } else {
                        // No service worker support, use regular notification
                        try {
                            new Notification('Trackd', notificationOptions);
                            console.log('Notification shown (no service worker)');
                        } catch (err) {
                            console.error('Notification failed:', err);
                        }
                    }
                } else if (Notification.permission === 'default') {
                    console.log('Requesting notification permission...');
                    Notification.requestPermission().then((permission) => {
                        console.log('Permission result:', permission);
                        if (permission === 'granted') {
                            // Show the notification after permission granted
                            new Notification('Trackd', {
                                body: notification.message,
                                icon: notification.sender?.avatar || '/logo.svg',
                            });
                        }
                    });
                } else {
                    console.log('Notification permission denied');
                }
            } else {
                console.warn('Browser does not support notifications');
            }
        });

        newSocket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error.name, error.message, error.stack, error.cause);
            isConnecting.current = false;
        });

        newSocket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`WebSocket reconnection attempt ${attemptNumber}...`);
        });

        newSocket.on('reconnect_failed', () => {
            console.error('WebSocket reconnection failed after maximum attempts');
            setIsConnected(false);
            isConnecting.current = false;
        });

        setSocket(newSocket);

        // Cleanup on unmount or when dependencies change
        return () => {
            console.log('Cleaning up WebSocket connection');
            isConnecting.current = false;
            newSocket.removeAllListeners();
            newSocket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]); // Only reconnect when auth status changes
    // socket is intentionally not in deps to prevent reconnection loops


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

