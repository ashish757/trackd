import { useGetFriendRequestsQuery} from '../redux/friend/friendApi';
import { Link } from 'react-router-dom';

const Notifications = () => {

    const {data} = useGetFriendRequestsQuery();

    function timeAgo(date: string) {
        const now = new Date();
        const past = new Date(date);
        const diff = (now.getTime() - past.getTime()) / 1000; // seconds

        if (diff < 60) return `${Math.floor(diff)} sec ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;

        return past.toDateString(); // fallback for older dates
    }



    return (
        <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50
                animate-fadeIn overflow-hidden">

            {/* Header */}
            <div className="px-4 py-2 text-center text-sm font-semibold bg-neutral-100 border-b">
                Notifications
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">

                {data && data.length > 0 ? (
                    data.map((req, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 transition">

                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                                {req.sender.name[0].toUpperCase() || 'U'}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <p className="text-sm text-gray-600">
                                    Friend request from <strong className={"text-gray-900"}>{req.sender.name}</strong>
                                </p>

                                <p className="text-xs text-gray-500 mb-2">
                                    {timeAgo(req.createdAt)}
                                </p>

                                <div className="flex gap-2">
                                    <Link to={`/users/${req.sender.username}`}
                                        className="px-3 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                                    >
                                        View
                                    </Link>
                                </div>

                            </div>
                        </div>
                    ))
                ) : (
                    <div className="px-4 py-4 text-center text-sm text-gray-500">
                        No new notifications
                    </div>
                )}

            </div>
        </div>

    );
}

export default Notifications;