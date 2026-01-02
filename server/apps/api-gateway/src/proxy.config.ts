export const PROXY_CONFIG = {
    '/movies': process.env.MOVIE_SERVICE_URL || 'http://localhost:3001',
    '/user-movies': process.env.USER_MOVIE_SERVICE_URL || 'http://localhost:3002',
    '/auth': process.env.AUTH_SERVICE_URL || 'http://localhost:3003',
    '/user': process.env.USER_SERVICE_URL || 'http://localhost:3004',
    '/notifications': process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
    '/friend': process.env.FRIEND_SERVICE_URL || 'http://localhost:3006',
    '/socket.io': process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005', // Notification WS
};