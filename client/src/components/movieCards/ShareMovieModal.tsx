import { useState } from "react";
import { Send, X, CheckCircle2 } from "lucide-react";
import { useGetMyFriendsQuery } from "../../redux/friend/friendApi.ts";

interface Props {
    onClose: () => void;
    movieTitle?: string;
}

const ShareMovieModal = ({ onClose, movieTitle }: Props) => {
    const { data: friendList, isLoading: isFriendListLoading } = useGetMyFriendsQuery(undefined);


    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

    const toggleFriend = (friendId: string) => {
        setSelectedFriends((prev) =>
            prev.includes(friendId)
                ? prev.filter((id) => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleSend = () => {
        console.log("Sending to:", selectedFriends);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-fit flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Recommend {movieTitle ? `"${movieTitle}"` : ""}</h2>
                            { selectedFriends.length > 0 ? (
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                {selectedFriends.length} selected
                                </span> ) : null}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto flex-1 max-h-[calc(80vh-88px)]">
                    {isFriendListLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
                            ))}
                        </div>
                    ) : friendList && friendList.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {friendList.map((friend) => {
                                const isSelected = selectedFriends.includes(friend.id);
                                return (
                                    <div
                                        key={friend.id}
                                        onClick={() => toggleFriend(friend.id)}
                                        className={`relative flex flex-col items-center p-4 rounded-xl transition-all border ${
                                            isSelected
                                                ? "border-blue-400 bg-blue-50"
                                                : "border-gray-100 hover:border-gray-200 bg-white"
                                        }`}
                                    >
                                        {/* Selection Badge */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 text-blue-500">
                                                <CheckCircle2 className="h-5 w-5 fill-white" />
                                            </div>
                                        )}

                                        {friend.avatar ? (
                                            <img src={friend.avatar} alt={friend.name} className="w-16 h-16 rounded-full mb-3 object-cover shadow-sm" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold mb-3">
                                                {friend.name?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <p className={`text-sm font-semibold truncate w-full text-center ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                                            {friend.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate w-full text-center">@{friend.username}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No friends found.</p>
                        </div>
                    )}

            </div>

                {/* Modal Footer */}
                <div className="p-2 border-t border-gray-100 bg-gray-50">
                    <button
                        disabled={selectedFriends.length === 0}
                        onClick={handleSend}
                        className={`w-full py-3 rounded-lg font-semibold ${
                            selectedFriends.length > 0
                                ? "bg-blue-500 hover:bg-blue-600 text-gray-100"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        {selectedFriends.length > 0
                            ? `Send to ${selectedFriends.length} ${selectedFriends.length === 1 ? 'friend' : 'friends'}`
                            : 'Select a friend'}
                    </button>
                </div>
        </div>
        </div>
    );
};

export default ShareMovieModal;