/*
  Warnings:

  - You are about to drop the `entry_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `list_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."entry_tags" DROP CONSTRAINT "entry_tags_movie_data_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."entry_tags" DROP CONSTRAINT "entry_tags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."list_entries" DROP CONSTRAINT "list_entries_list_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."list_entries" DROP CONSTRAINT "list_entries_movie_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."lists" DROP CONSTRAINT "lists_user_id_fkey";

-- DropTable
DROP TABLE "public"."entry_tags";

-- DropTable
DROP TABLE "public"."list_entries";

-- DropTable
DROP TABLE "public"."lists";

-- DropTable
DROP TABLE "public"."tags";

-- CreateTable
CREATE TABLE "user_movie_entries" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "movie_id" TEXT NOT NULL,
    "watchedAt" TEXT,
    "plannedAt" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_movie_entries_pkey" PRIMARY KEY ("id")
);
