-- Make friendship pairs unique regardless of direction
CREATE UNIQUE INDEX unique_friend_pair
    ON "FriendRequest" (
                        LEAST("senderId", "receiverId"),
                        GREATEST("senderId", "receiverId")
        );
