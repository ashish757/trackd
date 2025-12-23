import { useState } from 'react';
import { useGetMutualFriendsQuery, type FriendT } from '../redux/friend/friendApi';
import { Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MutualFriendsCount from './MutualFriendsCount';
import { FriendListItemSkeleton } from './skeletons';

interface MutualFriendsProps {
    targetUserId: string;
    className?: string;
}

const MutualFriends = ({ targetUserId, }: MutualFriendsProps) => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const { data: mutualFriends, isLoading, error } = useGetMutualFriendsQuery(targetUserId, {
        skip: !showModal, // Only fetch when modal is opened
    });


    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleFriendClick = (username: string) => {
        setShowModal(false);
        navigate(`/user/${username}`);
    };

    return (
        <>
            <span className="cursor-pointer" onClick={() => setShowModal(true)}>
            <MutualFriendsCount targetUserId={targetUserId} />
            </span>


            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => handleCloseModal()}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Users size={20} />
                                Mutual Friends
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {isLoading ? (
                                <FriendListItemSkeleton count={3} />
                            ) : error ? (
                                <div className="text-center py-8">
                                    <p className="text-red-600">
                                        {'status' in error && error.status === 403
                                            ? 'You must be friends to view mutual friends'
                                            : 'Failed to load mutual friends'}
                                    </p>
                                </div>
                            ) : mutualFriends && mutualFriends.length > 0 ? (
                                <div className="space-y-2">
                                    {mutualFriends.map((friend: FriendT) => (
                                        <div
                                            key={friend.id}
                                            onClick={() => handleFriendClick(friend.username)}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            {/* Avatar */}
                                            <div className="shrink-0">
                                                {friend.avatar ? (
                                                    <img
                                                        src={friend.avatar}
                                                        alt={friend.name || friend.username}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                                        <span className="text-white font-semibold text-lg">
                                                            {(friend.name || friend.username).charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {friend.name || friend.username}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    @{friend.username}
                                                </p>
                                            </div>

                                            {/* Friend Count */}
                                            <div className="flex-shrink-0 text-xs text-gray-500">
                                                <Users size={14} className="inline mr-1" />
                                                {friend.friendCount}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Users size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No mutual friends found</p>
                                </div>
                            )}
                        </div>

                        {/* Footer with count */}
                        {mutualFriends && mutualFriends.length > 0 && (
                            <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-600">
                                {mutualFriends.length} mutual friend{mutualFriends.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default MutualFriends;

