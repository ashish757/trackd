/*
  Warnings:

  - You are about to drop the `user_movie_data` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_movie_entries` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MovieStatus" ADD VALUE 'WATCHING';
ALTER TYPE "MovieStatus" ADD VALUE 'DROPPED';
ALTER TYPE "MovieStatus" ADD VALUE 'ON_HOLD';

-- DropForeignKey
ALTER TABLE "public"."user_movie_data" DROP CONSTRAINT "user_movie_data_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_movie_data" DROP CONSTRAINT "user_movie_data_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_movie_entries" DROP CONSTRAINT "user_movie_entries_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_movie_entries" DROP CONSTRAINT "user_movie_entries_user_id_fkey";

-- DropTable
DROP TABLE "public"."user_movie_data";

-- DropTable
DROP TABLE "public"."user_movie_entries";

-- CreateTable
CREATE TABLE "user_movies" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "movie_id" INTEGER NOT NULL,
    "status" "MovieStatus" NOT NULL DEFAULT 'PLANNED',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_movies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_movies_user_id_status_idx" ON "user_movies"("user_id", "status");

-- CreateIndex
CREATE INDEX "user_movies_user_id_isFavorite_idx" ON "user_movies"("user_id", "isFavorite");

-- CreateIndex
CREATE UNIQUE INDEX "user_movies_user_id_movie_id_key" ON "user_movies"("user_id", "movie_id");

-- AddForeignKey
ALTER TABLE "user_movies" ADD CONSTRAINT "user_movies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_movies" ADD CONSTRAINT "user_movies_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
