import { useGetMutualFriendsQuery } from '../redux/friend/friendApi';
import { Users } from 'lucide-react';

interface MutualFriendsCountProps {
    targetUserId: string;
    className?: string;
}

/**
 * Displays count of mutual friends
 */
const MutualFriendsCount = ({ targetUserId, className = '' }: MutualFriendsCountProps) => {
    const { data: mutualFriends, isLoading, error } = useGetMutualFriendsQuery(targetUserId);

    // Don't show anything if loading, error, or no mutual friends
    if (isLoading || error || !mutualFriends || mutualFriends.length === 0) {
        return null;
    }

    return (
        <div className={`text-sm text-gray-600 flex items-center gap-1 ${className}`}>
            <Users size={14} />
            <span>{mutualFriends.length} mutual friend{mutualFriends.length !== 1 ? 's' : ''}</span>
        </div>
    );
};

export default MutualFriendsCount;

