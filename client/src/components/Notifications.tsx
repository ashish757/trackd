import { useGetFriendRequestsQuery } from '../redux/friend/friendApi';
import { useGetNotificationsQuery, useGetUnreadCountQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from '../redux/notification/notificationApi';
import type { Notification } from '../redux/notification/notificationApi';
import { Link, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect } from "react";
import Portal from "./Portal.tsx";
import { useWebSocket } from '../hooks/useWebSocket';


const Notifications = () => {
    const { data: friendRequests } = useGetFriendRequestsQuery();
    const { data: notifications = [], refetch: refetchNotifications } = useGetNotificationsQuery({ includeRead: false });
    const { data: unreadCount = 0, refetch: refetchUnreadCount } = useGetUnreadCountQuery();
    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();
    const [searchParams, setSearchParams] = useSearchParams();

    const { notifications: wsNotifications, unreadCount: wsUnreadCount } = useWebSocket();

    // Get notifications state from URL
    const showNotifications = searchParams.get('notifications') === 'open';

    // Refetch notifications when WebSocket receives new notifications
    useEffect(() => {
        if (wsNotifications.length > 0) {
            refetchNotifications();
            refetchUnreadCount();
        }
    }, [wsNotifications, refetchNotifications, refetchUnreadCount]);

    function timeAgo(date: string) {
        const now = new Date();
        const past = new Date(date);
        const diff = (now.getTime() - past.getTime()) / 1000;

        if (diff < 60) return `${Math.floor(diff)} sec ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;

        return past.toDateString();
    }

    const handleToggleNotifications = useCallback(() => {
        const newParams = new URLSearchParams(searchParams);
        if (showNotifications) {
            newParams.delete('notifications');
        } else {
            newParams.set('notifications', 'open');
        }
        setSearchParams(newParams);
    }, [searchParams, setSearchParams, showNotifications]);

    const handleClose = useCallback(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('notifications');
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            await markAllAsRead(undefined).unwrap();
            refetchNotifications();
            refetchUnreadCount();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }, [markAllAsRead, refetchNotifications, refetchUnreadCount]);

    const handleNotificationClick = useCallback(async (notificationId: string) => {
        try {
            await markAsRead(notificationId).unwrap();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }, [markAsRead]);

    const totalUnread = (friendRequests?.length || 0) + (wsUnreadCount || unreadCount);

    return (
        <>
            <button
                onClick={handleToggleNotifications}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                aria-label="Notifications"
            >
                <svg xmlns="http://www.w3.org/2000/svg"
                     className="h-6 w-6 text-gray-700"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor" >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {/* Badge for unread notifications */}
                {totalUnread > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                )}
            </button>


                <Portal layer="modal">


            {/* Backdrop Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 transition-opacity z-40 ${showNotifications ? 'md:opacity-100 opacity-0 ' : 'opacity-0 pointer-events-none'}`}
                onClick={handleClose}
            />

            {/* Sidebar Container */}
            <div className={`fixed right-0 top-0 h-screen w-full sm:w-96 bg-white  z-50 transition-transform duration-300 ease-in-out transform 
                ${showNotifications ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b-gray-200 border-b">
                    <h2 className="text-xl text-gray-700">Notifications</h2>
                    {totalUnread > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {/* List Content */}
                <div className="h-[calc(100vh-64px)] overflow-y-auto divide-y divide-gray-100">
                    {/* Friend Requests Section */}
                    {friendRequests && friendRequests.length > 0 && (
                        <>
                            <div className="px-4 py-2 bg-gray-50">
                                <h3 className="text-sm font-semibold text-gray-600">Friend Requests</h3>
                            </div>
                            {friendRequests.map((req, index) => (
                                <div
                                    key={`fr-${index}`}
                                    className="flex items-start gap-3 px-4 py-4 hover:bg-neutral-50 transition">

                                    {/* Avatar */}
                                    <div className="w-10 h-10 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                                        {req.sender.name[0].toUpperCase() || 'U'}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-700 leading-tight">
                                            <strong className="text-gray-900 font-semibold">{req.sender.name}</strong> sent you a friend request.
                                        </p>

                                        <p className="text-xs text-gray-400 mt-1 mb-3">
                                            {timeAgo(req.createdAt)}
                                        </p>

                                        <div className="flex gap-2">
                                            <Link
                                                to={`/users/${req.sender.username}`}
                                                onClick={handleClose} // Close sidebar on click
                                                className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                            >
                                                View Profile
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Other Notifications Section */}
                    {notifications.length > 0 && (
                        <>
                            <div className="px-4 py-2 bg-gray-50">
                                <h3 className="text-sm font-semibold text-gray-600">Recent Activity</h3>
                            </div>
                            {notifications.map((notif: Notification) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif.id)}
                                    className={`flex items-start gap-3 px-4 py-4 hover:bg-neutral-50 transition cursor-pointer ${
                                        !notif.isRead ? 'bg-blue-50' : ''
                                    }`}>

                                    {/* Avatar */}
                                    <div className="w-10 h-10 shrink-0 rounded-full bg-green-600 flex items-center justify-center text-white text-lg font-bold">
                                        {notif.sender?.name?.[0]?.toUpperCase() || '🔔'}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-700 leading-tight">
                                            {notif.message}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-1">
                                            {timeAgo(notif.createdAt)}
                                        </p>
                                    </div>

                                    {/* Unread indicator */}
                                    {!notif.isRead && (
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}

                    {/* Empty state */}
                    {(!friendRequests || friendRequests.length === 0) && notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 px-4 text-center">
                            <p className="text-gray-500 text-sm">No new notifications</p>
                        </div>
                    )}
                </div>
            </div>
                </Portal>
        </>
    );
}

export default Notifications;