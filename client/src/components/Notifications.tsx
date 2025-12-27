import { useGetNotificationsQuery, useGetUnreadCountQuery, useMarkAllAsReadMutation, useDeleteNotificationMutation } from '../redux/notification/notificationApi';
import type { Notification } from '../redux/notification/notificationApi';
import { Link, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useState, useMemo } from "react";
import Portal from "./Portal.tsx";
import { useAcceptFollowRequestMutation, useRejectFollowRequestMutation } from '../redux/user/userApi';
import { useWebSocket } from '../hooks/useWebSocket';
import { X, Check, UserX } from 'lucide-react';


const Notifications = () => {
    const { data: notifications = [], refetch: refetchNotifications } = useGetNotificationsQuery({ includeRead: true });
    const { data: unreadCount = 0, refetch: refetchUnreadCount } = useGetUnreadCountQuery();
    const [markAllAsRead] = useMarkAllAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();
    const [acceptFollowRequest] = useAcceptFollowRequestMutation();
    const [rejectFollowRequest] = useRejectFollowRequestMutation();
    const [searchParams, setSearchParams] = useSearchParams();

    const {
        recentNotifications,
        clearNotification,
        markAllNotificationsAsRead
    } = useWebSocket();

    // Track loading states for individual actions
    const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

    // Get notifications state from URL
    const showNotifications = searchParams.get('notifications') === 'open';

    // Combine API notifications with recent WebSocket notifications
    const allNotifications = useMemo(() => [
        ...recentNotifications,
        ...notifications.filter(n => !recentNotifications.find(rn => rn.id === n.id))
    ], [recentNotifications, notifications]);

    // Filter friend requests from all notifications (type: FRIEND_REQUEST)
    const friendRequests = useMemo(() =>
        allNotifications.filter(n => n.type === 'FRIEND_REQUEST' && !n.isRead),
        [allNotifications]
    );

    // Filter other notifications (not friend requests)
    const otherNotifications = useMemo(() =>
        allNotifications.filter(n => n.type !== 'FRIEND_REQUEST'),
        [allNotifications]
    );

    // Watch for changes in recentNotifications to update unread count
    // No need for custom events - just react to state changes
    useEffect(() => {
        if (recentNotifications.length > 0) {
            // Only refetch count when new notifications arrive
            refetchUnreadCount();
        }
    }, [recentNotifications.length, refetchUnreadCount]);

    // Auto mark as read after 500ms of opening notification panel
    useEffect(() => {
        if (!showNotifications) {
            return; // Panel is closed, do nothing
        }

        // Get all unread notifications
        const unreadNotifications = allNotifications.filter(n => !n.isRead);

        if (unreadNotifications.length === 0) {
            return; // No unread notifications
        }

        // Set timeout to mark as read after 500ms
        const timer = setTimeout(async () => {
            try {
                // Mark all as read optimistically
                markAllNotificationsAsRead();

                // Then update server
                await markAllAsRead(undefined).unwrap();

                // Only refetch count to sync
                refetchUnreadCount();
            } catch (error) {
                console.error('Failed to auto-mark as read:', error);
                // On error, refetch to restore correct state
                refetchNotifications();
            }
        }, 500);

        // Cleanup: if panel closes before 500ms, cancel the timer
        return () => {
            clearTimeout(timer);
        };
    }, [showNotifications, allNotifications, markAllNotificationsAsRead, markAllAsRead, refetchUnreadCount, refetchNotifications]);

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
            // Optimistic update - instant UI feedback
            markAllNotificationsAsRead();

            // Then update server
            await markAllAsRead(undefined).unwrap();

            // Only refetch count to sync
            refetchUnreadCount();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            // On error, refetch to get correct state
            refetchNotifications();
        }
    }, [markAllAsRead, markAllNotificationsAsRead, refetchUnreadCount, refetchNotifications]);

    const handleDeleteNotification = useCallback(async (notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent marking as read when deleting
        try {
            setLoadingActions(prev => ({ ...prev, [`delete-${notificationId}`]: true }));

            // Optimistic update - remove from UI immediately
            clearNotification(notificationId);

            // Then delete from server
            await deleteNotification(notificationId).unwrap();

            // Only refetch count to sync
            refetchUnreadCount();
        } catch (error) {
            console.error('Failed to delete notification:', error);
            // On error, refetch to restore correct state
            refetchNotifications();
        } finally {
            setLoadingActions(prev => ({ ...prev, [`delete-${notificationId}`]: false }));
        }
    }, [deleteNotification, clearNotification, refetchUnreadCount, refetchNotifications]);

    const handleAcceptFriendRequest = useCallback(async (requesterId: string, notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            setLoadingActions(prev => ({ ...prev, [`accept-${requesterId}`]: true }));

            // Optimistic update - remove from UI immediately
            clearNotification(notificationId);

            // Then send to server
            await acceptFollowRequest({ requesterId }).unwrap();
            await deleteNotification(notificationId).unwrap();

            // Only refetch count to sync
            refetchUnreadCount();
        } catch (error) {
            console.error('Failed to accept friend request:', error);
            // On error, refetch to restore correct state
            refetchNotifications();
        } finally {
            setLoadingActions(prev => ({ ...prev, [`accept-${requesterId}`]: false }));
        }
    }, [acceptFollowRequest, deleteNotification, clearNotification, refetchUnreadCount, refetchNotifications]);

    const handleRejectFriendRequest = useCallback(async (requesterId: string, notificationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            setLoadingActions(prev => ({ ...prev, [`reject-${requesterId}`]: true }));

            // Optimistic update - remove from UI immediately
            clearNotification(notificationId);

            // Then send to server
            await rejectFollowRequest({ requesterId }).unwrap();
            await deleteNotification(notificationId).unwrap();

            // Only refetch count to sync
            refetchUnreadCount();
        } catch (error) {
            console.error('Failed to reject friend request:', error);
            // On error, refetch to restore correct state
            refetchNotifications();
        } finally {
            setLoadingActions(prev => ({ ...prev, [`reject-${requesterId}`]: false }));
        }
    }, [rejectFollowRequest, deleteNotification, clearNotification, refetchUnreadCount, refetchNotifications]);

    // Calculate total unread (friend requests are already counted in unreadCount from API)
    const totalUnread = unreadCount;

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
                            {friendRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className="flex items-start gap-3 px-4 py-4 hover:bg-neutral-50 transition relative group">

                                    {/* Avatar */}
                                    {req.sender?.username ? (
                                        <Link
                                            to={`/users/${req.sender.username}`}
                                            onClick={handleClose}
                                            className="w-10 h-10 shrink-0 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-lg font-bold hover:bg-blue-700 transition"
                                        >
                                            {req.sender.avatar ? (
                                                <img src={req.sender.avatar} alt={req.sender.name} className="w-full h-full object-cover" />
                                            ) : (
                                                req.sender.name?.[0]?.toUpperCase() || 'U'
                                            )}
                                        </Link>
                                    ) : (
                                        <div className="w-10 h-10 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                                            U
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-700 leading-tight">
                                            {req.sender?.username ? (
                                                <>
                                                    <Link
                                                        to={`/users/${req.sender.username}`}
                                                        onClick={handleClose}
                                                        className="font-semibold text-gray-900 hover:text-blue-600 hover:underline"
                                                    >
                                                        {req.sender.name}
                                                    </Link>
                                                    {' sent you a friend request.'}
                                                </>
                                            ) : (
                                                req.message
                                            )}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-1 mb-3">
                                            {timeAgo(req.createdAt)}
                                        </p>

                                        {req.sender?.id && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => handleAcceptFriendRequest(req.sender!.id, req.id, e)}
                                                    disabled={loadingActions[`accept-${req.sender!.id}`]}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Check size={14} />
                                                    {loadingActions[`accept-${req.sender!.id}`] ? 'Accepting...' : 'Accept'}
                                                </button>
                                                <button
                                                    onClick={(e) => handleRejectFriendRequest(req.sender!.id, req.id, e)}
                                                    disabled={loadingActions[`reject-${req.sender!.id}`]}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <UserX size={14} />
                                                    {loadingActions[`reject-${req.sender!.id}`] ? 'Rejecting...' : 'Reject'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Recent Activity Section */}
                    {otherNotifications.length > 0 && (
                        <>
                            <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-600">Recent Activity</h3>
                                <p className="text-xs text-gray-500">{otherNotifications.length} notifications</p>
                            </div>
                            {otherNotifications.map((notif: Notification) => (
                                <div
                                    key={notif.id}
                                    className={`flex items-start gap-3 px-4 py-4 hover:bg-neutral-50 transition relative group ${
                                        !notif.isRead ? 'bg-blue-50' : ''
                                    }`}>

                                    {/* Delete Button - Top Right Corner */}
                                    <button
                                        onClick={(e) => handleDeleteNotification(notif.id, e)}
                                        disabled={loadingActions[`delete-${notif.id}`]}
                                        className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400  hover:bg-red-100 hover:text-red-400 transition disabled:opacity-50"
                                        title="Delete notification"
                                    >
                                        <X size={16} />
                                    </button>

                                    {/* Avatar - Clickable if sender exists */}
                                    {notif.sender?.username ? (
                                        <Link
                                            to={`/users/${notif.sender.username}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClose();
                                            }}
                                            className="w-10 h-10 shrink-0 overflow-hidden rounded-full bg-green-600 flex items-center justify-center text-white text-lg font-bold hover:bg-green-700 transition"
                                        >
                                            {
                                                notif.sender.avatar ? (
                                                    <img src={notif.sender.avatar} alt={notif.sender.name}/>
                                                ) : (
                                                    notif.sender.name?.[0]?.toUpperCase() || 'U'
                                                )
                                            }

                                        </Link>
                                    ) : (
                                        <div className="w-10 h-10 shrink-0 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg">
                                            🔔
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-8">
                                        <p className="text-sm text-gray-700 leading-tight">
                                            {notif.sender?.username ? (
                                                <>
                                                    <Link
                                                        to={`/users/${notif.sender.username}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleClose();
                                                        }}
                                                        className="font-semibold text-gray-900 hover:text-blue-600 hover:underline"
                                                    >
                                                        {notif.sender.name}
                                                    </Link>
                                                    {' '}
                                                    {notif.message.replace(notif.sender.name, '').trim()}
                                                </>
                                            ) : (
                                                notif.message
                                            )}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-1">
                                            {timeAgo(notif.createdAt)}
                                        </p>
                                    </div>

                                    {/* Unread indicator */}
                                    {!notif.isRead && (
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0"></div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}

                    {/* Empty state */}
                    {friendRequests.length === 0 && otherNotifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 px-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm font-medium">No notifications yet</p>
                            <p className="text-gray-400 text-xs mt-1">You'll see notifications here when someone interacts with you</p>
                        </div>
                    )}
                </div>
            </div>
                </Portal>
        </>
    );
}

export default Notifications;