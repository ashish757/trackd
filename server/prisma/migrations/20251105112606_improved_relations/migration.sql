/*
  Warnings:

  - You are about to drop the column `plannedAt` on the `user_movie_entries` table. All the data in the column will be lost.
  - You are about to drop the column `watchedAt` on the `user_movie_entries` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,movie_id]` on the table `user_movie_entries` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `movie_id` on the `user_movie_entries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `status` to the `user_movie_entries` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MovieStatus" AS ENUM ('WATCHED', 'PLANNED');

-- AlterTable
ALTER TABLE "user_movie_entries" DROP COLUMN "plannedAt",
DROP COLUMN "watchedAt",
DROP COLUMN "movie_id",
ADD COLUMN     "movie_id" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "MovieStatus" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_movie_entries_user_id_movie_id_key" ON "user_movie_entries"("user_id", "movie_id");

-- AddForeignKey
ALTER TABLE "user_movie_entries" ADD CONSTRAINT "user_movie_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_movie_entries" ADD CONSTRAINT "user_movie_entries_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
