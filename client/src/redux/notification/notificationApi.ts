import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../baseQuery';

export interface Notification {
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

interface NotificationResponse {
    status: string;
    statusCode: number;
    message: string;
    data: Notification[];
}

interface UnreadCountResponse {
    status: string;
    statusCode: number;
    message: string;
    data: {
        count: number;
    };
}

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Notifications', 'UnreadCount'],
    endpoints: (builder) => ({
        // Get all notifications
        getNotifications: builder.query<Notification[], { includeRead?: boolean }>({
            query: ({ includeRead = false }) => ({
                url: '/notifications',
                params: { includeRead: includeRead.toString() },
            }),
            transformResponse: (response: NotificationResponse) => response.data,
            providesTags: ['Notifications'],
        }),

        // Get unread count
        getUnreadCount: builder.query<number, void>({
            query: () => '/notifications/unread-count',
            transformResponse: (response: UnreadCountResponse) => response.data.count,
            providesTags: ['UnreadCount'],
        }),
        // Mark notification as read (currently unused - kept for future use)
        // We use markMultipleAsRead for auto-mark after 1000ms
        markAsRead: builder.mutation<Notification, string>({
            query: (notificationId: string) => ({
                url: `/notifications/${notificationId}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notifications', 'UnreadCount'],
        }),

        // Mark multiple notifications as read
        markMultipleAsRead: builder.mutation<{ count: number }, string[]>({
            query: (notificationIds: string[]) => ({
                url: '/notifications/mark-multiple',
                method: 'PATCH',
                body: { notificationIds },
            }),
            invalidatesTags: ['Notifications', 'UnreadCount'],
        }),

        // Mark all as read
        markAllAsRead: builder.mutation<void, void>({
            query: () => ({
                url: '/notifications/read-all',
                method: 'PATCH',
            }),
            invalidatesTags: ['Notifications', 'UnreadCount'],
        }),

        // Delete notification
        deleteNotification: builder.mutation<void, string>({
            query: (notificationId: string) => ({
                url: `/notifications/${notificationId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notifications', 'UnreadCount'],
        }),

        // Delete all read notifications
        deleteAllRead: builder.mutation<void, void>({
            query: () => ({
                url: '/notifications/read/all',
                method: 'DELETE',
            }),
            invalidatesTags: ['Notifications', 'UnreadCount'],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useGetUnreadCountQuery,
    useMarkAsReadMutation,
    useMarkMultipleAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
    // useDeleteAllReadMutation - Delete all read notifications at once
} = notificationApi;