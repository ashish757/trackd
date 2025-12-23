import { useGetFriendRequestsQuery } from '../redux/friend/friendApi';
import { Link } from 'react-router-dom';
import {useState} from "react";
import Portal from "./Portal.tsx";


const Notifications = () => {
    const { data } = useGetFriendRequestsQuery();
    const [showNotifications, setShowNotifications] = useState(false);

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

    const onClose = () => {
        setShowNotifications(false);
    }




    return (
        <>
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors" >
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
            </button>


                <Portal layer="modal">


            {/* Backdrop Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 transition-opacity z-40 ${showNotifications ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <div className={`fixed right-0 top-0 h-screen w-80 bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out transform 
                ${showNotifications ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-center px-4 py-4 border-b-gray-200 border-b">
                    <h2 className="text-xl text-gray-700">Notifications</h2>
                </div>

                {/* List Content */}
                <div className="h-[calc(100vh-64px)] overflow-y-auto divide-y divide-gray-100">
                    {data && data.length > 0 ? (
                        data.map((req, index) => (
                            <div
                                key={index}
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
                                            onClick={onClose} // Close sidebar on click
                                            className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            View Profile
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
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