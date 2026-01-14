-- CreateTable
CREATE TABLE "movie_recommendations" (
    "id" TEXT NOT NULL,
    "recommenderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "movieId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movie_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "movie_recommendations_receiverId_idx" ON "movie_recommendations"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "movie_recommendations_recommenderId_receiverId_movieId_key" ON "movie_recommendations"("recommenderId", "receiverId", "movieId");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- AddForeignKey
ALTER TABLE "movie_recommendations" ADD CONSTRAINT "movie_recommendations_recommenderId_fkey" FOREIGN KEY ("recommenderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_recommendations" ADD CONSTRAINT "movie_recommendations_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movie_recommendations" ADD CONSTRAINT "movie_recommendations_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
