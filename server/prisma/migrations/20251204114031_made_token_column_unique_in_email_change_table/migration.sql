/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `email_change_table` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "email_change_table_token_key" ON "email_change_table"("token");
